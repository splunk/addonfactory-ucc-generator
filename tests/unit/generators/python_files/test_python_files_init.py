def test___init__Python():
    expected_classes = ["PyGenerator", "CustomCommandPy"]
    expected_modules = ["python_generator", "create_custom_command_python"]
    import splunk_add_on_ucc_framework.generators.python_files as py

    assert py.__all__ == expected_classes  # type: ignore[attr-defined]

    for attrib in dir(py):
        if attrib.startswith("__") and attrib.endswith("__"):
            # ignore the builtin modules
            continue
        assert attrib in expected_classes or attrib in expected_modules
