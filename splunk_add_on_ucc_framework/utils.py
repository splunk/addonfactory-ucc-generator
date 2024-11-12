#
# Copyright 2024 Splunk Inc.
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
import logging
import shutil
from os import listdir, makedirs, path, remove, sep
from os.path import basename as bn
from os.path import dirname, exists, isdir, join
from typing import Any, Dict

import addonfactory_splunk_conf_parser_lib as conf_parser
import dunamai
import jinja2
import yaml

from splunk_add_on_ucc_framework import exceptions

logger = logging.getLogger("ucc_gen")


def get_j2_env() -> jinja2.Environment:
    # nosemgrep: splunk.autoescape-disabled, python.jinja2.security.audit.autoescape-disabled.autoescape-disabled
    return jinja2.Environment(
        loader=jinja2.FileSystemLoader(join(dirname(__file__), "templates"))
    )


def recursive_overwrite(src: str, dest: str, ui_source_map: bool = False) -> None:
    """
    Method to copy from src to dest recursively.

    Args:
        src (str): Source of copy
        dest (str): Destination to copy
        ui_source_map (bool): flag that decides if source map files should be copied
    """
    # TODO: move to shutil.copytree("src", "dst", dirs_exist_ok=True) when Python 3.8+.
    if isdir(src):
        if not isdir(dest):
            makedirs(dest)
        files = listdir(src)
        for f in files:
            recursive_overwrite(join(src, f), join(dest, f), ui_source_map)
    else:
        if exists(dest):
            remove(dest)

        if (".js.map" not in dest) or ui_source_map:
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
        path = path.replace("\\\\", sep)
    else:
        path = path.replace("\\", sep)
    path = path.replace("/", sep)
    return path.strip(sep)


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
        stage = "+"
    else:
        stage = version.stage[:1]
    try:
        version.serialize(metadata=True, style=dunamai.Style.SemVer)
    except ValueError:
        raise exceptions.CouldNotVersionFromGitException()
    return f"{version.base}{stage}{version.commit}"


def merge_conf_file(
    src_file: str, dst_file: str, merge_mode: str = "stanza_overwrite"
) -> None:
    merge_deny_list = ["default.meta", "README.txt"]
    if bn(src_file) in merge_deny_list:
        return

    sparser = conf_parser.TABConfigParser()
    sparser.read(src_file)
    src_dict = sparser.item_dict()
    parser = conf_parser.TABConfigParser()
    parser.read(dst_file)
    dst_dict = parser.item_dict()

    if merge_mode == "stanza_overwrite":
        for stanza, key_values in src_dict.items():
            if stanza not in dst_dict:
                parser.add_section(stanza)
            else:
                parser.remove_section(stanza)
                parser.add_section(stanza)

            for k, v in key_values.items():
                parser.set(stanza, k, v)
    elif merge_mode == "item_overwrite":
        for stanza, key_values in src_dict.items():
            if stanza not in dst_dict:
                parser.add_section(stanza)

            for k, v in key_values.items():
                if v:
                    parser.set(stanza, k, v)
                else:
                    parser.remove_option(stanza, k)
    else:
        # overwrite the whole file
        parser.read(src_file)

    with open(dst_file, "w") as df:
        parser.write(df)


def write_file(file_name: str, file_path: str, content: str, **kwargs: str) -> None:
    """
    :param merge_mode: only supported for .conf and .conf.spec files.
    """
    logger.debug('operation="write", object="%s" object_type="file"', file_path)

    merge_mode = kwargs.get("merge_mode", "stanza_overwrite")
    do_merge = False
    if file_name.endswith(".conf") or file_name.endswith(".conf.spec"):
        do_merge = True
    else:
        logger.debug(
            f"'{file_name}' is not going to be merged, only .conf and "
            f".conf.spec files are supported."
        )

    new_file = None
    if path.exists(file_path) and do_merge:
        new_file = path.join(path.dirname(file_path), "new_" + file_name)
    if new_file:
        try:
            with open(new_file, "w+") as fhandler:
                fhandler.write(content)
            merge_conf_file(new_file, file_path, merge_mode=merge_mode)
        finally:
            if path.exists(new_file):
                remove(new_file)
    else:
        if not path.exists(path.dirname(file_path)):
            makedirs(path.dirname(file_path))
        with open(file_path, "w+") as fhandler:
            fhandler.write(content)
        if do_merge:
            parser = conf_parser.TABConfigParser()
            parser.read(file_path)
            with open(file_path, "w") as df:
                parser.write(df)
