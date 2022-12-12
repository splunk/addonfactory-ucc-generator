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
import functools
import json
import os
from typing import Dict

import yaml

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


def get_testdata_file_path(file_name: str) -> str:
    return os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "testdata", file_name
    )


def get_testdata_file(file_name: str) -> str:
    file_path = get_testdata_file_path(file_name)
    with open(file_path) as fp:
        return fp.read()


def get_testdata(file_name: str) -> Dict:
    config = get_testdata_file(file_name)
    if file_name.endswith(".json"):
        return json.loads(config)
    else:
        return yaml_load(config)
