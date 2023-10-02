import pytest
from pytest_splunk_addon_ui_smartx.base_test import UccTester

# from pytest_splunk_addon_ui_smartx.components.base_component import Selector
# from pytest_splunk_addon_ui_smartx.components.controls.button import Button

from tests.ui.pages.alert_action_page import AlertPage

#
#
# @pytest.fixture(autouse=True)
# def setup_alert(ucc_smartx_selenium_helper):
#     """
#     Skip the popups in Splunk before executing the tests
#     """
#     try:
#         # Splunk 8.x
#         if not setup_alert.first_execution:
#             return
#         AlertPage(ucc_smartx_selenium_helper, None, open_page=False)
#         intro_popup = Button(
#             ucc_smartx_selenium_helper.browser,
#             Selector(select=".modal-footer .btn-save"),
#         )
#         intro_popup.wait_to_be_clickable()
#         intro_popup.click()
#         setup_alert.first_execution = False
#
#         # Splunk 8.2.x
#         intro_popup = Button(
#             ucc_smartx_selenium_helper.browser,
#             Selector(select='[data-test="label"]'),
#         )
#         intro_popup.wait_to_be_clickable()
#         intro_popup.click()
#
#         # Splunk 8.0.x
#         important_changes_coming = Button(
#             ucc_smartx_selenium_helper.browser,
#             Selector(
#                 select='div[data-test-name="python3-notification-modal"] '
#                 'button[data-test="button"][data-appearance="secondary"]'
#             ),
#         )
#         important_changes_coming.wait_to_be_clickable()
#         important_changes_coming.click()
#     except:  # noqa: E722
#         pass
#
#
# setup_alert.first_execution = True


@pytest.fixture
def clean_alert(ucc_smartx_rest_helper):
    yield None

    alert_page = AlertPage(None, ucc_smartx_rest_helper, open_page=False)
    alert_page.backend_conf.delete_all_stanzas(query="search=test_alert")


class TestAlertActions(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_action_in_list(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        self.assert_util(
            "Test Alert",
            alert_page.alert_entity.add_action_dropdown.get_value_list,
            "in",
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_dropdown_list(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        self.assert_util(
            alert_page.action_entity.table_list.list_of_values, ["incident", "problem"]
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_account_functionality(
        self, ucc_smartx_selenium_helper, add_delete_account
    ):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        alert_page.action_entity.account.select("TestAccount")
        alert_page.action_entity.account.wait_for_values()
        self.assert_util(alert_page.action_entity.account.get_value, "TestAccount")
        alert_page.action_entity.account.cancel_selected_value()
        alert_page.action_entity.account.wait_for_values()
        self.assert_util(
            alert_page.action_entity.account.get_value, "TestAccount", "!="
        )
        self.assert_util(
            "TestAccount", alert_page.action_entity.account.list_of_values, "in"
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_checkbox(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        alert_page.action_entity.all_incident.toggle()
        self.assert_util(alert_page.action_entity.all_incident.is_checked, True)
        alert_page.action_entity.all_incident.toggle()
        self.assert_util(alert_page.action_entity.all_incident.is_checked, False)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_single_select(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        self.assert_util(
            alert_page.action_entity.table_list.list_of_values, ["incident", "problem"]
        )
        alert_page.action_entity.table_list.select("problem")
        self.assert_util(alert_page.action_entity.table_list.get_value, "problem")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_toggle(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        alert_page.action_entity.action.select("Delete")
        assert alert_page.action_entity.action.get_value() == "Delete"
        alert_page.action_entity.action.select("Update")
        assert alert_page.action_entity.action.get_value() == "Update"

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.sanity_test
    @pytest.mark.alert
    def test_alert_action_save(
        self, ucc_smartx_selenium_helper, clean_alert, add_delete_account
    ):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()

        # Add Alert Configs
        alert_page.alert_entity.name.set_value("test_alert")
        alert_page.alert_entity.search.set_value("| search index=_internal" + "\ue007")

        # Open Action
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        # Add Action Configs
        alert_page.action_entity.name.set_value("test_action")
        alert_page.action_entity.all_incident.toggle()
        alert_page.action_entity.action.select("Delete")
        alert_page.action_entity.account.select("TestAccount")
        alert_page.alert_entity.save()
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_table.wait_for_rows_to_appear()
        assert "test_alert" in alert_page.alert_table.get_column_values("name")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_alert_help_text_entity(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")
        self.assert_util(
            alert_page.action_entity.name.get_help_text, "Please enter your name"
        )
        self.assert_util(
            alert_page.action_entity.all_incident.get_help_text,
            "Tick if you want to update all incidents/problems",
        )
        self.assert_util(
            alert_page.action_entity.table_list.get_help_text, "Please select the table"
        )
        self.assert_util(
            alert_page.action_entity.action.get_help_text,
            "Select the action you want to perform",
        )
        self.assert_util(
            alert_page.action_entity.account.get_help_text,
            "Select the account from the dropdown",
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.alert
    def test_alert_action_label_entity(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """Verifies the alert field labels"""
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")
        self.assert_util(alert_page.action_entity.name.get_input_label, "Name *")
        self.assert_util(
            alert_page.action_entity.table_list.get_input_label, "Table List"
        )
        self.assert_util(alert_page.action_entity.action.get_input_label, "Action:")
        self.assert_util(
            alert_page.action_entity.account.get_input_label, "Select Account *"
        )
