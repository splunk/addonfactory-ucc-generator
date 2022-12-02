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
    "filename",
    [
        "valid_config.json",
        "valid_config.yaml",
    ],
)
def test_config_validation_when_valid(filename):
    config = helpers.get_testdata(filename)
    validator = GlobalConfigValidator(_path_to_source_dir(), config)
    with does_not_raise():
        validator.validate()


@pytest.mark.parametrize(
    "filename,expectation,exception_message",
    [
        (
            "invalid_config_no_configuration_tabs.json",
            pytest.raises(GlobalConfigValidatorException),
            "[] is too short",
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.json",
            pytest.raises(GlobalConfigValidatorException),
            "Tab 'account' should have entity with field 'name'",
        ),
        # restHandlerName and restHandlerModule are present in the
        # "example_input_one" input
        (
            "invalid_config_both_rest_handler_name_module_are_present.json",
            pytest.raises(GlobalConfigValidatorException),
            (
                "Input 'example_input_one' has both 'restHandlerName' and "
                "'restHandlerModule' or 'restHandlerClass' fields present. "
                "Please use only 'restHandlerName' or 'restHandlerModule' "
                "and 'restHandlerClass'."
            ),
        ),
        # restHandlerName and restHandlerClass are present in the
        # "example_input_one" input
        (
            "invalid_config_both_rest_handler_name_class_are_present.json",
            pytest.raises(GlobalConfigValidatorException),
            (
                "Input 'example_input_one' has both 'restHandlerName' and "
                "'restHandlerModule' or 'restHandlerClass' fields present. "
                "Please use only 'restHandlerName' or 'restHandlerModule' "
                "and 'restHandlerClass'."
            ),
        ),
        # Only restHandlerModule is present in the "example_input_one" input
        (
            "invalid_config_only_rest_handler_module_is_present.json",
            pytest.raises(GlobalConfigValidatorException),
            (
                "Input 'example_input_one' should have both 'restHandlerModule'"
                " and 'restHandlerClass' fields present, only 1 of them was found."
            ),
        ),
        # Only restHandlerClass is present in the "example_input_one" input
        (
            "invalid_config_only_rest_handler_class_is_present.json",
            pytest.raises(GlobalConfigValidatorException),
            (
                "Input 'example_input_one' should have both 'restHandlerModule'"
                " and 'restHandlerClass' fields present, only 1 of them was found."
            ),
        ),
        (
            "invalid_config_no_configuration_tabs.yaml",
            pytest.raises(GlobalConfigValidatorException),
            "[] is too short",
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.yaml",
            pytest.raises(GlobalConfigValidatorException),
            "Tab 'account' should have entity with field 'name'",
        ),
    ],
)
def test_config_validation_when_error(filename, expectation, exception_message):
    config = helpers.get_testdata(filename)
    validator = GlobalConfigValidator(_path_to_source_dir(), config)
    with expectation as excinfo:
        validator.validate()
    (msg,) = excinfo.value.args
    assert msg == exception_message
