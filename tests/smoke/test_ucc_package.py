import os
import tempfile

from splunk_add_on_ucc_framework.commands import build
from splunk_add_on_ucc_framework.commands import init
from splunk_add_on_ucc_framework.commands import package


def test_ucc_package():
    """
    Checks the complete from initializing the add-on, building it and then packaging it.
    """
    addon_name = "init_addon_for_ucc_package"
    generated_addon_path = init.init(
        addon_name,
        "Demo Add-on for Splunk",
        "demo_input",
        "1.0.0",
        overwrite=True,
    )
    with tempfile.TemporaryDirectory() as temp_dir_for_build:
        build.generate(
            os.path.join(generated_addon_path, "package"),
            os.path.join(generated_addon_path, "globalConfig.json"),
            "1.0.0",
            output_directory=temp_dir_for_build,
        )

        path_to_built_addon = os.path.join(
            temp_dir_for_build,
            addon_name,
        )
        with tempfile.TemporaryDirectory() as temp_dir_for_package:
            package.package(path_to_built_addon, output=temp_dir_for_package)

            found_files = os.listdir(temp_dir_for_package)
            if "init_addon_for_ucc_package-1.0.0.tar.gz" not in found_files:
                assert False, "No archive found where it should be"
