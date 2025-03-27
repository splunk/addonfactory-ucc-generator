from splunk_add_on_ucc_framework.generators.conf_files import ConfGenerator
from unittest.mock import patch, MagicMock
from pytest import raises, fixture


@fixture
def set_attr():
    return {"file_name": "file_path"}


def mocked__set_attribute(this, **kwargs):
    this.attrib_1 = "value_1"
    this.attrib_2 = "value_2"


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator._set_attributes",
    return_value=MagicMock(),
)
def test_generate(
    mock_set_attr, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    conf = ConfGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert conf.generate() == {"": ""}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator._set_attributes",
    return_value=MagicMock(),
)
@patch("splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator.generate_conf")
@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator.generate_conf_spec"
)
def test_generate_conf_return(
    mock_conf_gen,
    mock_set_attr,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    set_attr,
):
    mock_conf_gen.return_value = set_attr
    conf = ConfGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert conf.generate() == set_attr


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf(
    mock_set_attr, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    conf = ConfGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert conf.generate_conf() == {"": ""}


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator._set_attributes",
    return_value=MagicMock(),
)
def test_generate_conf_spec(
    mock_set_attr, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    conf = ConfGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert conf.generate_conf_spec() == {"": ""}


def test__set_attributes_error(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """
    This tests that the exception provided in side_effect is raised too
    """
    with raises(NotImplementedError):
        ConfGenerator(
            global_config_all_json,
            input_dir,
            output_dir,
            ucc_dir=ucc_dir,
            addon_name=ta_name,
        )


@patch(
    "splunk_add_on_ucc_framework.generators.conf_files.ConfGenerator._set_attributes",
    side_effect=[ValueError],
)
def test__set_attributes_custom_error(
    mock_set_attr, global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    """
    appending to `test__set_attributes_error`, it ensures that the exception
    is raised from `ConfGenerator` class only
    """
    with raises(ValueError):
        ConfGenerator(
            global_config_all_json,
            input_dir,
            output_dir,
            ucc_dir=ucc_dir,
            addon_name=ta_name,
        )


@patch.object(ConfGenerator, "_set_attributes", mocked__set_attribute)
def test__set_attributes_no_error(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    conf = ConfGenerator(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    # the values present in `mocked__set_attribute` function
    assert conf.attrib_1 == "value_1"  # type: ignore[attr-defined]
    assert conf.attrib_2 == "value_2"  # type: ignore[attr-defined]
