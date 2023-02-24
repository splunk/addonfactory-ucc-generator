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
import pytest

import tests.unit.helpers as helpers

from splunk_add_on_ucc_framework import global_config as global_config_lib


@pytest.mark.parametrize(
    "filename,is_yaml",
    [
        ("valid_config.json", False),
        ("valid_config.yaml", True),
    ],
)
def test_global_config_parse(filename, is_yaml):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig()
    global_config.parse(global_config_path, is_yaml)

    assert global_config.namespace == "splunk_ta_uccexample"
    assert global_config.product == "Splunk_TA_UCCExample"
    assert global_config.original_path == global_config_path
    assert global_config.schema_version == "0.0.3"
    assert global_config.has_inputs() is True
