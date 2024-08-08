def test___init__html():
    expected_classes = ["HTMLGenerator", "AlertActionsHtml"]
    expected_modules = ["html_generator", "create_alert_actions_html"]
    import splunk_add_on_ucc_framework.generators.html_files as html

    assert html.__all__ == expected_classes

    for attrib in dir(html):
        if attrib.startswith("__") and attrib.endswith("__"):
            # ignore the builtin modules
            continue
        assert attrib in expected_classes or attrib in expected_modules
