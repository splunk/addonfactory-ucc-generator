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
import json
import os


def get_config(config_name: str) -> dict:
    config_path = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "testdata", config_name
    )
    with open(config_path) as f_config:
        valid_config_raw = f_config.read()
        return json.loads(valid_config_raw)
