from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AccountConf


def test_set_attributes(
    global_config_with_with_one_entity_per_input,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    """Test when _global_config has mixed accounts (some 'oauth', some not)."""
    account_spec = AccountConf(
        global_config_with_with_one_entity_per_input,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    account_spec._set_attributes()

    # Only the non-oauth account should be processed
    assert account_spec.account_fields == [
        ("<name>", ["custom_endpoint = ", "endpoint = ", "account_checkbox = "])
    ]
    assert (
        account_spec.conf_spec_file
        == f"{global_config_with_with_one_entity_per_input.namespace.lower()}_account.conf.spec"
    )


def test_set_attributes_conf_only_TA(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when _global_config is provided but it is a conf only TA, which implies it has no configuration."""
    account_spec = AccountConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert account_spec.account_fields == []


def test_set_attributes_with_oauth_account(
    global_config_with_oauth_account, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when _global_config has an account with name 'oauth'."""
    # need to expand the global config for logging tab
    global_config_with_oauth_account.expand()
    account_spec = AccountConf(
        global_config_with_oauth_account,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    # Since 'oauth' should be skipped, account_fields should remain empty
    assert account_spec.account_fields == []


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AccountConf.set_template_and_render"
)
def test_generate_conf_spec(
    mock_template,
    global_config_with_with_one_entity_per_input,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    content = "content"
    exp_fname = f"{ta_name}_account.conf.spec"
    mock_template_render = MagicMock()
    mock_template_render.render.return_value = content

    account_spec = AccountConf(
        global_config_with_with_one_entity_per_input,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    account_spec._template = mock_template_render

    file_paths = account_spec.generate_conf_spec()
    assert mock_template.call_count == 1
    assert file_paths == {exp_fname: f"{output_dir}/{ta_name}/README/{exp_fname}"}


def test_generate_conf_spec_no_configuration(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    account_spec = AccountConf(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = account_spec.generate_conf_spec()
    assert file_paths is None
