import os
import tempfile
import sys
import pytest
import logging
import json
from os import path

from tests.smoke import helpers

import addonfactory_splunk_conf_parser_lib as conf_parser

from splunk_add_on_ucc_framework.commands import build

PYTEST_SKIP_REASON = """Python 3.8 and higher preserves the order of the attrib
fields when `tostring` function is used.
https://docs.python.org/3/library/xml.etree.elementtree.html#xml.etree.ElementTree.tostring
"""


def _compare_app_conf(expected_folder: str, actual_folder: str) -> None:
    # Comparing default/app.conf, ignoring versions and build.
    default_app_conf_path = os.path.join("default", "app.conf")
    expected_default_app_conf_path = os.path.join(
        expected_folder,
        default_app_conf_path,
    )
    actual_default_app_conf_path = os.path.join(
        actual_folder,
        default_app_conf_path,
    )
    expected_app_conf = conf_parser.TABConfigParser()
    expected_app_conf.read(expected_default_app_conf_path)
    actual_app_conf = conf_parser.TABConfigParser()
    actual_app_conf.read(actual_default_app_conf_path)
    expected_app_conf_dict = expected_app_conf.item_dict()
    actual_app_conf_dict = actual_app_conf.item_dict()
    del expected_app_conf_dict["install"]["build"]
    del expected_app_conf_dict["launcher"]["version"]
    del expected_app_conf_dict["id"]["version"]
    del actual_app_conf_dict["install"]["build"]
    del actual_app_conf_dict["launcher"]["version"]
    del actual_app_conf_dict["id"]["version"]
    assert expected_app_conf_dict == actual_app_conf_dict


def test_ucc_generate():
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_everything",
        "package",
    )
    build.generate(source=package_folder)


def test_ucc_generate_with_config_param():
    """
    Checks whether the package is build when the `config` flag is provided in the CLI.
    """
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_everything",
        "package",
    )
    config_path = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_everything",
        "globalConfig.json",
    )
    build.generate(source=package_folder, config_path=config_path)


@pytest.mark.skipif(sys.version_info >= (3, 8), reason=PYTEST_SKIP_REASON)
def test_ucc_generate_with_everything():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_everything",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_everything",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
        _compare_app_conf(expected_folder, actual_folder)
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "alert_actions.conf"),
            ("default", "eventtypes.conf"),
            ("default", "inputs.conf"),
            ("default", "restmap.conf"),
            ("default", "tags.conf"),
            ("default", "splunk_ta_uccexample_settings.conf"),
            ("default", "web.conf"),
            ("default", "server.conf"),
            ("default", "data", "ui", "alerts", "test_alert.html"),
            ("default", "data", "ui", "nav", "default.xml"),
            ("default", "data", "ui", "views", "configuration.xml"),
            ("default", "data", "ui", "views", "inputs.xml"),
            ("default", "data", "ui", "views", "dashboard.xml"),
            ("default", "data", "ui", "views", "splunk_ta_uccexample_redirect.xml"),
            ("bin", "splunk_ta_uccexample", "modalert_test_alert_helper.py"),
            ("bin", "example_input_one.py"),
            ("bin", "example_input_two.py"),
            ("bin", "example_input_three.py"),
            ("bin", "example_input_four.py"),
            ("bin", "import_declare_test.py"),
            ("bin", "splunk_ta_uccexample_rh_account.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_one.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_two.py"),
            ("bin", "splunk_ta_uccexample_rh_three_custom.py"),
            ("bin", "splunk_ta_uccexample_rh_example_input_four.py"),
            ("bin", "splunk_ta_uccexample_custom_rh.py"),
            ("bin", "splunk_ta_uccexample_rh_oauth.py"),
            ("bin", "splunk_ta_uccexample_rh_settings.py"),
            ("bin", "test_alert.py"),
            ("README", "alert_actions.conf.spec"),
            ("README", "inputs.conf.spec"),
            ("README", "splunk_ta_uccexample_account.conf.spec"),
            ("README", "splunk_ta_uccexample_settings.conf.spec"),
            ("metadata", "default.meta"),
        ]
        helpers.compare_file_content(
            files_to_be_equal,
            expected_folder,
            actual_folder,
        )
        files_to_exist = [
            ("static", "appIcon.png"),
            ("static", "appIcon_2x.png"),
            ("static", "appIconAlt.png"),
            ("static", "appIconAlt_2x.png"),
        ]
        for f in files_to_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert path.exists(expected_file_path)


