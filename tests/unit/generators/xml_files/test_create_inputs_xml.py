from splunk_add_on_ucc_framework.generators.xml_files import InputsXml


def test_set_attributes_with_inputs(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert hasattr(inputs_xml, "inputs_xml_content")


def test_set_attributes_without_inputs(
    global_config_only_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )

    assert not hasattr(inputs_xml, "inputs_xml_content")


def test_generate_xml_with_inputs(
    global_config_all_json,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_all_json,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    exp_fname = "inputs.xml"
    file_paths = inputs_xml.generate_xml()
    assert file_paths == {
        exp_fname: f"{output_dir}/{ta_name}/default/data/ui/views/{exp_fname}"
    }


def test_generate_xml_without_inputs(
    global_config_only_configuration,
    input_dir,
    output_dir,
    ucc_dir,
    ta_name,
):
    inputs_xml = InputsXml(
        global_config_only_configuration,
        input_dir,
        output_dir,
        ucc_dir=ucc_dir,
        addon_name=ta_name,
    )
    file_paths = inputs_xml.generate_xml()

    # Assert that no files are returned since no dashboard is configured
    assert file_paths is None
