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
    "args,expected_args_to_generate",
    [
        (
            [],
            {
                "source": "package",
                "config": None,
                "ta_version": None,
                "python_binary_name": "python3",
            },
        ),
        (
            ["--source", "package"],
            {
                "source": "package",
                "config": None,
                "ta_version": None,
                "python_binary_name": "python3",
            },
        ),
        (
            ["--source", "package", "--ta-version", "2.1.0"],
            {
                "source": "package",
                "config": None,
                "ta_version": "2.1.0",
                "python_binary_name": "python3",
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
            },
        ),
    ],
)
@mock.patch("splunk_add_on_ucc_framework.main.generate")
def test_main_with_parameters(ucc_gen_generate, args, expected_args_to_generate):
    main.main(args)

    ucc_gen_generate.assert_called_with(**expected_args_to_generate)
