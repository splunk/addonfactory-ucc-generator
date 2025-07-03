from splunk_add_on_ucc_framework.generators.html_files import AlertActionsHtml
from textwrap import dedent


def test_alert_html_generate_html_no_global_config(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    alert_html = AlertActionsHtml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
    )
    output = alert_html.generate()
    assert output == [{}]


def test_alert_html_generate_html_no_alerts(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    alert_html = AlertActionsHtml(global_config_for_conf_only_TA, input_dir, output_dir)
    output = alert_html.generate()
    assert output == [{}]
    assert not hasattr(alert_html, "_alert_settings")


def test_alert_html_generate_html_with_alerts(
    global_config_all_json,
    input_dir,
    output_dir,
):
    ta_name = global_config_all_json.product
    exp_fname = "test_alert.html"

    alert_html = AlertActionsHtml(global_config_all_json, input_dir, output_dir)
    output = alert_html.generate()

    expected_content = dedent(
        """
    <form class="form-horizontal form-complex">
    <div class="control-group">
        <label class="control-label" for="test_alert_name">Name <span class="required">*</span> </label>
        <div class="controls">
    <input type="text" name="action.test_alert.param.name"
            id="test_alert_name" />
                <span class="help-block">
            Please enter your name
        </span>
        </div>
    </div>
    <div class="control-group">
        <div class="controls">
            <label class="checkbox" for="test_alert_all_incidents">
                <input type="checkbox" name="action.test_alert.param.all_incidents" id="test_alert_all_incidents"  />
                All Incidents
            </label>
                <span class="help-block">
            Tick if you want to update all incidents/problems
        </span>
        </div>
    </div>
    <div class="control-group">
        <label class="control-label" for="test_alert_table_list">Table List  </label>
        <div class="controls">
    <select name="action.test_alert.param.table_list" id="test_alert_table_list">
            <option value="Incident">incident</option>
            <option value="Problem">problem</option>
    </select>
                <span class="help-block">
            Please select the table
        </span>
        </div>
    </div>
    <div class="control-group">
        <label class="control-label">Action:</label>
            <div class="controls">
                    <label class="radio" for="test_alert_action_Update">
                        <input type="radio"
                        name="action.test_alert.param.action" id="test_alert_action_Update" value="Update"
                         />
                        update
                    </label>
                    <label class="radio" for="test_alert_action_Delete">
                        <input type="radio"
                        name="action.test_alert.param.action" id="test_alert_action_Delete" value="Delete"
                         />
                        delete
                    </label>
                    <span class="help-block">
            Select the action you want to perform
        </span>
            </div>
    </div>
    <div class="control-group">
        <label class="control-label" for="test_alert_account">Select Account <span class="required">*</span> </label>
        <div class="controls">
            <splunk-search-dropdown name="action.test_alert.param.account" id="test_alert_account"
                    value-field="title"
                    label-field="title"
                    search="| rest /servicesNS/nobody/Splunk_TA_UCCExample/splunk_ta_uccexample_account | dedup title"
                    earliest="-4@h"
                    latest="now"
     />
                <span class="help-block">
            Select the account from the dropdown
        </span>
        </div>
    </div>
    </form>"""
    ).lstrip()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/data/ui/alerts/{exp_fname}",
            "content": expected_content,
        }
    ]