@pytest.mark.skipif(sys.version_info >= (3, 8), reason=PYTEST_SKIP_REASON)
def test_ucc_generate_with_configuration():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_configuration",
            "package",
        )
        build.generate(
            source=package_folder, output_directory=temp_dir, addon_version="1.1.1"
        )

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_configuration",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
        _compare_app_conf(expected_folder, actual_folder)
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "restmap.conf"),
            ("default", "splunk_ta_uccexample_settings.conf"),
            ("default", "web.conf"),
            ("default", "server.conf"),
            ("default", "data", "ui", "nav", "default.xml"),
            ("default", "data", "ui", "views", "configuration.xml"),
            ("default", "data", "ui", "views", "splunk_ta_uccexample_redirect.xml"),
            ("bin", "import_declare_test.py"),
            ("bin", "splunk_ta_uccexample_rh_account.py"),
            ("bin", "splunk_ta_uccexample_rh_oauth.py"),
            ("bin", "splunk_ta_uccexample_rh_settings.py"),
            ("README", "splunk_ta_uccexample_account.conf.spec"),
            ("README", "splunk_ta_uccexample_settings.conf.spec"),
            ("metadata", "default.meta"),
            ("static", "openapi.json"),
        ]
        helpers.compare_file_content(
            files_to_be_equal,
            expected_folder,
            actual_folder,
        )
        files_to_exist = [
            ("static", "appIcon.png"),
            ("static", "appIcon_2x.png"),
            ("static", "appIconAlt.png"),
            ("static", "appIconAlt_2x.png"),
        ]
        for f in files_to_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert path.exists(expected_file_path)


def test_ucc_generate_with_configuration_files_only():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_no_global_config",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_no_global_config",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
        _compare_app_conf(expected_folder, actual_folder)
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "eventtypes.conf"),
            ("default", "props.conf"),
            ("default", "tags.conf"),
            ("metadata", "default.meta"),
        ]
        helpers.compare_file_content(
            files_to_be_equal,
            expected_folder,
            actual_folder,
        )


def test_ucc_generate_openapi_with_configuration_files_only():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_no_global_config",
            "package",
        )
        build.generate(source=package_folder, output_directory=temp_dir)

        expected_file_path = path.join(
            temp_dir, "Splunk_TA_UCCExample", "static", "openapi.json"
        )
        assert not path.exists(expected_file_path)


def test_ucc_build_verbose_mode(caplog):
    """
    Tests results will test both no option and --verbose mode of build command.
    No option provides a short summary of file created in manner: File creation summary: <result>
    --verbose shows each file specifc case and short summary
    """

    caplog.set_level(logging.INFO, logger="ucc-gen")

    def extract_summary_logs():
        return_logs = []
        copy_logs = False

        message_to_start = (
            "Detailed information about created/copied/modified/conflict files"
        )
        message_to_end = "File creation summary:"

        for record in caplog.records:
            if record.message == message_to_start:
                copy_logs = True

            if copy_logs:
                return_logs.append(record)

            if record.message[:22] == message_to_end:
                copy_logs = False

        return return_logs

    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
        path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_files_conflict_test",
            "package",
        )

        expected_logs_path = path.join(
        path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "expected_addons",
            "expected_files_conflict_test",
            "expected_log.json",
        )

    build.generate(
        source=package_folder, output_directory=temp_dir, verbose_report=True
    )

    summary_logs = extract_summary_logs()

    with open(expected_logs_path) as f:
        expected_logs = json.load(f)

    assert len(summary_logs) == len(expected_logs)

    for log_line in summary_logs:
        # summary messages must be the same but might come in different order
        assert log_line.message in expected_logs.keys()
        assert log_line.levelname == expected_logs[log_line.message]
