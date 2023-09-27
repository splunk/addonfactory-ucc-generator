#
# Copyright 2023 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import json
import os
import shutil
from typing import Any, Dict

import dunamai
import jinja2
import yaml

from splunk_add_on_ucc_framework import exceptions


def get_j2_env() -> jinja2.Environment:
    # nosemgrep: splunk.autoescape-disabled, python.jinja2.security.audit.autoescape-disabled.autoescape-disabled
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(
            os.path.join(os.path.dirname(__file__), "templates")
        )
    )


def recursive_overwrite(src: str, dest: str) -> None:
    """
    Method to copy from src to dest recursively.

    Args:
        src (str): Source of copy
        dest (str): Destination to copy
    """
    # TODO: move to shutil.copytree("src", "dst", dirs_exist_ok=True) when Python 3.8+.
    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest)
        files = os.listdir(src)
        for f in files:
            recursive_overwrite(os.path.join(src, f), os.path.join(dest, f))
    else:
        if os.path.exists(dest):
            os.remove(dest)
        shutil.copy(src, dest)


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


def dump_json_config(config: Dict[Any, Any], file_path: str) -> None:
    with open(file_path, "w") as f:
        json.dump(config, f, ensure_ascii=False, indent=4)
        f.write("\n")


def dump_yaml_config(config: Dict[Any, Any], file_path: str) -> None:
    with open(file_path, "w") as f:
        yaml.dump(config, f, indent=4, sort_keys=False)


def get_version_from_git() -> str:
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
