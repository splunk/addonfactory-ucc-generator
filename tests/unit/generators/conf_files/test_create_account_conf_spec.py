from unittest.mock import MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AccountConf


def test_init_conf_only_TA(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    """Test when _global_config is provided but it is a conf only TA, which implies it has no configuration."""
    account_spec = AccountConf(global_config_for_conf_only_TA, input_dir, output_dir)

    assert account_spec.account_fields == []


def test_init_with_oauth_account(
    input_dir,
    output_dir,
):
    """Test when _global_config has an account with name 'oauth'."""
    global_config = MagicMock()
    global_config.configs = [{"name": "oauth", "entity": []}]
    account_spec = AccountConf(global_config, input_dir, output_dir)

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
    assert file_paths is None
