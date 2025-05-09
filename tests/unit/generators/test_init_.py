def test___init__gen():
    expected_classes = [
        "FileGenerator",
        "GEN_FILE_LIST",
        "FileClass",
    ]
    expected_modules = [
        "file_const",
        "file_generator",
    ]
    import splunk_add_on_ucc_framework.generators as gen

    assert gen.__all__ == expected_classes

    not_allowed = [
        "conf_files",
        "xml_files",
        "html_files",
        "python_files",
        "doc_generator",
    ]
    for attrib in dir(gen):
        if attrib.startswith("__") and attrib.endswith("__") or attrib in not_allowed:
            # ignore the builtin modules
            continue
        assert attrib in expected_classes or attrib in expected_modules
