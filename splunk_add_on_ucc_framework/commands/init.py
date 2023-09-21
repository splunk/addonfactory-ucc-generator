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
import logging
import os
import sys
import re
from typing import Optional

from cookiecutter import exceptions, main

logger = logging.getLogger("ucc_gen")


ADDON_NAME_RE_STR = r'^[^<>:"/|?*]+$'
ADDON_NAME_RE = re.compile(ADDON_NAME_RE_STR)
ADDON_REST_ROOT_RE_STR = r"^\w+$"
ADDON_REST_ROOT_RE = re.compile(ADDON_REST_ROOT_RE_STR)
ADDON_INPUT_NAME_RE_STR = r"^[0-9a-zA-Z][\w-]*$"
ADDON_INPUT_NAME_RE = re.compile(ADDON_INPUT_NAME_RE_STR)


def _is_valid(pattern: re.Pattern, string: str) -> bool:
    result = pattern.search(string)
    if result is None:
        return False
    return True


def _is_valid_addon_name(addon_name: str) -> bool:
    return _is_valid(ADDON_NAME_RE, addon_name)


def _is_valid_rest_root_name(rest_root: str) -> bool:
    return _is_valid(ADDON_REST_ROOT_RE, rest_root)


def _is_valid_input_name(input_name: str) -> bool:
    if len(input_name) > 50:
        return False
    return _is_valid(ADDON_INPUT_NAME_RE, input_name)


def init(
    addon_name: str,
    addon_display_name: str,
    addon_input_name: str,
    addon_version: str,
    addon_rest_root: Optional[str] = None,
    overwrite: bool = False,
) -> str:
    try:
        if not _is_valid_addon_name(addon_name):
            logger.error(
                f"Add-on name provided is not valid, it should follow '{ADDON_NAME_RE_STR}' regex."
            )
            sys.exit(1)

        if addon_rest_root is None:
            if _is_valid_rest_root_name(addon_name):
                logger.info(
                    "Parameter `--addon-rest-root` is not provided, using `--addon-name` as a REST root."
                )
                addon_rest_root = addon_name
            else:
                logger.error(
                    f"Can not use add-on name provided as an add-on REST root. "
                    f"It should follow '{ADDON_REST_ROOT_RE_STR}' regex. "
                    f"Please provide `--addon-rest-root` to specify add-on REST root."
                )
                sys.exit(1)
        else:
            if not _is_valid_rest_root_name(addon_rest_root):
                logger.error(
                    f"Add-on REST root provided is not valid, it should follow '{ADDON_REST_ROOT_RE_STR}' regex."
                )
                sys.exit(1)
        if not _is_valid_input_name(addon_input_name):
            logger.error(
                f"Add-on input name provided is not valid, "
                f"it should follow '{ADDON_INPUT_NAME_RE_STR}' regex and be less than 50 characters."
            )
            sys.exit(1)
        generated_addon_path = main.cookiecutter(
            template=os.path.join(
                os.path.dirname(__file__),
                "init_template",
            ),
            overwrite_if_exists=overwrite,
            no_input=True,
            extra_context={
                "addon_name": addon_name,
                "addon_rest_root": addon_rest_root,
                "addon_display_name": addon_display_name,
                "addon_input_name": addon_input_name,
                "addon_version": addon_version,
            },
        )
        logger.info(f"Generated add-on is located here {generated_addon_path}")
        logger.info(
            "LICENSE.txt and README.txt are empty, "
            "you may need to modify the content of those files. "
        )
        return generated_addon_path
    except exceptions.OutputDirExistsException:
        logger.error(
            "The location is already taken, use `--overwrite` "
            "option to overwrite the content of existing folder."
        )
        sys.exit(1)
