#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
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
                "config": None,
                "ta_version": None,
                "python_binary_name": "python3",
                "openapi": True,
            },
        ),
        (
            ["build"],
            {
                "source": "package",
                "config": None,
                "ta_version": None,
                "python_binary_name": "python3",
                "openapi": True,
            },
        ),
        (
            ["--source", "package"],
            {
                "source": "package",
                "config": None,
                "ta_version": None,
                "python_binary_name": "python3",
                "openapi": True,
            },
        ),
        (
            ["build", "--source", "package"],
            {
                "source": "package",
                "config": None,
                "ta_version": None,
                "python_binary_name": "python3",
                "openapi": True,
            },
        ),
        (
            ["--source", "package", "--ta-version", "2.1.0"],
            {
                "source": "package",
                "config": None,
                "ta_version": "2.1.0",
                "python_binary_name": "python3",
                "openapi": True,
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
                "config": None,
                "ta_version": "2.2.0",
                "python_binary_name": "python.exe",
                "openapi": True,
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
                "config": "/path/to/globalConfig.json",
                "ta_version": "2.2.0",
                "python_binary_name": "python.exe",
                "openapi": True,
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
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config": "/path/to/globalConfig.yaml",
                "ta_version": "2.2.0",
                "python_binary_name": "python.exe",
                "openapi": True,
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
                "--python-binary-name",
                "python.exe",
            ],
            {
                "source": "package",
                "config": "/path/to/globalConfig.yaml",
                "ta_version": "2.2.0",
                "python_binary_name": "python.exe",
                "openapi": True,
            },
        ),
    ],
)
@mock.patch("splunk_add_on_ucc_framework.main.generate")
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
                "overwrite": False,
            },
        ),
    ],
)
@mock.patch("splunk_add_on_ucc_framework.commands.init.init")
def test_init_command(mock_init_command, args, expected_parameters):
    main.main(args)

    mock_init_command.assert_called_with(**expected_parameters)
