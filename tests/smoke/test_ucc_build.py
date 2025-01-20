import sys
import os
import re
import tempfile
import logging
import json
from os import path
from pathlib import Path
from typing import Dict, Any

from splunk_add_on_ucc_framework.entity.interval_entity import CRON_REGEX
from tests.smoke import helpers
from tests.unit import helpers as unit_helpers
import addonfactory_splunk_conf_parser_lib as conf_parser

from splunk_add_on_ucc_framework.commands import build
from splunk_add_on_ucc_framework import __version__


def _compare_app_conf(expected_folder: str, actual_folder: str) -> None:
    # Comparing default/app.conf, ignoring versions and build.
    default_app_conf_path = os.path.join("default", "app.conf")
    expected_default_app_conf_path = os.path.join(
        expected_folder,
        default_app_conf_path,
    )
    actual_default_app_conf_path = os.path.join(
        actual_folder,
        default_app_conf_path,
    )
    expected_app_conf = conf_parser.TABConfigParser()
    expected_app_conf.read(expected_default_app_conf_path)
    actual_app_conf = conf_parser.TABConfigParser()
    actual_app_conf.read(actual_default_app_conf_path)
    expected_app_conf_dict = expected_app_conf.item_dict()
    actual_app_conf_dict = actual_app_conf.item_dict()
    del expected_app_conf_dict["install"]["build"]
    del expected_app_conf_dict["launcher"]["version"]
    del expected_app_conf_dict["id"]["version"]
    del actual_app_conf_dict["install"]["build"]
    del actual_app_conf_dict["launcher"]["version"]
    del actual_app_conf_dict["id"]["version"]
    assert expected_app_conf_dict == actual_app_conf_dict


def test_ucc_generate():
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_everything",
        "package",
    )
    build.generate(source=package_folder)


def test_ucc_generate_with_config_param():
    """
    Checks whether the package is build when the `config` flag is provided in the CLI.
    Check if globalConfig and app.manifest contains current ucc version
    """

    def check_ucc_versions(parent_folder):
        gc_appserver = path.join(
            parent_folder,
            "Splunk_TA_UCCExample",
            "appserver",
            "static",
            "js",
            "build",
            "globalConfig.json",
        )
        gc_root = config_path

        with open(gc_appserver) as _f:
            global_config = json.load(_f)

        assert global_config["meta"]["_uccVersion"] == __version__

        with open(gc_root) as _f:
            global_config = json.load(_f)

        assert "_uccVersion" not in global_config["meta"]

    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_everything",
        "package",
    )
    config_path = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_everything",
        "globalConfig.json",
    )
    with tempfile.TemporaryDirectory(prefix="ucc") as temp:
        with open(config_path) as fp:
            cfg = json.load(fp)

        cfg["meta"]["_uccVersion"] = "0.0.1"

        with open(config_path, "w") as fp:
            json.dump(cfg, fp)

        build.generate(
            source=package_folder, config_path=config_path, output_directory=temp
        )

        check_ucc_versions(temp)


