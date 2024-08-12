def test___init__XML():
    expected_classes = [
        "XMLGenerator",
        "DefaultXml",
        "ConfigurationXml",
        "DashboardXml",
        "InputsXml",
        "RedirectXml",
    ]
    expected_modules = [
        "xml_generator",
        "create_default_xml",
        "create_configuration_xml",
        "create_dashboard_xml",
        "create_inputs_xml",
        "create_redirect_xml",
    ]
    import splunk_add_on_ucc_framework.generators.xml_files as xml

    assert xml.__all__ == expected_classes

    for attrib in dir(xml):
        if attrib.startswith("__") and attrib.endswith("__"):
            # ignore the builtin modules
            continue
        assert attrib in expected_classes or attrib in expected_modules
