import pytest
from pytest_splunk_addon_ui_smartx.base_test import UccTester

from tests.ui.pages.alert_action_page import AlertPage


@pytest.fixture
def _clean_alert(ucc_smartx_rest_helper):
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
    def test_checkbox(self, ucc_smartx_selenium_helper):
        alert_page = AlertPage(ucc_smartx_selenium_helper, None)
        alert_page.alert_entity.open()
        alert_page.alert_entity.add_action_dropdown.wait_for_values()
        alert_page.alert_entity.add_action_dropdown.select_action("Test Alert")

        alert_page.action_entity.all_incident.toggle()
        self.assert_util(alert_page.action_entity.all_incident.is_checked, True)
        alert_page.action_entity.all_incident.toggle()
        self.assert_util(alert_page.action_entity.all_incident.is_checked, False)