def test_ucc_generate_with_everything(caplog):
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_everything",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_everything",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
        _compare_app_conf(expected_folder, actual_folder)
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("appserver", "static", "test icon.png"),
            ("default", "alert_actions.conf"),
            ("default", "eventtypes.conf"),
            ("default", "inputs.conf"),
            ("default", "restmap.conf"),
            ("default", "tags.conf"),
            ("default", "splunk_ta_uccexample_settings.conf"),
            ("default", "web.conf"),
            ("default", "server.conf"),
            ("default", "commands.conf"),
            ("default", "searchbnf.conf"),
            ("default", "data", "ui", "alerts", "test_alert.html"),
            ("default", "data", "ui", "nav", "default.xml"),
            ("default", "data", "ui", "views", "configuration.xml"),
            ("default", "data", "ui", "views", "inputs.xml"),
            ("default", "data", "ui", "views", "dashboard.xml"),
            ("default", "data", "ui", "views", "splunk_ta_uccexample_redirect.xml"),
            ("bin", "helper_one.py"),
            ("bin", "helper_two.py"),
            ("bin", "example_input_one.py"),
            ("bin", "example_input_two.py"),
            ("bin", "example_input_three.py"),
            ("bin", "example_input_four.py"),
            ("bin", "import_declare_test.py"),
            ("bin", "countmatchescommand.py"),
            ("bin", "countmatches.py"),
            ("bin", "filter.py"),
            ("bin", "filtercommand.py"),
            ("bin", "generatetext.py"),
            ("bin", "generatetextcommand.py"),
            ("bin", "generatetextcommand.py"),
            ("bin", "sumcommand.py"),
            ("bin", "sum.py"),
            ("bin", "splunk_ta_uccexample_rh_account.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_one.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_two.py"),
            ("bin", "splunk_ta_uccexample_rh_three_custom.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_four.py"),
            ("bin", "splunk_ta_uccexample_custom_rh.py"),
            ("bin", "splunk_ta_uccexample_rh_oauth.py"),
            ("bin", "splunk_ta_uccexample_rh_settings.py"),
            ("bin", "splunk_ta_uccexample_validate_account_rh.py"),
            ("bin", "myAlertLogic.py"),
            ("bin", "test_alert.py"),
            ("README", "alert_actions.conf.spec"),
            ("README", "inputs.conf.spec"),
            ("README", "splunk_ta_uccexample_account.conf.spec"),
            ("README", "splunk_ta_uccexample_settings.conf.spec"),
            ("metadata", "default.meta"),
        ]
        helpers.compare_file_content(
            files_to_be_equal,
            expected_folder,
            actual_folder,
        )
        files_to_exist = [
            ("static", "appIcon.png"),
            ("static", "appIcon_2x.png"),
            ("static", "appIconAlt.png"),
            ("static", "appIconAlt_2x.png"),
            ("appserver", "static", "js", "build", "entry_page.js"),
        ]
        for f in files_to_exist:
            actual_file_path = path.join(actual_folder, *f)
            assert path.exists(actual_file_path)

        # when custom files are provided, default files shouldn't be shipped
        files_should_be_absent = [
            ("appserver", "static", "alerticon.png"),
            ("bin", "splunk_ta_uccexample", "modalert_test_alert_helper.py"),
            ("appserver", "static", "js", "build", "entry_page.js.map"),
            ("lib", "__pycache__"),
        ]
        for af in files_should_be_absent:
            actual_file_path = path.join(actual_folder, *af)
            assert not path.exists(actual_file_path)

        _compare_expandable_tabs_and_entities(package_folder, actual_folder)

        # check missing validators warnings
        pattern = re.compile(
            r"^The field '([^']+)' does not have a validator specified."
        )
        entities = set()
        for record in caplog.records:
            if record.funcName != "_validate_entity_validators":
                continue

            match = pattern.search(record.msg)
            assert match, record.msg

            entities.add(match.group(1))

        assert "example_help_link" not in entities
        assert "loglevel" not in entities
        assert "field_no_validators" in entities
        assert "field_no_validators_suppressed" not in entities


def test_ucc_generate_with_multiple_inputs_tabs():
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_multi_input",
        "package",
    )
    build.generate(source=package_folder)


