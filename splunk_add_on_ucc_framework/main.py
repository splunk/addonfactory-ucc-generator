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
import argparse
import sys
from typing import Optional, Sequence

from splunk_add_on_ucc_framework import generate


def main(argv: Optional[Sequence[str]] = None):
    argv = argv if argv is not None else sys.argv[1:]
    parser = argparse.ArgumentParser(description="Build the add-on")
    parser.add_argument(
        "--source",
        type=str,
        nargs="?",
        help="Folder containing the app.manifest and app source",
        default="package",
    )
    parser.add_argument(
        "--config",
        type=str,
        nargs="?",
        help="Path to configuration file, defaults to globalConfig file in parent directory of source provided",
        default=None,
    )
    parser.add_argument(
        "--ta-version",
        type=str,
        help="Version of TA, default version is version specified in the "
        "package such as app.manifest, app.conf, and globalConfig file.",
        default=None,
    )
    parser.add_argument(
        "--python-binary-name",
        type=str,
        help="Python binary name to use to install requirements",
        default="python3",
    )
    args = parser.parse_args(argv)
    generate(
        source=args.source,
        config=args.config,
        ta_version=args.ta_version,
        python_binary_name=args.python_binary_name,
    )


if __name__ == "__main__":
    raise SystemExit(main())
