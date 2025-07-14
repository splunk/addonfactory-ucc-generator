import pytest
from splunk_add_on_ucc_framework.generators.xml_files import DefaultXml
from tests.unit.helpers import compare_xml_content


@pytest.fixture
def wrong_ta_name():
    return 123


@pytest.fixture
def default_xml_object(global_config_all_json, input_dir, output_dir):
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    return default_xml


def test_set_attribute_with_error(
    global_config_all_json,
    input_dir,
    output_dir,
    wrong_ta_name,
):
    global_config_all_json.meta["name"] = wrong_ta_name
    with pytest.raises(ValueError):
        DefaultXml(
            global_config_all_json,
            input_dir,
            output_dir,
        )


def test_generate_nav_default_xml(default_xml_object):
    result = default_xml_object.generate_nav_default_xml(
        include_inputs=True,
        include_dashboard=True,
        include_configuration=True,
        default_view="configuration",
    )

    expected_result = """<?xml version="1.0" ?>
    <nav>
        <view name="inputs"/>
        <view default="true" name="configuration"/>
        <view name="dashboard"/>
        <view name="search"/>
    </nav>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_generate_nav_default_xml_only_configuration(default_xml_object):
    result = default_xml_object.generate_nav_default_xml(
        include_inputs=False,
        include_dashboard=False,
        include_configuration=True,
        default_view="configuration",
    )

    expected_result = """<?xml version="1.0" ?>
    <nav>
        <view default="true" name="configuration"/>
        <view name="search"/>
    </nav>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_generate_nav_default_xml_with_default_inputs_page(default_xml_object):
    result = default_xml_object.generate_nav_default_xml(
        include_inputs=True,
        include_dashboard=False,
        include_configuration=True,
        default_view="inputs",
    )

    expected_result = """<?xml version="1.0" ?>
    <nav>
        <view default="true" name="inputs"/>
        <view name="configuration"/>
        <view name="search"/>
    </nav>
"""
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_generate_nav_default_xml_with_default_dashboard_page(default_xml_object):
    result = default_xml_object.generate_nav_default_xml(
        include_inputs=True,
        include_dashboard=True,
        include_configuration=True,
        default_view="dashboard",
    )

    expected_result = """<?xml version="1.0" ?>
    <nav>
        <view name="inputs"/>
        <view name="configuration"/>
        <view default="true" name="dashboard"/>
        <view name="search"/>
    </nav>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_generate_nav_default_xml_with_search_view_default(default_xml_object):
    result = default_xml_object.generate_nav_default_xml(
        include_inputs=False,
        include_dashboard=False,
        include_configuration=True,
        default_view="search",
    )

    expected_result = """<?xml version="1.0" ?>
    <nav>
        <view name="configuration"/>
        <view default="true" name="search"/>
    </nav>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_generate_nav_default_xml_with_no_configuration(default_xml_object):
    result = default_xml_object.generate_nav_default_xml(
        include_inputs=True,
        include_dashboard=False,
        include_configuration=False,
        default_view="search",
    )

    expected_result = """<?xml version="1.0" ?>
    <nav>
        <view name="inputs"/>
        <view default="true" name="search"/>
    </nav>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


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
    defaultView,
    expected_result,
):
    global_config_all_json.meta["defaultView"] = defaultView
    default_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    diff = compare_xml_content(default_xml.default_xml_content, expected_result)
    assert diff == ""


def test_set_attribute_with_no_pages(
    global_config_for_conf_only_TA,
    input_dir,
    output_dir,
):
    default_xml = DefaultXml(
        global_config_for_conf_only_TA,
        input_dir,
        output_dir,
    )

    assert not hasattr(default_xml, "default_xml_content")


def test_generate_xml(
    global_config_all_json,
    input_dir,
    output_dir,
):
    config_xml = DefaultXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    ta_name = global_config_all_json.product
    exp_fname = "default.xml"
    expected_content = """<?xml version="1.0" ?>
        <nav>
            <view name="inputs"/>
            <view default="true" name="configuration"/>
            <view name="dashboard"/>
            <view name="search"/>
        </nav>
        """

    output = config_xml.generate()
    diff = compare_xml_content(output[0]["content"], expected_content)
    assert diff == ""
    assert (
        output[0]["file_path"]
        == f"{output_dir}/{ta_name}/default/data/ui/nav/{exp_fname}"
    )
