import os.path

from splunk_add_on_ucc_framework import dashboard
from splunk_add_on_ucc_framework.commands.build import (
    generate_data_ui,
    copy_custom_dashboards,
)

custom_xml = [
    "\n",
    "<nav>\n",
    '<view name="inputs" />\n',
    '<view name="configuration" default="true" />\n',
    '<view name="dashboard" />\n',
    '<view name="search" />\n',
    '<view name="my_custom_dashboard_1" />\n',
    "</nav>\n",
]


def test_generate_dashboard_when_dashboard_does_not_exist(
    global_config_all_json, tmp_path
):
    dashboard_xml_file_path = tmp_path / "dashboard.xml"

    dashboard.generate_dashboard(
        global_config_all_json,
        "Splunk_TA_UCCExample",
        str(dashboard_xml_file_path),
    )

    expected_dashboard_content = """<form version="1.1">
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
</form>"""
    with open(dashboard_xml_file_path) as dashboard_xml_file:
        assert expected_dashboard_content == dashboard_xml_file.read()


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


def test_generate_custom_dashboards(global_config_all_json, tmp_path, caplog):
    tmp_src = os.path.join(tmp_path, "test_ta", "dashboards")
    os.makedirs(tmp_src)
    with open(os.path.join(tmp_src, "default.xml"), "w") as file:
        file.write("".join(custom_xml))

    with open(os.path.join(tmp_src, "my_custom_dashboard_1.xml"), "w") as file:
        file.write("<view><label>Custom dashboard</label></view>")

    tmp_out = tmp_path / "output"
    generate_data_ui(str(tmp_out), "test_addon", True, True)
    copy_custom_dashboards(str(tmp_src), str(os.path.join(tmp_out, "test_addon")))

    with open(
        os.path.join(
            tmp_out, "test_addon", "default", "data", "ui", "nav", "default.xml"
        )
    ) as file:
        content = file.readlines()

    assert content == custom_xml
    assert "my_custom_dashboard_1.xml" in os.listdir(
        os.path.join(tmp_out, "test_addon", "default", "data", "ui", "views")
    )
