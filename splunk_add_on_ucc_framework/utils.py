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
from typing import Any, Dict

import dunamai
import yaml

from splunk_add_on_ucc_framework import exceptions


def dump_json_config(config: Dict[Any, Any], file_path: str):
    with open(file_path, "w") as f:
        json.dump(config, f, ensure_ascii=False, indent=4)
        f.write("\n")


def dump_yaml_config(config: Dict[Any, Any], file_path: str):
    with open(file_path, "w") as f:
        yaml.dump(config, f, indent=4, sort_keys=False)


def get_version_from_git():
    try:
        version = dunamai.Version.from_git()
    except RuntimeError:
        raise exceptions.IsNotAGitRepo()
    if not version.stage:
        stage = "R"
    else:
        stage = version.stage[:1]
    try:
        version.serialize(metadata=True, style=dunamai.Style.SemVer)
    except ValueError:
        raise exceptions.CouldNotVersionFromGitException()
    return f"{version.base}{stage}{version.commit}"
