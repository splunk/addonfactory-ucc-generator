import os
import subprocess

import logging
import sys

logger = logging.getLogger("ucc_gen")


def import_from_aob(addon_name: str):
    addon_name_directory = os.path.join(os.getcwd(), addon_name)
    if not os.path.isdir(addon_name_directory):
        logger.error(f"No such directory {addon_name_directory}")
        sys.exit(1)
    import_from_aob_script_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "commands",
        "import_from_aob.sh",
    )
    imports_py_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "commands", "imports.py"
    )
    subprocess.call((import_from_aob_script_path, addon_name, imports_py_path))
