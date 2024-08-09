#
# Copyright 2024 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from lxml import etree as ET

DEFAULT_VIEW = "configuration"


def generate_nav_default_xml(
    include_inputs: bool, include_dashboard: bool, default_view: str
) -> str:
    """
    Generates `default/data/ui/nav/default.xml` file.

    The validation is being done in `_validate_meta_default_view` function from `global_config_validator.py` file.
    """
    nav = ET.Element("nav")
    if include_inputs:
        if default_view == "inputs":
            ET.SubElement(nav, "view", attrib={"name": "inputs", "default": "true"})
        else:
            ET.SubElement(nav, "view", attrib={"name": "inputs"})
    if default_view == "configuration":
        ET.SubElement(nav, "view", attrib={"name": "configuration", "default": "true"})
    else:
        ET.SubElement(nav, "view", attrib={"name": "configuration"})
    if include_dashboard:
        if default_view == "dashboard":
            ET.SubElement(nav, "view", attrib={"name": "dashboard", "default": "true"})
        else:
            ET.SubElement(nav, "view", attrib={"name": "dashboard"})
    if default_view == "search":
        ET.SubElement(nav, "view", attrib={"name": "search", "default": "true"})
    else:
        ET.SubElement(nav, "view", attrib={"name": "search"})
    nav_as_string = ET.tostring(
        nav, pretty_print=True, encoding="utf-8", xml_declaration=True
    ).decode("utf-8")
    return nav_as_string


def generate_views_inputs_xml(addon_name: str) -> str:
    """
    Generates `default/data/ui/views/inputs.xml` file.
    """
    view = ET.Element(
        "view",
        attrib={
            "template": f"{addon_name}:/templates/base.html",
            "type": "html",
            "isDashboard": "False",
        },
    )
    label = ET.SubElement(view, "label")
    label.text = "Inputs"
    view_as_string = ET.tostring(
        view, pretty_print=True, encoding="utf-8", xml_declaration=True
    ).decode("utf-8")
    return view_as_string


def generate_views_configuration_xml(addon_name: str) -> str:
    """
    Generates `default/data/ui/views/configuration.xml` file.
    """
    view = ET.Element(
        "view",
        attrib={
            "template": f"{addon_name}:/templates/base.html",
            "type": "html",
            "isDashboard": "False",
        },
    )
    label = ET.SubElement(view, "label")
    label.text = "Configuration"
    view_as_string = ET.tostring(
        view, pretty_print=True, encoding="utf-8", xml_declaration=True
    ).decode("utf-8")
    return view_as_string


def generate_views_dashboard_xml(addon_name: str) -> str:
    """
    Generates `default/data/ui/views/dashboard.xml` file.
    """
    view = ET.Element(
        "view",
        attrib={
            "template": f"{addon_name}:/templates/base.html",
            "type": "html",
            "isDashboard": "False",
        },
    )
    label = ET.SubElement(view, "label")
    label.text = "Monitoring Dashboard"
    view_as_string = ET.tostring(
        view, pretty_print=True, encoding="utf-8", xml_declaration=True
    ).decode("utf-8")
    return view_as_string


def generate_views_redirect_xml(addon_name: str) -> str:
    """
    Generates `default/data/ui/views/redirect.xml` file.
    """
    view = ET.Element(
        "view",
        attrib={
            "template": f"{addon_name}:templates/{addon_name.lower()}_redirect.html",
            "type": "html",
            "isDashboard": "False",
        },
    )
    label = ET.SubElement(view, "label")
    label.text = "Redirect"
    view_as_string = ET.tostring(
        view, pretty_print=True, encoding="utf-8", xml_declaration=True
    ).decode("utf-8")
    return view_as_string