def test_ucc_generate_with_configuration():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_configuration",
            "package",
        )
        build.generate(
            source=package_folder, output_directory=temp_dir, addon_version="1.1.1"
        )

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_configuration",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
        _compare_app_conf(expected_folder, actual_folder)
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "restmap.conf"),
            ("default", "splunk_ta_uccexample_settings.conf"),
            ("default", "web.conf"),
            ("default", "server.conf"),
            ("default", "data", "ui", "nav", "default.xml"),
            ("default", "data", "ui", "views", "configuration.xml"),
            ("default", "data", "ui", "views", "splunk_ta_uccexample_redirect.xml"),
            ("bin", "import_declare_test.py"),
            ("bin", "splunk_ta_uccexample_rh_account.py"),
            ("bin", "splunk_ta_uccexample_rh_oauth.py"),
            ("bin", "splunk_ta_uccexample_rh_settings.py"),
            ("README", "splunk_ta_uccexample_account.conf.spec"),
            ("README", "splunk_ta_uccexample_settings.conf.spec"),
            ("metadata", "default.meta"),
            ("appserver", "static", "openapi.json"),
        ]
        helpers.compare_file_content(
            files_to_be_equal,
            expected_folder,
            actual_folder,
        )
        files_to_exist = [
            ("static", "appIcon.png"),
            ("static", "appIcon_2x.png"),
            ("static", "appIconAlt.png"),
            ("static", "appIconAlt_2x.png"),
        ]
        for f in files_to_exist:
            actual_file_path = path.join(actual_folder, *f)
            assert path.exists(actual_file_path)


def test_ucc_generate_with_configuration_files_only():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_no_global_config",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_no_global_config",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
        _compare_app_conf(expected_folder, actual_folder)
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "eventtypes.conf"),
            ("default", "props.conf"),
            ("default", "tags.conf"),
            ("metadata", "default.meta"),
        ]
        helpers.compare_file_content(
            files_to_be_equal,
            expected_folder,
            actual_folder,
        )


def test_ucc_generate_openapi_with_configuration_files_only():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_no_global_config",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        actual_file_path = path.join(
            temp_dir, "Splunk_TA_UCCExample", "appserver", "static", "openapi.json"
        )
        assert not path.exists(actual_file_path)


def test_ucc_build_verbose_mode(caplog):
    """
    Tests results will test both no option and --verbose mode of build command.
    No option provides a short summary of file created in manner: File creation summary: <result>
    --verbose shows each file specific case and short summary
    """

    caplog.set_level(logging.INFO, logger="ucc-gen")

    def extract_summary_logs():
        return_logs = []
        copy_logs = False

        message_to_start = (
            "Detailed information about created/copied/modified/conflict files"
        )
        message_to_end = "File creation summary:"

        for record in caplog.records:
            if record.message == message_to_start:
                copy_logs = True

            if copy_logs:
                return_logs.append(record)

            if record.message.startswith(message_to_end):
                copy_logs = False

        return return_logs

    def generate_expected_log():
        def append_appserver_content(raw_expected_logs):
            path_len = len(app_server_lib_path) + 1
            excluded_files = ["redirect_page.js", "redirect.html"]

            for full_path, dir, files in os.walk(app_server_lib_path):
                if files:
                    relative_path = full_path[path_len:]
                    for file in files:
                        if file not in excluded_files:
                            relative_file_path = os.path.join(relative_path, file)
                            key_to_insert = (
                                str(relative_file_path).ljust(80) + "created\u001b[0m"
                            )
                            raw_expected_logs[key_to_insert] = "INFO"

        def summarize_types(raw_expected_logs):
            summary_counter = {"created": 0, "copied": 0, "modified": 0, "conflict": 0}

            for log in raw_expected_logs:
                end = log.find("\u001b[0m")
                if end > 1:
                    string_end = end - 10
                    operation_type = log[string_end:end].strip()
                    summary_counter[operation_type] += 1

            summary_message = (
                f'File creation summary: created: {summary_counter.get("created")}, '
                f'copied: {summary_counter.get("copied")}, '
                f'modified: {summary_counter.get("modified")}, '
                f'conflict: {summary_counter.get("conflict")}'
            )
            raw_expected_logs[summary_message] = "INFO"

        with open(expected_logs_path) as f:
            raw_expected_logs = json.load(f)

        append_appserver_content(raw_expected_logs)
        summarize_types(raw_expected_logs)

        return raw_expected_logs

    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_files_conflict_test",
            "package",
        )

        expected_logs_path = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "expected_addons",
            "expected_files_conflict_test",
            "expected_log.json",
        )

    build.generate(
        source=package_folder,
        output_directory=temp_dir,
        verbose_file_summary_report=True,
        ui_source_map=True,
    )

    app_server_lib_path = os.path.join(build.internal_root_dir, "package")

    summary_logs = extract_summary_logs()

    expected_logs = generate_expected_log()

    assert len(summary_logs) == len(expected_logs)

    for log_line in summary_logs:
        # summary messages must be the same but might come in different order
        assert log_line.message in expected_logs.keys()
        assert log_line.levelname == expected_logs[log_line.message]


