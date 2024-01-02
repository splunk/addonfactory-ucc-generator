import os.path
import shutil
from unittest import mock
import pytest

from splunk_add_on_ucc_framework import dashboard
import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework import global_config as gc

default_dashboard_content_start = """<form version="1.1">
  <label>Monitoring Dashboard</label>
  <fieldset submitButton="false">
    <input type="time" token="log_time">
      <label>Time for logs</label>
      <default>
        <earliest>-4h@m</earliest>
        <latest>now</latest>
      </default>
    </input>
  </fieldset>
  <row>
    <panel>
      <title>Add-on version</title>
      <single>
        <search>
          <query>| rest services/apps/local/Splunk_TA_UCCExample splunk_server=local | fields version</query>
          <earliest>-15m</earliest>
          <latest>now</latest>
        </search>
        <option name="drilldown">none</option>
        <option name="rangeColors">["0x53a051","0x0877a6","0xf8be34","0xf1813f","0xdc4e41"]</option>
        <option name="refresh.display">progressbar</option>
        <option name="useThousandSeparators">0</option>
      </single>
    </panel>
  </row>
  <row>
    <panel>
      <title>Events ingested by sourcetype</title>
      <chart>
        <search>
          <query>index=_internal source=*splunk_ta_uccexample* action=events_ingested
| timechart avg(n_events) by sourcetype_ingested</query>
          <earliest>$log_time.earliest$</earliest>
          <latest>$log_time.latest$</latest>
        </search>
        <option name="charting.chart">line</option>
        <option name="charting.drilldown">none</option>
      </chart>
    </panel>
  </row>
  <row>
    <panel>
      <title>Errors in the add-on</title>
      <event>
        <search>
          <query>index=_internal source=*splunk_ta_uccexample* ERROR</query>
          <earliest>$log_time.earliest$</earliest>
          <latest>$log_time.latest$</latest>
        </search>
        <option name="list.drilldown">none</option>
        <option name="maxLines">10</option>
        <option name="raw.drilldown">none</option>
        <option name="refresh.display">progressbar</option>
        <option name="rowNumbers">0</option>
        <option name="type">list</option>
      </event>
    </panel>
  </row>
"""

default_dashboard_content_end = "</form>"

custom_dashboard_components = """<row>
    <panel>
        <title>CUSTOM ROW 1</title>
    </panel>
</row>
<row>
<panel>
    <title>CUSTOM ROW 2</title>
    <chart>
        <search>
            <query>index=_internal sourcetype="test*" "is processing SQS messages:" sqs_msg_action
            </query>
            <earliest>-14d@d</earliest>
            <latest>now</latest>
            <sampleRatio>1</sampleRatio>
        </search>
        <option name="charting.axisTitleX.text">Time</option>
        <option name="charting.axisTitleX.visibility">visible</option>
    </chart>
</panel>
</row>
"""


def test_generate_dashboard_when_dashboard_does_not_exist(
    global_config_all_json, tmp_path
):
    dashboard_xml_file_path = tmp_path / "dashboard.xml"

    dashboard.generate_dashboard(
        global_config_all_json,
        "Splunk_TA_UCCExample",
        str(dashboard_xml_file_path),
    )

    expected_content = default_dashboard_content_start + default_dashboard_content_end

    with open(dashboard_xml_file_path) as dashboard_xml_file:
        assert expected_content == dashboard_xml_file.read()


def test_generate_dashboard_when_dashboard_already_exists(
    global_config_all_json, tmp_path, caplog
):
    original_dashboard_xml_content = "<content>Original Dashboard</content>"
    original_dashboard_xml_file_path = tmp_path / "dashboard.xml"
    with open(original_dashboard_xml_file_path, "w") as original_dashboard_xml_file:
        original_dashboard_xml_file.write(original_dashboard_xml_content)

    dashboard.generate_dashboard(
        global_config_all_json,
        "Splunk_TA_UCCExample",
        str(tmp_path),
    )

    expected_log_warning_message = (
        f"dashboard.xml file already exists @ "
        f"{str(tmp_path)}, not overwriting "
        f"the existing dashboard file."
    )
    assert expected_log_warning_message in caplog.text


@pytest.fixture
def setup(tmp_path):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_custom_dashboard.json"
    )
    global_config = gc.GlobalConfig(global_config_path, False)
    tmp_ta_path = tmp_path / "test_ta"
    os.makedirs(tmp_ta_path)
    custom_dash_path = os.path.join(tmp_ta_path, "dashboard_components.xml")
    dashboard_path = tmp_path / "dashboard.xml"
    yield global_config, custom_dash_path, dashboard_path
    shutil.rmtree(tmp_ta_path)


