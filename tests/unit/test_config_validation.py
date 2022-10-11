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
import os
from contextlib import nullcontext as does_not_raise

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.global_config_validator import (
    GlobalConfigValidator,
    GlobalConfigValidatorException,
)


def _path_to_source_dir() -> str:
    return os.path.join(
        os.getcwd(),
        "splunk_add_on_ucc_framework",
    )


@pytest.mark.parametrize(
    "filename,expectation",
    [
        ("valid_config.json", does_not_raise()),
        (
            "invalid_config_no_configuration_tabs.json",
            pytest.raises(GlobalConfigValidatorException),
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.json",
            pytest.raises(GlobalConfigValidatorException),
        ),
        ("valid_config.yaml", does_not_raise()),
        (
            "invalid_config_no_configuration_tabs.yaml",
            pytest.raises(GlobalConfigValidatorException),
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.yaml",
            pytest.raises(GlobalConfigValidatorException),
        ),
    ],
)
def test_config_validation(filename, expectation):
    config = helpers.get_testdata(filename)
    validator = GlobalConfigValidator(_path_to_source_dir(), config)
    with expectation:
        validator.validate()
