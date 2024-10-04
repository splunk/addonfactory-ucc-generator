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
from __future__ import annotations
import logging
import os
import sys
import re

import shutil

from splunk_add_on_ucc_framework import utils

logger = logging.getLogger("ucc_gen")

ADDON_NAME_RE_STR = (
    r"^(?!^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$)"
    r"(?!.*\.(tar(\.gz)?|tgz|spl)$)"
    r"[A-Za-z_.-][A-Za-z0-9_.-]*[A-Za-z0-9_-]$"
)
ADDON_NAME_RE = re.compile(ADDON_NAME_RE_STR)
ADDON_REST_ROOT_RE_STR = r"^[\w-]+$"
ADDON_REST_ROOT_RE = re.compile(ADDON_REST_ROOT_RE_STR)
ADDON_INPUT_NAME_RE_STR = r"^[0-9a-zA-Z][\w-]*$"
ADDON_INPUT_NAME_RE = re.compile(ADDON_INPUT_NAME_RE_STR)

UCC_DOC_SITE = "https://splunk.github.io/addonfactory-ucc-generator"


def _is_valid(pattern: re.Pattern[str], string: str) -> bool:
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


def _generate_addon(
    addon_name: str,
    addon_display_name: str,
    addon_input_name: str,
    addon_version: str,
    addon_rest_root: str | None = None,
    overwrite: bool = False,
) -> str:
    generated_addon_path = os.path.join(
        os.getcwd(),
        addon_name,
    )
    if not overwrite and os.path.exists(generated_addon_path):
        logger.error(
            "The location is already taken, use `--overwrite` "
            "option to overwrite the content of existing folder."
        )
        sys.exit(1)
    if overwrite:
        try:
            shutil.rmtree(generated_addon_path)
        except FileNotFoundError:
            pass
    os.makedirs(generated_addon_path)
    readme_path = os.path.join(generated_addon_path, "README.md")
    with open(readme_path, "w") as _f:
        _f.write(f"# {addon_name}\n")
    global_config_path = os.path.join(generated_addon_path, "globalConfig.json")
    global_config_rendered_content = (
        utils.get_j2_env()
        .get_template("globalConfig.json.init-template")
        .render(
            addon_name=addon_name,
            addon_rest_root=addon_rest_root,
            addon_version=addon_version,
            addon_display_name=addon_display_name,
            addon_input_name=addon_input_name,
        )
    )
    with open(global_config_path, "w") as _f:
        _f.write(global_config_rendered_content)
    package_path = os.path.join(generated_addon_path, "package")
    os.makedirs(package_path)
    package_license_path = os.path.join(package_path, "LICENSE.txt")
    with open(package_license_path, "w") as _f:
        pass
    package_readme_path = os.path.join(package_path, "README.txt")
    with open(package_readme_path, "w") as _f:
        pass
    package_app_manifest_path = os.path.join(package_path, "app.manifest")
    app_manifest_rendered_content = (
        utils.get_j2_env()
        .get_template("app.manifest.init-template")
        .render(
            addon_name=addon_name,
            addon_version=addon_version,
            addon_display_name=addon_display_name,
        )
    )
    with open(package_app_manifest_path, "w") as _f:
        _f.write(app_manifest_rendered_content)
    package_bin_path = os.path.join(package_path, "bin")
    os.makedirs(package_bin_path)

    package_bin_helper_path = os.path.join(
        package_bin_path, f"{addon_input_name}_helper.py"
    )
    helper_rendered_content = (
        utils.get_j2_env()
        .get_template("input.helper-init-template")
        .render(
            addon_name=addon_name,
            addon_rest_root=addon_rest_root,
            addon_input_name=addon_input_name,
        )
    )
    with open(package_bin_helper_path, "w") as _f:
        _f.write(helper_rendered_content + "\n")

    package_lib_path = os.path.join(package_path, "lib")
    os.makedirs(package_lib_path)
    package_lib_requirements_path = os.path.join(package_lib_path, "requirements.txt")
    with open(package_lib_requirements_path, "w") as _f:
        _f.writelines(
            [
                "splunktaucclib\n",
                "splunk-sdk\n",
                "solnlib\n",
            ]
        )
    return generated_addon_path


def init(
    addon_name: str,
    addon_display_name: str,
    addon_input_name: str,
    addon_version: str,
    addon_rest_root: str | None = None,
    overwrite: bool = False,
) -> str:
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
    generated_addon_path = _generate_addon(
        addon_name,
        addon_display_name,
        addon_input_name,
        addon_version,
        addon_rest_root,
        overwrite,
    )
    logger.info(f"Generated add-on is located here {generated_addon_path}")
    logger.info(
        "LICENSE.txt and README.txt are empty, "
        "you may need to modify the content of those files\n"
    )
    logger.info(
        f"""You have generated your add-on and are wondering what to do next? \
UCC offers many solutions to improve add-ons!
    Be sure to check out the following functionalities first:
        * Want to know what's going on under the hood of your add-on? \
Add our \"Monitoring dashboard\". - {UCC_DOC_SITE}/dashboard/
        * The default behavior of the UCC-generated REST handler is insufficient \
and you would like to add your own logic? - \
{UCC_DOC_SITE}/advanced/custom_rest_handler/
        * Your add-on is supposed to work on many OSs but uses libraries that are not cross-platform compatible? - \
{UCC_DOC_SITE}/advanced/os-dependent_libraries/\n
    Additional ways to improve add-on's look and feel:
        * Need better organization in your add-on? You can use the option of dividing inputs into categories - \
{UCC_DOC_SITE}/inputs/multilevel_menu/
        * Would you like to modify the value of one field depending on the value of another? - \
{UCC_DOC_SITE}/entity/modifyFieldsOnValue/
        * Would you like to automate your add-on's setup? Use autogenerated openapi.json file - \
{UCC_DOC_SITE}/openapi/
        * Does your add-on need some custom UI components? Check what support UCC offers - \
{UCC_DOC_SITE}/custom_ui_extensions/overview/

    The full range of possibilities offered by UCC can be found in the official documentation - \
{UCC_DOC_SITE}

    To install this newly generated add-on on your Splunk instance, you need to follow the next two steps in this order:
        * Build the add-on you just generated using the \"build\" command - \
{UCC_DOC_SITE}/quickstart/#ucc-gen-build
        * Package the built add-on up using the \"package\" command so that you can install it on your own \
Splunk instance - {UCC_DOC_SITE}/quickstart/#ucc-gen-package"""
    )
    return generated_addon_path
