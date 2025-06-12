import pytest
from splunk_add_on_ucc_framework.generators.xml_files import DefaultXml
import xmldiff.main
from textwrap import dedent


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
    expected_content = dedent(
        """<?xml version="1.0" ?>
<nav>
    <view name="inputs"/>
    <view default="true" name="configuration"/>
    <view name="dashboard"/>
    <view name="search"/>
</nav>
    """
    )

    file_paths = config_xml.generate()
    assert file_paths == [
        {
            "file_name": exp_fname,
            "file_path": f"{output_dir}/{ta_name}/default/data/ui/nav/{exp_fname}",
            "content": expected_content,
        }
    ]
