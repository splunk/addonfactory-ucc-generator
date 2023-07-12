from pytest_splunk_addon_ui_smartx.base_test import UccTester
from tests.ui.pages.account_page import AccountPage

from urllib.parse import urlparse

import pytest
import copy

MULTIPLE_ACCOUNTS_COUNT = 12

ACCOUNT_CONFIG = {
    "name": "TestAccount",
    "account_checkbox": 1,
    "account_multiple_select": "one",
    "account_radio": "yes",
    "auth_type": "basic",
    "custom_endpoint": "login.example.com",
    "username": "TestUser",
    "password": "TestPassword",
    "token": "TestToken",
    "client_id": "",
    "client_secret": "",
    "redirect_url": "",
    "endpoint": "",
    "example_help_link": "",
}


@pytest.fixture
def add_account(ucc_smartx_rest_helper):
    account = AccountPage(
        ucc_smartx_rest_helper=ucc_smartx_rest_helper, open_page=False
    )
    url = account._get_account_endpoint()
    kwargs = ACCOUNT_CONFIG
    yield account.backend_conf.post_stanza(url, kwargs)


@pytest.fixture
def add_multiple_account(ucc_smartx_rest_helper):
    account = AccountPage(
        ucc_smartx_rest_helper=ucc_smartx_rest_helper, open_page=False
    )
    url = account._get_account_endpoint()
    for i in range(MULTIPLE_ACCOUNTS_COUNT):
        kwargs = copy.deepcopy(ACCOUNT_CONFIG)
        kwargs["name"] = kwargs["name"] + str(i)
        account.backend_conf.post_stanza(url, kwargs)


@pytest.fixture
def delete_accounts(ucc_smartx_rest_helper):
    yield
    account = AccountPage(
        ucc_smartx_rest_helper=ucc_smartx_rest_helper, open_page=False
    )
    account.backend_conf.delete_all_stanzas()


