import os.path
import shutil
from unittest import mock
import pytest
from os import path
import json

from splunk_add_on_ucc_framework import dashboard
import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework import global_config as gc

expected_folder = path.join(path.dirname(__file__), "expected_results")
definition_jsons_path = dashboard.default_definition_json_filename

custom_definition = {
    "visualizations": {
        "custom_dashboard_main_label": {
            "type": "splunk.markdown",
            "options": {"markdown": "# My custom dashboard", "fontSize": "extraLarge"},
        }
    },
    "dataSources": {
        "custom_addon_version_ds": {
            "type": "ds.search",
            "options": {
                "query": "| rest services/apps/local/demo_addon_for_splunk splunk_server=local | fields version"
            },
        }
    },
    "inputs": {},
    "layout": {
        "type": "grid",
        "globalInputs": [],
        "structure": [
            {
                "item": "custom_dashboard_main_label",
                "position": {"x": 20, "y": 500, "w": 300, "h": 50},
            }
        ],
    },
}


def test_generate_only_default_dashboard(global_config_all_json, tmp_path):
    definition_jsons_file_path = tmp_path / "custom"

    dashboard.generate_dashboard(
        global_config_all_json,
        helpers.get_testdata_file_path("valid_config.json"),
        "Splunk_TA_UCCExample",
        str(definition_jsons_file_path),
    )

    for definition_path in definition_jsons_path.values():
        with open(os.path.join(expected_folder, definition_path)) as file:
            expected_content = file.read()

        with open(os.path.join(definition_jsons_file_path, definition_path)) as file:
            assert expected_content == file.read()


@pytest.fixture
def setup(tmp_path):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_custom_dashboard.json"
    )
    global_config = gc.GlobalConfig.from_file(global_config_path)
    tmp_ta_path = tmp_path / "test_ta"
    os.makedirs(tmp_ta_path)
    custom_dash_path = os.path.join(tmp_ta_path, "custom_dashboard.json")
    definition_jsons_file_path = tmp_path / "custom"
    yield global_config, global_config_path, custom_dash_path, definition_jsons_file_path
    shutil.rmtree(tmp_ta_path)


def test_generate_dashboard_default_and_custom_components(setup, tmp_path):
    (
        global_config,
        global_config_path,
        custom_dash_path,
        definition_jsons_file_path,
    ) = setup

    with open(custom_dash_path, "w") as file:
        file.write(json.dumps(custom_definition))

    with mock.patch("os.path.abspath") as path_abs:
        path_abs.return_value = custom_dash_path
        dashboard.generate_dashboard(
            global_config,
            global_config_path,
            "Splunk_TA_UCCExample",
            str(definition_jsons_file_path),
        )

    definition_custom = definition_jsons_path.copy()
    definition_custom.update({"custom": "custom.json"})

    for definition_path in definition_custom.values():
        with open(os.path.join(expected_folder, definition_path)) as file:
            expected_content = file.read()

        with open(os.path.join(definition_jsons_file_path, definition_path)) as file:
            if definition_path == "custom.json":
                assert json.loads(expected_content) == custom_definition
                break
            assert expected_content == file.read()


def test_generate_dashboard_only_custom_components(setup, tmp_path):
    _, _, custom_dash_path, definition_jsons_file_path = setup

    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_custom_dashboard.json"
    )
    global_config = gc.GlobalConfig.from_file(global_config_path)

    with open(custom_dash_path, "w") as file:
        file.write(json.dumps(custom_definition))

    with mock.patch("os.path.abspath") as path_abs:
        path_abs.return_value = custom_dash_path
        dashboard.generate_dashboard(
            global_config,
            global_config_path,
            "Splunk_TA_UCCExample",
            str(definition_jsons_file_path),
        )

    for definition_path in definition_jsons_path.values():
        with pytest.raises(FileNotFoundError):
            with open(
                os.path.join(definition_jsons_file_path, definition_path)
            ) as file:
                continue

    with open(os.path.join(expected_folder, "custom.json")) as file:
        expected_content = file.read()

    with open(os.path.join(definition_jsons_file_path, "custom.json")):
        assert json.loads(expected_content) == custom_definition


