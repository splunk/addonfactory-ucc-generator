import os

import jinja2


def generate_dashboard(
    j2_env: jinja2.Environment, output_directory: str, addon_name: str
):
    content = j2_env.get_template("dashboard.xml.template").render(
        addon_name=addon_name
    )
    with open(
        os.path.join(
            output_directory,
            addon_name,
            "default",
            "data",
            "ui",
            "views",
            "dashboard.xml",
        ),
        "w",
    ) as dashboard_xml_file:
        dashboard_xml_file.write(content)
