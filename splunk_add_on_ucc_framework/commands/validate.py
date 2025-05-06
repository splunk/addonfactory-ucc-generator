#
# Copyright 2025 Splunk Inc.
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
import sys

logger = logging.getLogger("ucc_gen")


def validate(file_path: str) -> None:
    if sys.version_info < (3, 9, 0):
        logger.error(
            "The `ucc-gen validate` command isn't supported for versions below Python 3.9. "
            "Please update the Python interpreter to Python 3.9 or above."
        )
        sys.exit(1)
    try:
        from splunk_appinspect import main
    except ModuleNotFoundError:
        logger.error(
            "UCC validate dependencies are not installed. Please install them using the command -> "
            "`pip install splunk-add-on-ucc-framework[validate]`."
        )
        sys.exit(1)
    else:
        main.validate([f"{file_path}", "--included-tags", "cloud"])
