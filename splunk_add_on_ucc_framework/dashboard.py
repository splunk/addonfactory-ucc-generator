import logging
import os

logger = logging.getLogger("ucc_gen")


def generate_dashboard(content: str, dashboard_xml_folder_path: str):
    dashboard_xml_file_path = os.path.join(
        dashboard_xml_folder_path,
        "dashboard.xml",
    )
    if os.path.exists(dashboard_xml_file_path):
        logger.warning(
            f"dashboard.xml file already exists @ "
            f"{dashboard_xml_folder_path}, not overwriting the existing dashboard file."
        )
    else:
        with open(dashboard_xml_file_path, "w") as dashboard_xml_file:
            dashboard_xml_file.write(content)