def test_generate_dashboard_with_custom_components(setup, tmp_path):
    global_config, custom_dash_path, dashboard_path = setup
    with open(custom_dash_path, "w") as file:
        file.write(
            "<custom-dashboard>" + custom_dashboard_components + "</custom-dashboard>"
        )

    with mock.patch("os.path.abspath") as path_abs:
        path_abs.return_value = custom_dash_path
        dashboard.generate_dashboard(
            global_config,
            "Splunk_TA_UCCExample",
            str(dashboard_path),
        )

    expected_content = (
        default_dashboard_content_start
        + custom_dashboard_components
        + default_dashboard_content_end
    )

    with open(dashboard_path) as dashboard_xml_file:
        assert expected_content == dashboard_xml_file.read()


def test_generate_dashboard_with_custom_components_no_file(setup, tmp_path, caplog):
    global_config, custom_dash_path, dashboard_path = setup
    custom_dashboard_path = os.path.abspath(
        os.path.join(
            global_config.original_path,
            os.pardir,
            "dashboard_components.xml",
        )
    )
    expected_msg = f"Custom dashboard page set in globalConfig.json but file {custom_dashboard_path} not found"
    with pytest.raises(SystemExit):
        dashboard.generate_dashboard(
            global_config,
            "Splunk_TA_UCCExample",
            str(dashboard_path),
        )
    assert expected_msg in caplog.text


def test_generate_dashboard_with_custom_components_invalid_xml_file(
    setup, tmp_path, caplog
):
    global_config, custom_dash_path, dashboard_path = setup
    with open(custom_dash_path, "w") as file:
        file.write("")

    expected_msg = f"{custom_dash_path} it's not a valid xml file"
    with pytest.raises(SystemExit):
        with mock.patch("os.path.abspath") as path_abs:
            path_abs.return_value = custom_dash_path
            dashboard.generate_dashboard(
                global_config,
                "Splunk_TA_UCCExample",
                str(dashboard_path),
            )
    assert expected_msg in caplog.text


def test_generate_dashboard_with_custom_components_no_content(setup, tmp_path, caplog):
    global_config, custom_dash_path, dashboard_path = setup
    with open(custom_dash_path, "w") as file:
        file.write("<custom-dashboard></custom-dashboard>")

    with pytest.raises(SystemExit):
        with mock.patch("os.path.abspath") as path_abs:
            path_abs.return_value = custom_dash_path
            dashboard.generate_dashboard(
                global_config,
                "Splunk_TA_UCCExample",
                str(dashboard_path),
            )

    expected_msg = (
        f"Custom dashboard page set in globalConfig.json but custom content not found. "
        f"Please verify if file {custom_dash_path} has a proper structure "
        f"(see https://splunk.github.io/addonfactory-ucc-generator/dashboard/)"
    )
    assert expected_msg in caplog.text


def test_generate_dashboard_with_custom_components_invalid_root_tag(
    setup, tmp_path, caplog
):
    global_config, custom_dash_path, dashboard_path = setup
    with open(custom_dash_path, "w") as file:
        file.write("<custom-dashboard1></custom-dashboard1>")

    with pytest.raises(SystemExit):
        with mock.patch("os.path.abspath") as path_abs:
            path_abs.return_value = custom_dash_path
            dashboard.generate_dashboard(
                global_config,
                "Splunk_TA_UCCExample",
                str(dashboard_path),
            )

    expected_msg = (
        f"File {custom_dash_path} has invalid root tag 'custom-dashboard1'."
        f"Valid root tag is 'custom-dashboard'"
    )
    assert expected_msg in caplog.text


def test_generate_dashboard_with_custom_components_invalid_child_tag(
    setup, tmp_path, caplog
):
    global_config, custom_dash_path, dashboard_path = setup
    with open(custom_dash_path, "w") as file:
        file.write("<custom-dashboard><row></row><row123></row123></custom-dashboard>")

    with pytest.raises(SystemExit):
        with mock.patch("os.path.abspath") as path_abs:
            path_abs.return_value = custom_dash_path
            dashboard.generate_dashboard(
                global_config,
                "Splunk_TA_UCCExample",
                str(dashboard_path),
            )

    expected_msg = (
        f"In file {custom_dash_path}, there should only be tags 'row' under the root tag. "
        f"Child tag no.2 has invalid name 'row123'."
    )
    assert expected_msg in caplog.text
