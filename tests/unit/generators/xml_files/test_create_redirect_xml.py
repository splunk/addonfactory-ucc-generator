from splunk_add_on_ucc_framework.generators.xml_files import RedirectXml


def test_set_attributes_with_oauth(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert hasattr(redirect_xml, "redirect_xml_content")
    assert redirect_xml.ta_name == "test_addon"


def test_set_attributes_without_oauth(
    global_config_only_logging,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(redirect_xml, "redirect_xml_content")


def test_generate_xml_with_oauth(
    global_config_all_json, input_dir, output_dir, ucc_dir, ta_name
):
    redirect_xml = RedirectXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    exp_fname = f"{redirect_xml.ta_name}_redirect.xml"

    file_paths = redirect_xml.generate_xml()
    assert file_paths == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
    }


def test_generate_xml_without_oauth(
    global_config_only_logging,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    redirect_xml = RedirectXml(
        global_config_only_logging,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    file_paths = redirect_xml.generate_xml()

    # Assert that no files are returned since no dashboard is configured
    assert file_paths is None
