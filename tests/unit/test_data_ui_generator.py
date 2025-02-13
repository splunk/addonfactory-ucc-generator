import xmldiff.main

from splunk_add_on_ucc_framework import data_ui_generator


def test_generate_nav_default_xml():
    result = data_ui_generator.generate_nav_default_xml(
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
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_nav_default_xml_only_configuration():
    result = data_ui_generator.generate_nav_default_xml(
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
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_nav_default_xml_with_default_inputs_page():
    result = data_ui_generator.generate_nav_default_xml(
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
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_nav_default_xml_with_default_dashboard_page():
    result = data_ui_generator.generate_nav_default_xml(
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
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_nav_default_xml_with_search_view_default():
    result = data_ui_generator.generate_nav_default_xml(
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
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_nav_default_xml_with_no_configuration():
    result = data_ui_generator.generate_nav_default_xml(
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
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_views_inputs_xml():
    result = data_ui_generator.generate_views_inputs_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
    <label>Inputs</label>
</view>
"""
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_views_configuration_xml():
    result = data_ui_generator.generate_views_configuration_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
    <label>Configuration</label>
</view>
"""
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_views_dashboard_xml():
    result = data_ui_generator.generate_views_dashboard_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:/templates/base.html" type="html">
    <label>Monitoring Dashboard</label>
</view>
"""
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""


def test_generate_views_redirect_xml():
    result = data_ui_generator.generate_views_redirect_xml("Splunk_TA_UCCExample")

    expected_result = """<?xml version="1.0" ?>
<view isDashboard="False" template="Splunk_TA_UCCExample:templates/splunk_ta_uccexample_redirect.html" type="html">
    <label>Redirect</label>
</view>
"""
    diff = xmldiff.main.diff_texts(result, expected_result)

    assert " ".join([str(item) for item in diff]) == ""
