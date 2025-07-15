from splunk_add_on_ucc_framework.generators.xml_files import RedirectXml
from tests.unit.helpers import compare_xml_content


def test_generate_views_redirect_xml(global_config_all_json, input_dir, output_dir):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    result = redirect_xml.generate_views_redirect_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
    <view isDashboard="False" template="Splunk_TA_UCCExample:templates/splunk_ta_uccexample_redirect.html" type="html">
        <label>Redirect</label>
    </view>
    """
    diff = compare_xml_content(result, expected_result)
    assert diff == ""


def test_set_attributes_with_oauth(
    global_config_all_json, input_dir, output_dir, ta_name
):
    global_config_all_json.meta["name"] = ta_name
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )

    assert hasattr(redirect_xml, "redirect_xml_content")
    assert redirect_xml.ta_name == global_config_all_json.meta["name"].lower()


def test_set_attributes_without_oauth(
    global_config_only_logging,
    input_dir,
    output_dir,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
    )

    assert not hasattr(redirect_xml, "redirect_xml_content")


def test_generate_xml_with_oauth(global_config_all_json, input_dir, output_dir):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
    )
    ta_name = global_config_all_json.product
    exp_fname = f"{redirect_xml.ta_name}_redirect.xml"
    expected_content = f"""<?xml version="1.0" ?>
            <view isDashboard="False" template="{ta_name}:templates/{ta_name.lower()}_redirect.html" type="html">
                <label>Redirect</label>
            </view>
        """
    output = redirect_xml.generate()
    if output is not None:
        diff = compare_xml_content(output[0]["content"], expected_content)
        assert diff == ""
        assert (
            output[0]["file_path"]
            == f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
        )


def test_generate_xml_without_oauth(
    global_config_only_logging,
    input_dir,
    output_dir,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
    )

    output = redirect_xml.generate()
    assert output is None
