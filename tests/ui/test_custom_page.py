from pytest_splunk_addon_ui_smartx.base_test import UccTester
from tests.ui.pages.custom_page import CustomPage
import pytest

DEFAULT_CONFIGURATION = {
    "test_number": "",
    "test_regex": "",
    "test_string": "",
    "test_email": "",
    "test_ipv4": "",
    "test_date": "",
    "test_url": "",
    "test_radio": "Yes",
    "test_multiselect": "",
}


@pytest.fixture(autouse=True)
def reset_configuration(ucc_smartx_selenium_helper, ucc_smartx_rest_helper):
    yield
    custom = CustomPage(ucc_smartx_rest_helper=ucc_smartx_rest_helper)
    custom.backend_conf.update_parameters(DEFAULT_CONFIGURATION)


class TestCustomPage(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_fields_label_entity(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """Verifies custom fields label"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(custom.test_string.get_input_label, "Test String")
        self.assert_util(custom.test_number.get_input_label, "Test Number")
        self.assert_util(custom.test_regex.get_input_label, "Test Regex")
        self.assert_util(custom.test_email.get_input_label, "Test Email")
        self.assert_util(custom.test_ipv4.get_input_label, "Test Ipv4")
        self.assert_util(custom.test_date.get_input_label, "Test Date")
        self.assert_util(custom.test_url.get_input_label, "Test Url")
        self.assert_util(custom.test_radio.get_input_label, "Test Radio")
        self.assert_util(custom.test_multiselect.get_input_label, "Test Multiselect")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_fields_placeholder_value(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """Verifies custom fields placeholder value"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(custom.test_string.get_placeholder_value, "Required")
        self.assert_util(custom.test_number.get_placeholder_value, "Required")
        self.assert_util(custom.test_regex.get_placeholder_value, "optional")
        self.assert_util(custom.test_email.get_placeholder_value, "optional")
        self.assert_util(custom.test_ipv4.get_placeholder_value, "optional")
        self.assert_util(custom.test_date.get_placeholder_value, "optional")
        self.assert_util(custom.test_url.get_placeholder_value, "optional")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    @pytest.mark.sanity_test
    def test_custom_frontend_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks the validates frontend save in custom tab"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("7")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("1.10.1.100")
        custom.test_date.set_value("2020-09-18")
        custom.test_url.set_value("https://docs.splunk.com/Documentation")
        custom.test_radio.select("No")
        custom.test_multiselect.select("Option A")
        custom.test_multiselect.select("Option B")
        self.assert_util(custom.save, True)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    @pytest.mark.sanity_test
    def test_custom_backend_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks the validates backend save in custom tab"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("7")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("1.10.1.100")
        custom.test_date.set_value("2020-09-18")
        custom.test_url.set_value("https://docs.splunk.com/Documentation")
        custom.test_radio.select("No")
        custom.test_multiselect.select("Option A")
        custom.test_multiselect.select("Option B")
        custom.save()
        self.assert_util(
            custom.backend_conf.get_stanza,
            {
                "disabled": False,
                "test_number": "7",
                "test_regex": "test_rex",
                "test_string": "test_str",
                "test_email": "test@a.b",
                "test_ipv4": "1.10.1.100",
                "test_date": "2020-09-18",
                "test_url": "https://docs.splunk.com/Documentation",
                "test_radio": "0",
                "test_multiselect": "Option A|Option B",
            },
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_required_field_test_string(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks required field test string"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_number.set_value("7")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("1.10.1.100")
        custom.test_date.set_value("2020-09-18")
        custom.test_url.set_value("https://docs.splunk.com/Documentation")
        custom.test_radio.select("No")
        custom.test_multiselect.select("Option A")
        self.assert_util(
            custom.save,
            r"Field Test String is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_length_test_string_greater(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks length of test string field should be greater than 4"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test")
        self.assert_util(
            custom.save,
            r"Length of Test String should be greater than or equal to 5",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_length_test_string_less(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks length of test string field should be less than 11"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_string")
        self.assert_util(
            custom.save,
            r"Length of Test String should be less than or equal to 10",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_required_field_test_number(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks required field test number"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("1.10.1.100")
        custom.test_date.set_value("2020-09-18")
        custom.test_url.set_value("https://docs.splunk.com/Documentation")
        custom.test_radio.select("No")
        custom.test_multiselect.select("Option A")
        self.assert_util(
            custom.save,
            r"Field Test Number is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_input_test_number(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks test number field should be interger"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("a")
        self.assert_util(
            custom.save,
            r"Field Test Number is not a number",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_range_test_number(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks range of test number field should be between 1 to 10"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("50")
        self.assert_util(
            custom.save,
            r"Field Test Number should be within the range of [1 and 10]",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_input_test_regex(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks regex of test regex field"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("5")
        custom.test_regex.set_value("$$")
        self.assert_util(
            custom.save,
            r"Characters of Name should match regex ^\w+$ .",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_input_test_email(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks test email field should be email"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("5")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("abc")
        self.assert_util(
            custom.save,
            r"Field Test Email is not a valid email address",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_input_test_ipv4(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks test ipv4 field should be valid ipv4"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("5")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("10.1.11")
        self.assert_util(
            custom.save,
            r"Field Test Ipv4 is not a valid IPV4 address",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_input_test_date(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks test date field should be in ISO 8601 format"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("5")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("10.1.11.1")
        custom.test_date.set_value("20-10-2020")
        self.assert_util(
            custom.save,
            r"Field Test Date is not a valid date in ISO 8601 format",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_valid_input_test_url(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks test url field should be valid url"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_string.set_value("test_str")
        custom.test_number.set_value("5")
        custom.test_regex.set_value("test_rex")
        custom.test_email.set_value("test@a.b")
        custom.test_ipv4.set_value("10.1.11.1")
        custom.test_date.set_value("2020-09-18")
        custom.test_url.set_value("\\\\")
        self.assert_util(
            custom.save,
            r"Field Test Url is not a valid URL",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_select_value_test_radio(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks selected value of test radio"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        custom.test_radio.select("No")
        self.assert_util(custom.test_radio.get_value, r"No")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_list_test_multiselect(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks values of Multiple Select Test dropdown"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        test_multiselect = ["Option A", "Option B"]
        self.assert_util(custom.test_multiselect.list_of_values(), test_multiselect)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_select_value_test_multiselect(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks selected single value of Multiple Select Test dropdown"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        selected_values = ["Option A"]
        for each in selected_values:
            custom.test_multiselect.select(each)
        self.assert_util(custom.test_multiselect.get_values, selected_values)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_select_multiple_values_test_multiselect(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks selected multiple values of Multiple Select Test dropdown"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        selected_values = ["Option A", "Option B"]
        for each in selected_values:
            custom.test_multiselect.select(each)
        self.assert_util(custom.test_multiselect.get_values, selected_values)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_search_value_test_multiselect(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks multiple select seach funtionality"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(
            custom.test_multiselect.search_get_list,
            ["Option A"],
            left_args={"value": "Option A"},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_deselect_test_multiselect(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """This test case checks deselect funtionality of multiple select"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        selected_values = ["Option A", "Option B"]
        for each in selected_values:
            custom.test_multiselect.select(each)
        custom.test_multiselect.deselect("Option A")
        self.assert_util(custom.test_multiselect.get_values, ["Option B"])

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.custom
    def test_custom_help_link(self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper):
        """This test case checks whether help link redirects to the correct URL"""
        custom = CustomPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        go_to_link = "https://docs.splunk.com/Documentation"
        with custom.test_help_link.open_link():
            self.assert_util(custom.test_help_link.get_current_url, go_to_link)
