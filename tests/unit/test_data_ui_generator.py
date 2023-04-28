from splunk_add_on_ucc_framework import data_ui_generator


def test_generate_nav_default_xml():
    result = data_ui_generator.generate_nav_default_xml(
        include_inputs=True,
        include_configuration=True,
    )

    expected_result = """<?xml version="1.0" ?>
<nav>
    <view name="inputs"/>
    <view default="true" name="configuration"/>
    <view name="search"/>
</nav>
"""
    assert expected_result == result


def test_generate_nav_default_xml_only_configuration():
    result = data_ui_generator.generate_nav_default_xml(
        include_inputs=False,
        include_configuration=True,
    )

    expected_result = """<?xml version="1.0" ?>
<nav>
    <view default="true" name="configuration"/>
    <view name="search"/>
</nav>
"""
    assert expected_result == result


def test_generate_views_inputs_xml():
    result = data_ui_generator.generate_views_inputs_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
    <label>Inputs</label>
</view>
"""
    assert expected_result == result


def test_generate_views_configuration_xml():
    result = data_ui_generator.generate_views_configuration_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
    <label>Configuration</label>
</view>
"""
    assert expected_result == result


def test_generate_views_redirect_xml():
    result = data_ui_generator.generate_views_redirect_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/splunk_ta_uccexample_redirect.html" type="html">
    <label>Redirect</label>
</view>
"""
    assert expected_result == result