def test_ucc_generate_with_everything_uccignore(caplog):
    """
    Checks the deprecation warning of .uccignore present in a repo with
    its functionality still working.
    """
    # clean-up cached `additional_packaging` module when running all tests
    sys.modules.pop("additional_packaging", "")
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_everything_uccignore",
            "package",
        )
        # create `.uccignore` temporarily
        ucc_file = path.join(path.dirname(package_folder), ".uccignore")
        f = open(ucc_file, "w+")
        f.write(
            """**/**one.py
bin/splunk_ta_uccexample_rh_example_input_two.py
bin/wrong_pattern
"""
        )
        f.close()
        build.generate(source=package_folder, output_directory=temp_dir)

        expected_warning_msg = (
            f"No files found for the specified pattern: "
            f"{temp_dir}/Splunk_TA_UCCExample/bin/wrong_pattern"
        )

        edm_paths = {
            f"{temp_dir}/Splunk_TA_UCCExample/bin/splunk_ta_uccexample_rh_example_input_one.py",
            f"{temp_dir}/Splunk_TA_UCCExample/bin/helper_one.py",
            f"{temp_dir}/Splunk_TA_UCCExample/bin/example_input_one.py",
            f"{temp_dir}/Splunk_TA_UCCExample/bin/splunk_ta_uccexample_rh_example_input_two.py",
        }
        removed = set(
            caplog.text.split("Removed:", 1)[1].split("INFO")[0].strip().split("\n")
        )
        exp_msg = (
            "The `.uccignore` feature has been deprecated from UCC and is planned to be removed after May 2025. "
            "To achieve the similar functionality use additional_packaging.py."
            "\nRefer: https://splunk.github.io/addonfactory-ucc-generator/additional_packaging/."
        )
        exp_info_msg = (
            "additional_packaging.py is present but does not have `additional_packaging`."
            " Skipping additional packaging."
        )

        assert exp_msg in caplog.text
        assert exp_info_msg in caplog.text
        assert expected_warning_msg in caplog.text
        assert edm_paths == removed
        # on successful assertion, we delete the file
        os.remove(ucc_file)

        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")
        # when custom files are provided, default files shouldn't be shipped
        files_should_be_absent = [
            ("bin", "splunk_ta_uccexample_rh_example_input_one.py"),
            ("bin", "example_input_one.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_two.py"),
        ]
        for af in files_should_be_absent:
            actual_file_path = path.join(actual_folder, *af)
            assert not path.exists(actual_file_path)


