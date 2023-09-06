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

from cookiecutter import exceptions, main

logger = logging.getLogger("ucc_gen")


def init(
    addon_name: str,
    addon_display_name: str,
    addon_input_name: str,
    addon_version: str,
    overwrite: bool = False,
) -> str:
    try:
        generated_addon_path = main.cookiecutter(
            template=os.path.join(
                os.path.dirname(__file__),
                "init_template",
            ),
            overwrite_if_exists=overwrite,
            no_input=True,
            extra_context={
                "addon_name": addon_name,
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
