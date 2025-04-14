from pytest import fixture, raises
from unittest.mock import patch
from splunk_add_on_ucc_framework.generators.xml_files import DefaultXml


@fixture
def wrong_ta_name():
    return 123


def test_set_attribute_with_error(
    global_config_all_json, input_dir, output_dir, wrong_ta_name, ucc_dir
):
    with raises(ValueError):
        DefaultXml(
            global_config_all_json,
            input_dir,
            output_dir,
            ucc_dir=ucc_dir,
            addon_name=wrong_ta_name,
        )


def test_set_attribute(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    assert hasattr(default_xml, "default_xml_content")


@patch("os.path.exists", return_value=True)
def test_set_attribute_when_file_is_present(
    mock_os_path,
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    caplog,
):
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    expected_msg = (
        "Skipping generating data/ui/nav/default.xml because file already exists."
    )
    assert expected_msg in caplog.text
    assert not hasattr(default_xml, "default_xml_content")


def test_set_attribute_with_no_pages(
    global_config_for_conf_only_TA, input_dir, output_dir, ucc_dir, ta_name
):
    default_xml = DefaultXml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(default_xml, "default_xml_content")


def test_generate_xml_without_pages(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    default_xml = DefaultXml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = default_xml.generate_xml()
    assert file_paths is None


def test_generate_xml(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    config_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    exp_fname = "default.xml"

    file_paths = config_xml.generate_xml()
    assert file_paths == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/nav/{exp_fname}"
    }