def test_ucc_generate_with_everything_cleanup_output_files():
    """
    Checks the functioning of addtional_packaging.py's `cleanup_output_files`  present in a repo.
    Compares only the files that shouldn't be present in the output directory.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_everything_uccignore",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")
        # when custom files are provided, default files shouldn't be shipped
        files_should_be_absent = [
            ("bin", "example_input_one.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_one.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_two.py"),
            ("default", "redundant.conf"),
            ("default", "nav", "views", "file_copied_from_source_code.xml"),
        ]
        for af in files_should_be_absent:
            actual_file_path = path.join(actual_folder, *af)
            assert not path.exists(actual_file_path)


def test_ucc_generate_only_one_tab():
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_only_one_tab",
        "package",
    )
    build.generate(source=package_folder)


def test_ucc_generate_with_ui_source_map():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_everything",
            "package",
        )
        build.generate(
            source=package_folder, output_directory=temp_dir, ui_source_map=True
        )

        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        files_to_exist = [
            ("appserver", "static", "js", "build", "entry_page.js"),
            ("appserver", "static", "js", "build", "entry_page.js.map"),
        ]
        for f in files_to_exist:
            expected_file_path = path.join(actual_folder, *f)
            assert path.exists(expected_file_path)


def test_ucc_generate_with_all_alert_types(tmp_path, caplog):
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_only_one_tab",
        "package",
    )
    tmp_file_gc = tmp_path / "globalConfig.json"
    unit_helpers.copy_testdata_gc_to_tmp_file(
        tmp_file_gc, "valid_config_all_alerts.json"
    )

    build.generate(source=package_folder, config_path=str(tmp_file_gc))

    # there are 2 occurrences of 'activeResponse' in 'valid_config_all_alerts.json'
    assert (
        caplog.messages.count(
            "'activeResponse' is deprecated. Please use 'adaptiveResponse' instead."
        )
        == 2
    )
    assert "Updated globalConfig schema to version 0.0.4" in caplog.messages


def _compare_expandable_tabs_and_entities(package_dir: str, output_dir: str) -> None:
    with open(Path(package_dir) / os.pardir / "globalConfig.json") as fp:
        global_config = json.load(fp)

    with open(
        Path(output_dir) / "appserver" / "static" / "js" / "build" / "globalConfig.json"
    ) as fp:
        static_config = json.load(fp)

    _compare_logging_tab(global_config, static_config)
    _compare_interval_entities(global_config, static_config)


def _compare_logging_tab(
    global_config: Dict[Any, Any], static_config: Dict[Any, Any]
) -> None:
    tab_exists = False
    num = 0

    for num, tab in enumerate(global_config["pages"]["configuration"]["tabs"]):
        if tab.get("type", "") == "loggingTab":
            tab_exists = True
            break

    assert tab_exists

    static_tab = static_config["pages"]["configuration"]["tabs"][num]

    assert "type" not in static_tab
    assert static_tab == {
        "entity": [
            {
                "defaultValue": "INFO",
                "field": "loglevel",
                "label": "Log level",
                "options": {
                    "autoCompleteFields": [
                        {"label": "DEBUG", "value": "DEBUG"},
                        {"label": "INFO", "value": "INFO"},
                        {"label": "WARNING", "value": "WARNING"},
                        {"label": "ERROR", "value": "ERROR"},
                        {"label": "CRITICAL", "value": "CRITICAL"},
                    ],
                    "disableSearch": True,
                },
                "type": "singleSelect",
                "required": True,
                "validators": [
                    {
                        "errorMsg": "Log level must be one of: DEBUG, "
                        "INFO, WARNING, ERROR, CRITICAL",
                        "pattern": "^DEBUG|INFO|WARNING|ERROR|CRITICAL$",
                        "type": "regex",
                    }
                ],
            }
        ],
        "name": "logging",
        "title": "Logging",
    }


def _compare_interval_entities(
    global_config: Dict[Any, Any], static_config: Dict[Any, Any]
) -> None:
    for lmbd in (
        lambda x: x["pages"]["configuration"]["tabs"],
        lambda x: x.get("alerts", []),
        lambda x: x["pages"].get("inputs", {}).get("services", []),
    ):
        for item_num, item in enumerate(lmbd(global_config)):
            for entity_num, entity in enumerate(item.get("entity", [])):
                if entity.get("type", "") == "interval":
                    assert entity == {
                        "field": "interval",
                        "help": "Time interval of the data input, in seconds.",
                        "label": "Interval",
                        "required": True,
                        "type": "interval",
                    }
                    assert lmbd(static_config)[item_num]["entity"][entity_num] == {
                        "field": "interval",
                        "help": "Time interval of the data input, in seconds.",
                        "label": "Interval",
                        "required": True,
                        "type": "text",
                        "validators": [
                            {
                                "errorMsg": "Interval must be either a non-negative number, CRON interval or -1.",
                                "pattern": CRON_REGEX,
                                "type": "regex",
                            }
                        ],
                    }