class TestAccountPage(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_misc(self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)

        # Title and description
        self.assert_util(account.title.wait_to_display, "Configuration")
        self.assert_util(account.description.wait_to_display, "Set up your add-on")

        # Table headers
        self.assert_util(account.table.get_headers, ["Name", "Auth Type", "Actions"])

        # Default number of rows in the table
        self.assert_util(account.table.get_row_count, 0)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_count(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_multiple_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(
            account.table.get_count_title,
            f"{MULTIPLE_ACCOUNTS_COUNT} Items",
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_sort_functionality(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_multiple_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.sort_column("Name")
        sort_order = account.table.get_sort_order()
        column_values = list(account.table.get_column_values("Name"))
        column_values = list(str(item) for item in column_values)
        sorted_values = sorted(column_values, key=str.lower)
        self.assert_util(sort_order["header"].lower(), "name")
        self.assert_util(column_values, sorted_values)
        self.assert_util(sort_order["ascending"], True)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_accounts_filter_functionality(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)

        # Positive
        account.table.set_filter("TestAccount")
        self.assert_util(account.table.get_row_count, 1)
        self.assert_util(
            account.table.get_count_title,
            f"{account.table.get_row_count()} Item",
        )
        account.table.clean_filter()

        # Negative
        account.table.set_filter("hello")
        self.assert_util(account.table.get_row_count, 0)
        self.assert_util(
            account.table.get_count_title,
            f"{account.table.get_row_count()} Item",
        )
        account.table.clean_filter()

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_pagination(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_multiple_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        name_column_page1 = account.table.get_column_values("name")
        account.table.switch_to_next()
        name_column_page2 = account.table.get_column_values("name")
        self.assert_util(name_column_page1, name_column_page2, "!=")


class TestAccountPageWhenAdd(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    @pytest.mark.sanity_test
    def test_account_add_frontend_backend_validation(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.username.set_value(ACCOUNT_CONFIG["username"])
        account.entity.multiple_select.select("Option One")
        account.entity.password.set_value(ACCOUNT_CONFIG["password"])
        account.entity.security_token.set_value(ACCOUNT_CONFIG["token"])
        self.assert_util(account.entity.save, True)
        account.table.wait_for_rows_to_appear(1)
        self.assert_util(
            account.table.get_table()[ACCOUNT_CONFIG["name"]],
            {
                "name": ACCOUNT_CONFIG["name"],
                "auth type": "basic",
                "actions": "Edit | Clone | Delete",
            },
        )
        assert account.backend_conf.get_stanza(
            ACCOUNT_CONFIG["name"], decrypt=True
        ) == {
            "account_multiple_select": ACCOUNT_CONFIG["account_multiple_select"],
            "account_radio": "1",
            "auth_type": ACCOUNT_CONFIG["auth_type"],
            "username": ACCOUNT_CONFIG["username"],
            "custom_endpoint": ACCOUNT_CONFIG["custom_endpoint"],
            "disabled": False,
            "password": ACCOUNT_CONFIG["password"],
            "token": ACCOUNT_CONFIG["token"],
        }

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_misc(self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper):
        """Verifies miscellaneous elements when adding new account"""
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()

        # Title
        self.assert_util(
            account.entity.title.container.get_attribute("textContent").strip(),
            "Add Account",
        )

        # Labels
        self.assert_util(account.entity.name.get_input_label, "Name")
        self.assert_util(
            account.entity.environment.get_input_label, "Example Environment"
        )
        self.assert_util(
            account.entity.example_checkbox.get_input_label, "Example Checkbox"
        )
        self.assert_util(account.entity.account_radio.get_input_label, "Example Radio")
        self.assert_util(
            account.entity.multiple_select.get_input_label, "Example Multiple Select"
        )
        self.assert_util(account.entity.auth_key.get_input_label, "Auth Type")
        self.assert_util(account.entity.username.get_input_label, "Username")
        self.assert_util(account.entity.password.get_input_label, "Password")
        self.assert_util(
            account.entity.security_token.get_input_label, "Security Token"
        )

        # Help text
        self.assert_util(
            account.entity.name.get_help_text, "Enter a unique name for this account."
        )
        self.assert_util(
            account.entity.example_checkbox.get_help_text,
            "This is an example checkbox for the account entity",
        )
        self.assert_util(
            account.entity.account_radio.get_help_text,
            "This is an example radio button for the account entity",
        )
        self.assert_util(
            account.entity.multiple_select.get_help_text,
            "This is an example multipleSelect for account entity",
        )
        self.assert_util(
            account.entity.username.get_help_text,
            "Enter the username for this account.",
        )
        self.assert_util(
            account.entity.password.get_help_text,
            "Enter the password for this account.",
        )
        self.assert_util(
            account.entity.security_token.get_help_text, "Enter the security token."
        )

        # Values
        self.assert_util(
            account.entity.environment.list_of_values, ["Value1", "Value2", "Other"]
        )
        self.assert_util(account.entity.environment.get_value, "Value1")
        self.assert_util(account.entity.example_checkbox.is_checked, False)
        self.assert_util(account.entity.account_radio.get_value, "Yes")
        self.assert_util(account.entity.auth_key.get_value, "basic")
        self.assert_util(
            account.entity.auth_key.list_of_values(),
            ["Basic Authentication", "OAuth 2.0 Authentication"],
        )
        self.assert_util(
            account.entity.multiple_select.list_of_values(),
            ["Option One", "Option Two"],
        )
        self.assert_util(account.entity.auth_key.get_value, "basic")
        with account.entity.help_link.open_link():
            self.assert_util(
                account.entity.help_link.get_current_url,
                "https://docs.splunk.com/Documentation",
            )

        # Password field should be masked
        textbox_type = account.entity.password.get_type()
        self.assert_util(textbox_type, "password")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_when_oauth_misc(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        """Verifies miscellaneous elements when adding new OAuth2 account"""
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.auth_key.select("OAuth 2.0 Authentication")

        self.assert_util(account.entity.name.get_input_label, "Name")
        self.assert_util(
            account.entity.environment.get_input_label, "Example Environment"
        )
        self.assert_util(
            account.entity.example_checkbox.get_input_label, "Example Checkbox"
        )
        self.assert_util(account.entity.account_radio.get_input_label, "Example Radio")
        self.assert_util(
            account.entity.multiple_select.get_input_label, "Example Multiple Select"
        )
        self.assert_util(account.entity.auth_key.get_input_label, "Auth Type")
        self.assert_util(account.entity.client_id.get_input_label, "Client Id")
        self.assert_util(account.entity.client_secret.get_input_label, "Client Secret")
        self.assert_util(account.entity.redirect_url.get_input_label, "Redirect url")

        textbox_type = account.entity.client_secret.get_type()
        self.assert_util(textbox_type, "password")

        self.assert_util(account.entity.redirect_url.is_editable, False)
        redirect_url_parsed = urlparse(account.entity.redirect_url.get_value())
        redirect_url_path_without_locale = redirect_url_parsed.path.split("/")[2:]
        assert redirect_url_path_without_locale == [
            "app",
            "Splunk_TA_UCCExample",
            "splunk_ta_uccexample_redirect",
        ]

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_close_entity(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        self.assert_util(account.entity.close, True)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_cancel_entity(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        self.assert_util(account.entity.cancel, True)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_required_field_name(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.environment.select("Value2")
        account.entity.multiple_select.select("Option Two")
        account.entity.username.set_value("TestEditUser")
        account.entity.password.set_value("TestEditPassword")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        self.assert_util(
            account.entity.save,
            "Field Name is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_required_field_username(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.environment.select("Value2")
        account.entity.multiple_select.select("Option Two")
        account.entity.password.set_value("TestEditPassword")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        self.assert_util(
            account.entity.save,
            "Field Username is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_required_field_password(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.environment.select("Value2")
        account.entity.multiple_select.select("Option Two")
        account.entity.username.set_value("TestEditUser")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        self.assert_util(
            account.entity.save,
            "Field Password is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    @pytest.mark.xfail(
        reason="account.entity.environment.cancel_selected_value() is flaky, "
        "passing locally, not working in CI, will be investigated later."
    )
    def test_account_add_required_field_example_environment(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.multiple_select.select("Option Two")
        account.entity.username.set_value("TestEditUser")
        account.entity.password.set_value("TestEditPassword")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        account.entity.environment.cancel_selected_value()
        self.assert_util(
            account.entity.save,
            "Field Example Environment is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_required_field_example_multiple_select(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.environment.select("Value2")
        account.entity.username.set_value("TestEditUser")
        account.entity.password.set_value("TestEditPassword")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        self.assert_util(
            account.entity.save,
            "Field Example Multiple Select is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_required_field_client_id(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.environment.select("Value2")
        account.entity.account_radio.select("No")
        account.entity.multiple_select.select("Option Two")
        account.entity.auth_key.select("OAuth 2.0 Authentication")
        self.assert_util(
            account.entity.save,
            "Field Client Id is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_required_field_client_secret(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.auth_key.select("OAuth 2.0 Authentication")
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.multiple_select.select("Option One")
        account.entity.account_radio.select("No")
        account.entity.client_id.set_value("TestClientId")
        self.assert_util(
            account.entity.save,
            "Field Client Secret is required",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_valid_account_name(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.username.set_value(ACCOUNT_CONFIG["username"])
        account.entity.password.set_value(ACCOUNT_CONFIG["password"])
        account.entity.name.set_value("123TestAccount")
        self.assert_util(
            account.entity.save,
            "Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_valid_length_name(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.username.set_value(ACCOUNT_CONFIG["username"])
        account.entity.password.set_value(ACCOUNT_CONFIG["password"])
        account.entity.name.set_value("t" * 51)
        self.assert_util(
            account.entity.save,
            "Length of ID should be between 1 and 50",
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_default_value_example_environment(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.username.set_value(ACCOUNT_CONFIG["username"])
        self.assert_util(account.entity.environment.get_value, "Value1")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_checked_example_checkbox(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.example_checkbox.check()
        self.assert_util(account.entity.example_checkbox.is_checked, True)
        account.entity.example_checkbox.uncheck()
        self.assert_util(account.entity.example_checkbox.is_checked, False)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_select_value_example_environment(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.environment.select("Value2")
        self.assert_util(account.entity.environment.get_value, "Value2")

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_select_value_example_multiple_select(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.multiple_select.select("Option One")
        account.entity.multiple_select.select("Option Two")
        self.assert_util(
            account.entity.multiple_select.get_values, ["Option One", "Option Two"]
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_search_value_example_multiple_select(
        self, ucc_smartx_selenium_helper, ucc_smartx_rest_helper
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        self.assert_util(
            account.entity.multiple_select.search_get_list,
            ["Option One"],
            left_args={"value": "Option One"},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_duplicate_name(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.entity.open()
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        account.entity.multiple_select.select("Option One")
        account.entity.username.set_value(ACCOUNT_CONFIG["username"])
        account.entity.password.set_value(ACCOUNT_CONFIG["password"])
        account.entity.account_radio.select("Yes")
        self.assert_util(
            account.entity.save,
            "Name {} is already in use".format(ACCOUNT_CONFIG["name"]),
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_add_credentials_encrypted_value(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.wait_for_rows_to_appear(1)
        assert account.backend_conf.get_stanza(ACCOUNT_CONFIG["name"]) == {
            "account_checkbox": "1",
            "account_multiple_select": ACCOUNT_CONFIG["account_multiple_select"],
            "account_radio": "1",
            "auth_type": ACCOUNT_CONFIG["auth_type"],
            "username": ACCOUNT_CONFIG["username"],
            "custom_endpoint": ACCOUNT_CONFIG["custom_endpoint"],
            "disabled": False,
            "password": "******",
            "token": "******",
        }


class TestAccountPageWhenEdit(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    @pytest.mark.sanity_test
    def test_account_edit_frontend_backend_validation(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.edit_row(ACCOUNT_CONFIG["name"])
        account.entity.multiple_select.select("Option Two")
        account.entity.username.set_value("TestEditUser")
        account.entity.password.set_value("TestEditPassword")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        self.assert_util(account.entity.save, True)
        account.table.wait_for_rows_to_appear(1)
        assert account.backend_conf.get_stanza(
            ACCOUNT_CONFIG["name"], decrypt=True
        ) == {
            "account_checkbox": "1",
            "account_multiple_select": "one,two",
            "account_radio": "0",
            "auth_type": "basic",
            "username": "TestEditUser",
            "custom_endpoint": "login.example.com",
            "disabled": False,
            "password": "TestEditPassword",
            "token": "TestEditToken",
        }
        self.assert_util(
            account.table.get_table()[ACCOUNT_CONFIG["name"]],
            {
                "name": ACCOUNT_CONFIG["name"],
                "auth type": "basic",
                "actions": "Edit | Clone | Delete",
            },
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_edit_misc(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.edit_row(ACCOUNT_CONFIG["name"])

        self.assert_util(
            account.entity.title.container.get_attribute("textContent").strip(),
            "Update Account",
        )

        self.assert_util(account.entity.name.is_editable, False)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_edit_close_entity(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        """Verifies close functionality at time of edit"""
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.edit_row(ACCOUNT_CONFIG["name"])
        self.assert_util(account.entity.close, True)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_edit_cancel_entity(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        """Verifies cancel functionality at time of edit"""
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.edit_row(ACCOUNT_CONFIG["name"])
        self.assert_util(account.entity.cancel, True)


class TestAccountPageWhenClone(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    @pytest.mark.sanity_test
    def test_account_clone_frontend_backend_validation(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.wait_for_rows_to_appear(1)
        account.table.clone_row(ACCOUNT_CONFIG["name"])
        account.entity.name.set_value("TestAccountClone")
        account.entity.multiple_select.select("Option Two")
        account.entity.username.set_value("TestCloneUser")
        account.entity.password.set_value("TestEditPassword")
        account.entity.security_token.set_value("TestEditToken")
        account.entity.account_radio.select("No")
        self.assert_util(account.entity.save, True)
        account.table.wait_for_rows_to_appear(2)
        assert account.backend_conf.get_stanza("TestAccountClone", decrypt=True) == {
            "account_checkbox": "1",
            "account_multiple_select": "one,two",
            "account_radio": "0",
            "auth_type": "basic",
            "username": "TestCloneUser",
            "custom_endpoint": "login.example.com",
            "disabled": False,
            "password": "TestEditPassword",
            "token": "TestEditToken",
        }
        self.assert_util(
            account.table.get_table()["TestAccount2"],
            {
                "name": "TestAccount2",
                "auth type": "basic",
                "actions": "Edit | Clone | Delete",
            },
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_clone_duplicate_name(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.clone_row(ACCOUNT_CONFIG["name"])
        account.entity.name.set_value(ACCOUNT_CONFIG["name"])
        self.assert_util(
            account.entity.save,
            "Name {} is already in use".format(ACCOUNT_CONFIG["name"]),
            left_args={"expect_error": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_clone_valid_title(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.clone_row(ACCOUNT_CONFIG["name"])
        self.assert_util(account.entity.name.get_value, "")
        self.assert_util(account.entity.username.get_value, "TestUser")
        self.assert_util(account.entity.multiple_select.get_values, ["Option One"])
        self.assert_util(account.entity.auth_key.get_value, "basic")
        self.assert_util(
            account.entity.title.container.get_attribute("textContent").strip(),
            "Clone Account",
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_clone_close_entity(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.clone_row(ACCOUNT_CONFIG["name"])
        self.assert_util(account.entity.close, True)

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_clone_cancel_entity(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.clone_row(ACCOUNT_CONFIG["name"])
        self.assert_util(account.entity.cancel, True)


class TestAccountPageWhenDelete(UccTester):
    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    @pytest.mark.sanity_test
    def test_account_delete_frontend_backend_validation(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.delete_row(ACCOUNT_CONFIG["name"])
        account.table.wait_for_rows_to_appear(0)
        self.assert_util(ACCOUNT_CONFIG["name"], account.table.get_table, "not in")
        self.assert_util(
            ACCOUNT_CONFIG["name"],
            account.backend_conf.get_all_stanzas().keys(),
            "not in",
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_delete_account_in_use(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(
            account.table.delete_row,
            r'Are you sure you want to delete "TestAccount" ? Ensure that no '
            r'input is configured with "TestAccount" as this will stop '
            r"data collection for that input.",
            left_args={"name": ACCOUNT_CONFIG["name"], "prompt_msg": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_delete_valid_title(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        account.table.delete_row(ACCOUNT_CONFIG["name"], prompt_msg=True)
        self.assert_util(
            account.entity.title.container.get_attribute("textContent").strip(),
            "Delete Confirmation",
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_delete_close_entity(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(
            account.table.delete_row,
            True,
            left_args={"name": ACCOUNT_CONFIG["name"], "close": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_delete_cancel_entity(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        self.assert_util(
            account.table.delete_row,
            True,
            left_args={"name": ACCOUNT_CONFIG["name"], "cancel": True},
        )

    @pytest.mark.execute_enterprise_cloud_true
    @pytest.mark.forwarder
    @pytest.mark.account
    def test_account_delete_valid_prompt_message(
        self,
        ucc_smartx_selenium_helper,
        ucc_smartx_rest_helper,
        add_account,
        delete_accounts,
    ):
        account = AccountPage(ucc_smartx_selenium_helper, ucc_smartx_rest_helper)
        prompt_message = account.table.delete_row(
            ACCOUNT_CONFIG["name"], prompt_msg=True
        )
        self.assert_util(
            prompt_message,
            'Are you sure you want to delete "{}" ? Ensure that no input is '
            'configured with "{}" as this will stop data collection for '
            "that input.".format(ACCOUNT_CONFIG["name"], ACCOUNT_CONFIG["name"]),
        )
