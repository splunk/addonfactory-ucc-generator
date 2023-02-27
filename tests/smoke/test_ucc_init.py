import os

import pytest

from tests.smoke import helpers

from splunk_add_on_ucc_framework.commands import init
from splunk_add_on_ucc_framework.commands import build


def test_ucc_init():
    addon_name = "demo_addon_for_splunk"
    generated_addon_path = init.init(
        addon_name,
        "Demo Add-on for Splunk",
        "demo_input",
        "1.0.0",
        overwrite=True,
    )
    expected_folder = os.path.join(
        os.path.dirname(__file__),
        "..",
        "testdata",
        "expected_addons",
        "expected_addon_after_init",
        addon_name,
    )
    files_to_be_equal = [
        ("README.md",),
        ("globalConfig.json",),
        ("package", "README.txt"),
        ("package", "LICENSE.txt"),
        ("package", "app.manifest"),
        ("package", "bin", "demo_input.py"),
        ("package", "lib", "requirements.txt"),
    ]
    helpers.compare_file_content(
        files_to_be_equal,
        expected_folder,
        generated_addon_path,
    )
    build.generate(
        os.path.join(generated_addon_path, "package"),
        os.path.join(generated_addon_path, "globalConfig.json"),
        "1.0.0",
    )


def test_ucc_init_if_same_output_then_sys_exit():
    addon_name = "demo_addon_for_splunk_already_exists"
    init.init(
        addon_name,
        "Demo Add-on for Splunk",
        "demo_input",
        "1.0.0",
        # This `overwrite` is not needed, but it's better to have it for the
        # local runs, so it overwrites the existing folder locally, but the
        # next run should produce an error.
        overwrite=True,
    )
    with pytest.raises(SystemExit):
        init.init(
            addon_name,
            "Demo Add-on for Splunk",
            "demo_input",
            "1.0.0",
        )
