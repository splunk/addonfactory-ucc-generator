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
from typing import Any, Dict

import dunamai
import yaml

from splunk_add_on_ucc_framework import exceptions


def get_os_path(path: str) -> str:
    """
    Returns a path which will be os compatible.

    Args:
        path (str): Path in string

    Return:
        string: Path which will be os compatible.
    """

    if "\\\\" in path:
        path = path.replace("\\\\", os.sep)
    else:
        path = path.replace("\\", os.sep)
    path = path.replace("/", os.sep)
    return path.strip(os.sep)


def dump_json_config(config: Dict[Any, Any], file_path: str):
    with open(file_path, "w") as f:
        json.dump(config, f, ensure_ascii=False, indent=4)
        f.write("\n")


def dump_yaml_config(config: Dict[Any, Any], file_path: str):
    with open(file_path, "w") as f:
        yaml.dump(config, f, indent=4)


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
