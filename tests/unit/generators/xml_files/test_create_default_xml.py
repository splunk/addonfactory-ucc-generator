import pytest
from unittest.mock import patch, MagicMock
from splunk_add_on_ucc_framework.generators.xml_files import DefaultXml
import xmldiff.main


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


@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DefaultXml._set_attributes",
    return_value=MagicMock(),
)
@patch(
    "splunk_add_on_ucc_framework.generators.xml_files.DefaultXml.get_file_output_path"
)
def test_generate_xml(
    mock_op_path,
    mock_set_attributes,
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
    config_xml.default_xml_content = "<xml></xml>"
    exp_fname = "default.xml"
    file_path = "output_path/default.xml"
    mock_op_path.return_value = file_path

    mock_writer = MagicMock()
    with patch.object(config_xml, "writer", mock_writer):
        file_paths = config_xml.generate()

        mock_writer.assert_called_once_with(
            file_name=exp_fname,
            file_path=file_path,
            content=config_xml.default_xml_content,
        )
        assert file_paths == {exp_fname: file_path}
