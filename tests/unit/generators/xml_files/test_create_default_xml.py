import pytest
from unittest.mock import patch
from splunk_add_on_ucc_framework.generators.xml_files import DefaultXml
import xmldiff.main
import os.path

from splunk_add_on_ucc_framework import __file__ as ucc_framework_file

UCC_DIR = os.path.dirname(ucc_framework_file)


@pytest.fixture
def wrong_ta_name():
    return 123


def test_set_attribute_with_error(
    global_config_all_json, input_dir, output_dir, wrong_ta_name, ucc_dir
):
    with pytest.raises(ValueError):
        DefaultXml(
            global_config_all_json,
            input_dir,
            output_dir,
            ucc_dir=ucc_dir,
            addon_name=wrong_ta_name,
        )


@pytest.mark.parametrize(
    ("defaultView", "expected_result"),
    [
        (
            "configuration",
            """<?xml version="1.0" ?>
                <nav>
                    <view name="inputs"/>
                    <view default="true" name="configuration"/>
                    <view name="dashboard"/>
                    <view name="search"/>
                </nav>
                """,
        ),
        (
            "inputs",
            """<?xml version="1.0" ?>
                <nav>
                    <view default="true" name="inputs"/>
                    <view name="configuration"/>
                    <view name="dashboard"/>
                    <view name="search"/>
                </nav>
                """,
        ),
        (
            "dashboard",
            """<?xml version="1.0" ?>
                <nav>
                    <view name="inputs"/>
                    <view name="configuration"/>
                    <view default="true" name="dashboard"/>
                    <view name="search"/>
                </nav>
                """,
        ),
        (
            "search",
            """<?xml version="1.0" ?>
                <nav>
                    <view name="inputs"/>
                    <view name="configuration"/>
                    <view name="dashboard"/>
                    <view default="true" name="search"/>
                </nav>
                """,
        ),
    ],
)
def test_set_attribute(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
    defaultView,
    expected_result,
):
    global_config_all_json.meta["defaultView"] = defaultView
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    diff = xmldiff.main.diff_texts(default_xml.default_xml_content, expected_result)
    assert " ".join([str(item) for item in diff]) == ""


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

    file_paths = default_xml.generate()
    assert file_paths == {}


def test_generate_xml(
    global_config_all_json,
    input_dir,
    output_dir,
    ta_name,
):
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=UCC_DIR,
        addon_name=ta_name,
    )
    exp_fname = "default.xml"

    file_paths = default_xml.generate()
    assert file_paths == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/nav/{exp_fname}"
    }

    with open(file_paths["default.xml"]) as fp:
        content = fp.read()

    expected_content = """<?xml version="1.0" ?>
        <nav>
            <view name="inputs"/>
            <view default="true" name="configuration"/>
            <view name="dashboard"/>
            <view name="search"/>
        </nav>
        """

    diff = xmldiff.main.diff_texts(expected_content, content)
    assert " ".join([str(item) for item in diff]) == ""
