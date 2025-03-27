from pytest import fixture
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.conf_files import AccountConf
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from tests.unit.helpers import get_testdata_file_path

TA_NAME = "test_addon"


@fixture
def global_config():
    gc = GlobalConfig(get_testdata_file_path("valid_config.json"))
    gc._content["meta"]["restRoot"] = TA_NAME
    return gc


def test_set_attributes(global_config, input_dir, output_dir, ucc_dir, ta_name):
    """Test when _global_config has mixed accounts (some 'oauth', some not)."""
    account_spec = AccountConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
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


def test_set_attributes_gc_only(global_config, input_dir, output_dir, ucc_dir, ta_name):
    """Test when _global_config is provided but _gc_schema is None."""
    account_spec = AccountConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    account_spec._global_config = MagicMock()
    account_spec._gc_schema = None

    account_spec._set_attributes()

    assert account_spec.account_fields == []


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
    account_spec._global_config = MagicMock()
    account_spec._gc_schema = MagicMock()

    assert account_spec.account_fields == []


def test_set_attributes_gc_schema_only(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when _global_config is None but _gc_schema is provided."""
    account_spec = AccountConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    account_spec._global_config = None
    account_spec._gc_schema = MagicMock()

    account_spec._set_attributes()

    assert account_spec.account_fields == []


def test_set_attributes_with_oauth_account(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    """Test when _global_config has an account with name 'oauth'."""
    account_spec = AccountConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    account_spec._global_config = MagicMock()
    account_spec._gc_schema = MagicMock()

    account_spec._global_config.configs = [{"name": "oauth", "entity": "entity1"}]

    account_spec._set_attributes()

    # Since 'oauth' should be skipped, account_fields should remain empty
    assert account_spec.account_fields == []


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AccountConf.set_template_and_render"
)
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.AccountConf.get_file_output_path"
)
def test_generate_conf_spec(
    mock_op_path, mock_template, global_config, input_dir, output_dir, ucc_dir, ta_name
):
    content = "content"
    exp_fname = f"{ta_name}_account.conf.spec"
    file_path = "output_path/ta_name_account.conf.spec"
    mock_op_path.return_value = file_path
    mock_template_render = MagicMock()
    mock_template_render.render.return_value = content

    account_spec = AccountConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    account_spec.writer = MagicMock()
    account_spec._template = mock_template_render

    file_paths = account_spec.generate_conf_spec()
    assert mock_op_path.call_count == 1
    assert mock_template.call_count == 1
    account_spec.writer.assert_called_once_with(
        file_name=exp_fname,
        file_path=file_path,
        content=content,
    )
    assert file_paths == {exp_fname: file_path}


def test_generate_conf_no_gc_schema(
    global_config, input_dir, output_dir, ucc_dir, ta_name
):
    account_spec = AccountConf(
        global_config, input_dir, output_dir, ucc_dir=ucc_dir, addon_name=ta_name
    )
    account_spec.account_fields = []

    file_paths = account_spec.generate_conf_spec()
    assert file_paths is None
