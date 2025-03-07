def test___init__html():
    expected_classes = ["MinimalGlobalConfigGenerator", "MinimalGlobalConfig"]
    expected_modules = ["globalConfig_generator", "create_minimal_globalconfig"]
    import splunk_add_on_ucc_framework.generators.globalConfig_generator as minimal_gc

    assert minimal_gc.__all__ == expected_classes

    for attrib in dir(minimal_gc):
        if attrib.startswith("__") and attrib.endswith("__"):
            # ignore the builtin modules
            continue
        assert attrib in expected_classes or attrib in expected_modules
