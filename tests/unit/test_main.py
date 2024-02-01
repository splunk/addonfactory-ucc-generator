from unittest import mock

import pytest

from splunk_add_on_ucc_framework import main


@pytest.mark.parametrize(
    "args,expected_parameters",
    [
        (
            [],
            {
                "source": "package",
                "config_path": None,
                "addon_version": None,
                "output_directory": None,
                "python_binary_name": "python3",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            ["build"],
            {
                "source": "package",
                "config_path": None,
                "addon_version": None,
                "output_directory": None,
                "python_binary_name": "python3",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            ["--source", "package"],
            {
                "source": "package",
                "config_path": None,
                "addon_version": None,
                "output_directory": None,
                "python_binary_name": "python3",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            ["build", "--source", "package"],
            {
                "source": "package",
                "config_path": None,
                "addon_version": None,
                "output_directory": None,
                "python_binary_name": "python3",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            ["-v", "--source", "package", "--ta-version", "2.1.0"],
            {
                "source": "package",
                "config_path": None,
                "addon_version": "2.1.0",
                "output_directory": None,
                "python_binary_name": "python3",
                "verbose_file_summary_report": True,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "--source",
                "package",
                "--ta-version",
                "2.2.0",
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config_path": None,
                "addon_version": "2.2.0",
                "output_directory": None,
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "--source",
                "package",
                "--config",
                "/path/to/globalConfig.json",
                "--ta-version",
                "2.2.0",
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config_path": "/path/to/globalConfig.json",
                "addon_version": "2.2.0",
                "output_directory": None,
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "--source",
                "package",
                "--config",
                "/path/to/globalConfig.yaml",
                "--ta-version",
                "2.2.0",
                "--output",
                "new_output",
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config_path": "/path/to/globalConfig.yaml",
                "addon_version": "2.2.0",
                "output_directory": "new_output",
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "build",
                "--source",
                "package",
                "--config",
                "/path/to/globalConfig.yaml",
                "--ta-version",
                "2.2.0",
                "-o",
                "new_output",
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config_path": "/path/to/globalConfig.yaml",
                "addon_version": "2.2.0",
                "output_directory": "new_output",
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": False,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "build",
                "-v",
                "--source",
                "package",
                "--config",
                "/path/to/globalConfig.yaml",
                "--ta-version",
                "2.2.0",
                "--output",
                "new_output",
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config_path": "/path/to/globalConfig.yaml",
                "addon_version": "2.2.0",
                "output_directory": "new_output",
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": True,
                "pip_version": "latest",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "build",
                "-v",
                "--source",
                "package",
                "--config",
                "/path/to/globalConfig.yaml",
                "--ta-version",
                "2.2.0",
                "--output",
                "new_output",
                "--python-binary-name",
                "python.exe",
                "--pip-version",
                "21.0.0",
            ],
            {
                "source": "package",
                "config_path": "/path/to/globalConfig.yaml",
                "addon_version": "2.2.0",
                "output_directory": "new_output",
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": True,
                "pip_version": "21.0.0",
                "pip_legacy_resolver": False,
            },
        ),
        (
            [
                "build",
                "-v",
                "--source",
                "package",
                "--config",
                "/path/to/globalConfig.yaml",
                "--ta-version",
                "2.2.0",
                "--output",
                "new_output",
                "--python-binary-name",
                "python.exe",
                "--pip-version",
                "21.0.0",
                "--pip-legacy-resolver",
            ],
            {
                "source": "package",
                "config_path": "/path/to/globalConfig.yaml",
                "addon_version": "2.2.0",
                "output_directory": "new_output",
                "python_binary_name": "python.exe",
                "verbose_file_summary_report": True,
                "pip_version": "21.0.0",
                "pip_legacy_resolver": True,
            },
        ),
    ],
)
@mock.patch("splunk_add_on_ucc_framework.commands.build.generate")
def test_build_command(mock_ucc_gen_generate, args, expected_parameters):
    main.main(args)

    mock_ucc_gen_generate.assert_called_with(**expected_parameters)


@pytest.mark.parametrize(
    "args,expected_parameters",
    [
        (
            [
                "init",
                "--addon-name",
                "splunk_add_on_for_demo",
                "--addon-display-name",
                "Splunk Add-on for Demo",
                "--addon-input-name",
                "demo_input",
            ],
            {
                "addon_name": "splunk_add_on_for_demo",
                "addon_display_name": "Splunk Add-on for Demo",
                "addon_input_name": "demo_input",
                "addon_version": "0.0.1",
                "addon_rest_root": None,
                "overwrite": False,
            },
        ),
        (
            [
                "init",
                "--addon-name",
                "splunk_add_on_for_demo",
                "--addon-rest-root",
                "splunk_add_on_for_demo",
                "--addon-display-name",
                "Splunk Add-on for Demo",
                "--addon-input-name",
                "demo_input",
            ],
            {
                "addon_name": "splunk_add_on_for_demo",
                "addon_display_name": "Splunk Add-on for Demo",
                "addon_input_name": "demo_input",
                "addon_version": "0.0.1",
                "addon_rest_root": "splunk_add_on_for_demo",
                "overwrite": False,
            },
        ),
    ],
)
@mock.patch("splunk_add_on_ucc_framework.commands.init.init")
def test_init_command(mock_init_command, args, expected_parameters):
    main.main(args)

    mock_init_command.assert_called_with(**expected_parameters)


@pytest.mark.parametrize(
    "args,expected_parameters",
    [
        (
            ["import-from-aob", "--addon-name", "TestAddonFromAob"],
            {
                "addon_name": "TestAddonFromAob",
            },
        )
    ],
)
@mock.patch("splunk_add_on_ucc_framework.commands.import_from_aob.import_from_aob")
def test_import_from_aob_command(mock_import_from_aob, args, expected_parameters):
    main.main(args)

    mock_import_from_aob.assert_called_with(**expected_parameters)


@pytest.mark.parametrize(
    "args,expected_parameters",
    [
        (
            ["package", "--path", "output/foo"],
            {
                "path_to_built_addon": "output/foo",
                "output_directory": None,
            },
        ),
        (
            ["package", "--path", "output/foo", "--output", "bar"],
            {
                "path_to_built_addon": "output/foo",
                "output_directory": "bar",
            },
        ),
    ],
)
@mock.patch("splunk_add_on_ucc_framework.commands.package.package")
def test_package_command(mock_package, args, expected_parameters):
    main.main(args)

    mock_package.assert_called_with(**expected_parameters)