def test_generate_dashboard_with_custom_components_no_file(setup, tmp_path, caplog):
    (
        global_config,
        global_config_path,
        custom_dash_path,
        definition_jsons_file_path,
    ) = setup
    custom_dashboard_path = os.path.abspath(
        os.path.join(
            global_config_path,
            os.pardir,
            "custom_dashboard.json",
        )
    )
    expected_msg = f"Custom dashboard page set in globalConfig.json but file {custom_dashboard_path} not found"
    with pytest.raises(SystemExit):
        dashboard.generate_dashboard(
            global_config,
            global_config_path,
            "Splunk_TA_UCCExample",
            str(definition_jsons_file_path),
        )
    assert expected_msg in caplog.text


def test_generate_dashboard_with_custom_components_invalid_xml_file(
    setup, tmp_path, caplog
):
    (
        global_config,
        global_config_path,
        custom_dash_path,
        definition_jsons_file_path,
    ) = setup
    with open(custom_dash_path, "w") as file:
        file.write("")

    expected_msg = f"{custom_dash_path} it's not a valid json file"
    with pytest.raises(SystemExit):
        with mock.patch("os.path.abspath") as path_abs:
            path_abs.return_value = custom_dash_path
            dashboard.generate_dashboard(
                global_config,
                global_config_path,
                "Splunk_TA_UCCExample",
                str(definition_jsons_file_path),
            )
    assert expected_msg in caplog.text


def test_generate_dashboard_with_custom_components_no_content(setup, tmp_path, caplog):
    (
        global_config,
        global_config_path,
        custom_dash_path,
        definition_jsons_file_path,
    ) = setup

    with open(custom_dash_path, "w") as file:
        file.write("{}")

    with pytest.raises(SystemExit):
        with mock.patch("os.path.abspath") as path_abs:
            path_abs.return_value = custom_dash_path
            dashboard.generate_dashboard(
                global_config,
                global_config_path,
                "Splunk_TA_UCCExample",
                str(definition_jsons_file_path),
            )

    expected_msg = (
        f"Custom dashboard page set in globalConfig.json but custom content not found. "
        f"Please verify if file {custom_dash_path} has a proper structure "
        f"(see https://splunk.github.io/addonfactory-ucc-generator/dashboard/)"
    )
    assert expected_msg in caplog.text


@pytest.mark.parametrize(
    "custom_settings, expected_result",
    [
        (
            ("source", ["*cond1", "*cond2"]),
            'index=_internal source=*license_usage.log type=Usage (s IN ("*cond1","*cond2")) |',
        ),
        (
            ("sourcetype", ["*cond1*"]),
            'index=_internal source=*license_usage.log type=Usage (st IN ("*cond1*")) |',
        ),
        (
            ("host", ["*cond1", "cond2*", "cond3*"]),
            'index=_internal source=*license_usage.log type=Usage (h IN ("*cond1","cond2*","cond3*")) |',
        ),
        (
            ("index", ["cond1", "cond2"]),
            'index=_internal source=*license_usage.log type=Usage (idx IN ("cond1","cond2")) |',
        ),
    ],
)
def test_custom_license_usage_search(
    setup, tmp_path, caplog, custom_settings, expected_result
):
    (
        global_config,
        global_config_path,
        custom_dash_path,
        definition_jsons_file_path,
    ) = setup

    settings = {
        "settings": {
            "custom_license_usage": {
                "determine_by": custom_settings[0],
                "search_condition": custom_settings[1],
            }
        }
    }

    global_config.dashboard.update(settings)

    with open(custom_dash_path, "w") as file:
        file.write(json.dumps(custom_definition))

    with mock.patch("os.path.abspath") as path_abs:
        path_abs.return_value = custom_dash_path
        dashboard.generate_dashboard(
            global_config,
            global_config_path,
            "Splunk_TA_UCCExample",
            str(definition_jsons_file_path),
        )

    with open(
        os.path.join(definition_jsons_file_path, "overview_definition.json")
    ) as file:
        def_json = json.loads(file.read())
        query = def_json["dataSources"]["overview_data_volume_ds"]["options"]["query"]
        assert query.startswith(expected_result)

    with open(
        os.path.join(definition_jsons_file_path, "data_ingestion_tab_definition.json")
    ) as file:
        def_json = json.loads(file.read())
        query_1 = def_json["dataSources"]["data_ingestion_data_volume_ds"]["options"][
            "query"
        ]
        assert query_1.startswith(expected_result)

        for el in def_json["inputs"]["data_ingestion_table_input"]["options"]["items"]:
            if el["label"] in ("Source type", "Source", "Host", "Index"):
                assert el["value"].startswith(expected_result)
