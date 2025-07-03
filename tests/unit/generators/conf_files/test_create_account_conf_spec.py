from pytest import fixture
from unittest.mock import MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AccountConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path

TA_NAME = "test_addon"


@fixture
def global_config():
    gc = GlobalConfig.from_file(get_testdata_file_path("valid_config.json"))
    gc._content["meta"]["restRoot"] = TA_NAME
    return gc


def test_set_attributes(
    global_config,
    input_dir,
    output_dir,
):
    """Test when _global_config has mixed accounts (some 'oauth', some not)."""
    account_spec = AccountConf(global_config, input_dir, output_dir)
    account_spec._global_config = MagicMock()
    account_spec._gc_schema = MagicMock()

    # Mock the global config and schema behaviors
    account_spec._global_config.configs = [
        {"name": "oauth", "entity": "entity1"},
        {"name": "non_oauth", "entity": "entity2"},
    ]
    account_spec._global_config.namespace = TA_NAME
    account_spec._gc_schema._get_oauth_enitities.return_value = "mocked_content"
    account_spec._gc_schema._parse_fields.return_value = (
        [MagicMock(_name="field2")],
        [MagicMock(_name="field3")],
    )

    account_spec._set_attributes()

    # Only the non-oauth account should be processed
    assert account_spec.account_fields == [("<name>", ["field2 = "])]
    assert (
        account_spec.conf_spec_file
        == f"{global_config.namespace.lower()}_account.conf.spec"
    )


def test_set_attributes_conf_only_TA(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    """Test when _global_config is provided but it is a conf only TA, which implies it has no configuration."""
    account_spec = AccountConf(global_config_for_conf_only_TA, input_dir, output_dir)

    account_spec._set_attributes()

    assert account_spec.account_fields == []


def test_set_attributes_with_oauth_account(
    global_config,
    input_dir,
    output_dir,
):
    """Test when _global_config has an account with name 'oauth'."""
    account_spec = AccountConf(global_config, input_dir, output_dir)
    account_spec._global_config = MagicMock()

    account_spec._global_config.configs = [{"name": "oauth", "entity": "entity1"}]

    account_spec._set_attributes()

    # Since 'oauth' should be skipped, account_fields should remain empty
    assert account_spec.account_fields == []


def test_generate_conf_spec(
    global_config_all_json,
    input_dir,
    output_dir,
):
    ta_name = global_config_all_json.product
    exp_fname = f"{global_config_all_json.namespace.lower()}_account.conf.spec"

    account_spec = AccountConf(global_config_all_json, input_dir, output_dir)
    expected_content = (
        "[<name>]\n"
        + "\n".join(
            [
                "access_token = ",
                "account_checkbox = ",
                "account_multiple_select = ",
                "account_radio = ",
                "auth_type = ",
                "client_id = ",
                "client_id_oauth_credentials = ",
                "client_secret = ",
                "client_secret_oauth_credentials = ",
                "custom_endpoint = ",
                "endpoint = ",
                "example_help_link = ",
                "instance_url = ",
                "oauth_state_enabled = ",
                "password = ",
                "redirect_url = ",
                "refresh_token = ",
                "service_account = ",
                "textarea_field = ",
                "token = ",
                "username = ",
            ]
        )
        + "\n"
    )

    output = account_spec.generate()
    assert output == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/README/{exp_fname}",
            "content": expected_content,
        }
    ]


def test_generate_conf_spec_no_configuration(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    account_spec = AccountConf(global_config_for_conf_only_TA, input_dir, output_dir)

    file_paths = account_spec.generate()
    assert file_paths == [{}]
