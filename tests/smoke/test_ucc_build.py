import difflib
import tempfile
from os import path
from pathlib import Path

import splunk_add_on_ucc_framework as ucc


def test_ucc_generate():
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_inputs_configuration_alerts",
        "package",
    )
    ucc.generate(source=package_folder)


def test_ucc_generate_with_add_on_from_example_folder():
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "..",
        "example",
        "package",
    )
    config_path = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "..",
        "example",
        "globalConfig.json",
    )
    ucc.generate(source=package_folder, config=config_path)


def test_ucc_generate_with_config_param():
    """
    Checks whether the package is build when the `config` flag is provided in the CLI
    """
    package_folder = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_inputs_configuration_alerts",
        "package",
    )
    config_path = path.join(
        path.dirname(path.realpath(__file__)),
        "..",
        "testdata",
        "test_addons",
        "package_global_config_inputs_configuration_alerts",
        "globalConfig.json",
    )
    ucc.generate(source=package_folder, config=config_path)


def test_ucc_generate_with_inputs_configuration_alerts():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_inputs_configuration_alerts",
            "package",
        )
        ucc.generate(source=package_folder, outputdir=temp_dir)

        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_inputs_configuration_alerts",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir, "Splunk_TA_UCCExample")

        # app.manifest and appserver/static/js/build/globalConfig.json
        # should be included too, but they may introduce flaky tests as
        # their content depends on the git commit.
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
            ("default", "data", "ui", "alerts", "test_alert.html"),
            ("default", "data", "ui", "nav", "default.xml"),
            ("default", "data", "ui", "views", "configuration.xml"),
            ("default", "data", "ui", "views", "inputs.xml"),
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
        diff_results = []
        for f in files_to_be_equal:
            expected_file_path = path.join(expected_folder, *f)
            actual_file_path = path.join(actual_folder, *f)
            with open(expected_file_path) as expected_file:
                expected_file_lines = expected_file.readlines()
            with open(actual_file_path) as actual_file:
                actual_file_lines = actual_file.readlines()
            for line in difflib.unified_diff(
                actual_file_lines,
                expected_file_lines,
                fromfile=actual_file_path,
                tofile=expected_file_path,
                lineterm="",
            ):
                diff_results.append(line)
        if diff_results:
            for result in diff_results:
                print(result)
            assert False, "Some diffs were found"
        files_to_exist = [
            ("static", "appIcon.png"),
            ("static", "appIcon_2x.png"),
            ("static", "appIconAlt.png"),
            ("static", "appIconAlt_2x.png"),
        ]
        for f in files_to_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert path.exists(expected_file_path)
        files_to_not_exist = [
            ("default", "data", "ui", "nav", "default_no_input.xml"),
        ]
        for f in files_to_not_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert not path.exists(expected_file_path)


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
        ucc.generate(source=package_folder, outputdir=temp_dir)

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
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "restmap.conf"),
            ("default", "splunk_ta_uccexample_settings.conf"),
            ("default", "web.conf"),
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
        ]
        diff_results = []
        for f in files_to_be_equal:
            expected_file_path = path.join(expected_folder, *f)
            actual_file_path = path.join(actual_folder, *f)
            with open(expected_file_path) as expected_file:
                expected_file_lines = expected_file.readlines()
            with open(actual_file_path) as actual_file:
                actual_file_lines = actual_file.readlines()
            for line in difflib.unified_diff(
                actual_file_lines,
                expected_file_lines,
                fromfile=actual_file_path,
                tofile=expected_file_path,
                lineterm="",
            ):
                diff_results.append(line)
        if diff_results:
            for result in diff_results:
                print(result)
            assert False, "Some diffs were found"
        files_to_exist = [
            ("static", "appIcon.png"),
            ("static", "appIcon_2x.png"),
            ("static", "appIconAlt.png"),
            ("static", "appIconAlt_2x.png"),
        ]
        for f in files_to_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert path.exists(expected_file_path)
        files_to_not_exist = [
            ("default", "data", "ui", "nav", "default_no_input.xml"),
        ]
        for f in files_to_not_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert not path.exists(expected_file_path)


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
        ucc.generate(source=package_folder, outputdir=temp_dir)

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
        # Expected add-on package folder does not have "lib" in it.
        files_to_be_equal = [
            ("README.txt",),
            ("default", "eventtypes.conf"),
            ("default", "props.conf"),
            ("default", "tags.conf"),
            ("metadata", "default.meta"),
        ]
        diff_results = []
        for f in files_to_be_equal:
            expected_file_path = path.join(expected_folder, *f)
            actual_file_path = path.join(actual_folder, *f)
            with open(expected_file_path) as expected_file:
                expected_file_lines = expected_file.readlines()
            with open(actual_file_path) as actual_file:
                actual_file_lines = actual_file.readlines()
            for line in difflib.unified_diff(
                actual_file_lines,
                expected_file_lines,
                fromfile=actual_file_path,
                tofile=expected_file_path,
                lineterm="",
            ):
                diff_results.append(line)
        if diff_results:
            for result in diff_results:
                print(result)
            assert False, "Some diffs were found"
        files_to_not_exist = [
            ("default", "data", "ui", "nav", "default_no_input.xml"),
        ]
        for f in files_to_not_exist:
            expected_file_path = path.join(expected_folder, *f)
            assert not path.exists(expected_file_path)

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
        ucc.generate(source=package_folder, outputdir=temp_dir, openapi=True)

        openapi_file = Path(Path(temp_dir) / "Splunk_TA_UCCExample/static/openapi.json")
        assert not openapi_file.exists()
        
def test_ucc_generate_openapi_with_configuration():
    with tempfile.TemporaryDirectory() as temp_dir:
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "..",
            "testdata",
            "test_addons",
            "package_global_config_configuration",
            "package",
        )
        ucc.generate(source=package_folder, outputdir=temp_dir, openapi=True, ta_version='1.1.1')
        expected_folder = path.join(
            path.dirname(__file__),
            "..",
            "testdata",
            "expected_addons",
            "expected_output_global_config_configuration",
            "Splunk_TA_UCCExample",
        )
        actual_folder = path.join(temp_dir , "Splunk_TA_UCCExample")        
        files_to_be_equal = [
            ("static", "openapi.json"),
        ]
        diff_results = []
        for f in files_to_be_equal:
            expected_file_path = path.join(expected_folder, *f)
            actual_file_path = path.join(actual_folder, *f)
            with open(expected_file_path) as expected_file:
                expected_file_lines = expected_file.readlines()
            with open(actual_file_path) as actual_file:
                actual_file_lines = actual_file.readlines()
            for line in difflib.unified_diff(
                actual_file_lines,
                expected_file_lines,
                fromfile=actual_file_path,
                tofile=expected_file_path,
                lineterm="",
            ):
                diff_results.append(line)
        if diff_results:
            for result in diff_results:
                print(result)
            assert False, "Some diffs were found"
