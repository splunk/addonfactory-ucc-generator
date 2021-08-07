import tempfile
import unittest
from os import path

import splunk_add_on_ucc_framework as ucc
from tests.unit.helpers import assert_identical_files


class UccGenerateTest(unittest.TestCase):
    def test_ucc_generate(self):
        package_folder = path.join(
            path.dirname(path.realpath(__file__)),
            "package_global_config_inputs_configuration_alerts",
            "package",
        )
        ucc.generate(source=package_folder)

    def test_ucc_generate_with_inputs_configuration_alerts(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            package_folder = path.join(
                path.dirname(path.realpath(__file__)),
                "package_global_config_inputs_configuration_alerts",
                "package",
            )
            ucc.generate(source=package_folder, outputdir=temp_dir)

            expected_folder = path.join(
                path.dirname(__file__),
                "..",
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
                ("bin", "import_declare_test.py"),
                ("bin", "splunk_ta_uccexample_rh_account.py"),
                ("bin", "splunk_ta_uccexample_rh_example_input_one.py"),
                ("bin", "splunk_ta_uccexample_rh_example_input_two.py"),
                ("bin", "splunk_ta_uccexample_rh_oauth.py"),
                ("bin", "splunk_ta_uccexample_rh_settings.py"),
                ("bin", "test_alert.py"),
                ("README", "alert_actions.conf.spec"),
                ("README", "inputs.conf.spec"),
                ("README", "splunk_ta_uccexample_account.conf.spec"),
                ("README", "splunk_ta_uccexample_settings.conf.spec"),
            ]
            for f in files_to_be_equal:
                expected_file_path = path.join(expected_folder, *f)
                actual_file_path = path.join(actual_folder, *f)
                self.assertTrue(
                    assert_identical_files(
                        expected_file_path,
                        actual_file_path,
                    ),
                    msg=f"Expected file {expected_file_path} is different from {actual_file_path}",
                )

    def test_ucc_generate_with_configuration(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            package_folder = path.join(
                path.dirname(path.realpath(__file__)),
                "package_global_config_configuration",
                "package",
            )
            ucc.generate(source=package_folder, outputdir=temp_dir)

            expected_folder = path.join(
                path.dirname(__file__),
                "..",
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
            ]
            for f in files_to_be_equal:
                expected_file_path = path.join(expected_folder, *f)
                actual_file_path = path.join(actual_folder, *f)
                self.assertTrue(
                    assert_identical_files(
                        expected_file_path,
                        actual_file_path,
                    ),
                    msg=f"Expected file {expected_file_path} is different from {actual_file_path}",
                )

    def test_ucc_generate_with_configuration_files_only(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            package_folder = path.join(
                path.dirname(path.realpath(__file__)),
                "package_no_global_config",
                "package",
            )
            ucc.generate(source=package_folder, outputdir=temp_dir)

            expected_folder = path.join(
                path.dirname(__file__),
                "..",
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
            ]
            for f in files_to_be_equal:
                expected_file_path = path.join(expected_folder, *f)
                actual_file_path = path.join(actual_folder, *f)
                self.assertTrue(
                    assert_identical_files(
                        expected_file_path,
                        actual_file_path,
                    ),
                    msg=f"Expected file {expected_file_path} is different from {actual_file_path}",
                )


if __name__ == "__main__":
    unittest.main()
