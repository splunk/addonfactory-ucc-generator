#
# Copyright 2026 Splunk Inc.
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
from typing import Optional

logger = logging.getLogger("ucc_gen")


def build_validate_args(
    file_path: str,
    output_file: Optional[str] = None,
    log_level: Optional[str] = None,
    log_file: Optional[str] = None,
    max_messages: Optional[str] = None,
) -> list[str]:
    args = [file_path, "--included-tags", "cloud"]

    if output_file:
        args.extend(["--output-file", output_file])
    if log_level:
        args.extend(["--log-level", log_level])
    if log_file:
        args.extend(["--log-file", log_file])
    if max_messages:
        args.extend(["--max-messages", max_messages])

    return args


# Tested in the CI during the build process of test add-on.
def validate(
    file_path: str,
    output_file: Optional[str] = None,
    log_level: Optional[str] = None,
    log_file: Optional[str] = None,
    max_messages: Optional[str] = None,
) -> None:
    try:
        from splunk_appinspect import main
    except ModuleNotFoundError:
        logger.error(
            "UCC validate dependencies are not installed. Please install them using the command -> "
            "`pip install splunk-add-on-ucc-framework[validate]`."
        )
        sys.exit(1)
    else:
        main.validate(
            build_validate_args(
                file_path=file_path,
                output_file=output_file,
                log_level=log_level,
                log_file=log_file,
                max_messages=max_messages,
            )
        )
