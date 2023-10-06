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
import argparse
import sys
from typing import Optional, Sequence
import logging

from splunk_add_on_ucc_framework.commands import build
from splunk_add_on_ucc_framework.commands import init
from splunk_add_on_ucc_framework.commands import import_from_aob

logger = logging.getLogger("ucc_gen")


# This is a necessary change to have, so we don't release a breaking change.
# This class adds a default subparser if none specified. In our case it will be
# `build`subclass.
# This is a temporary change and everyone migrates to `ucc-gen build` instead of
# just using `ucc-gen` this will be removed.
# The limitation of this approach is that we can't have global options without a
# subparser being specified. Example is `--version`, the default subparser will
# be added here as well. But this is not a big deal for now, we don't have
# global options anyway.
class DefaultSubcommandArgumentParser(argparse.ArgumentParser):
    __default_subparser = None

    def set_default_subparser(self, name):
        self.__default_subparser = name

    def _parse_known_args(self, arg_strings, *args, **kwargs):
        in_args = set(arg_strings)
        d_sp = self.__default_subparser
        if d_sp is not None and not {"-h", "--help"}.intersection(in_args):
            for x in self._subparsers._actions:
                subparser_found = isinstance(
                    x, argparse._SubParsersAction
                ) and in_args.intersection(x._name_parser_map.keys())
                if subparser_found:
                    break
            else:
                logger.warning(
                    "Please use `ucc-gen build` if you want to build "
                    "an add-on, using just `ucc-gen` will be deprecated"
                )
                arg_strings = [d_sp] + arg_strings
        return super()._parse_known_args(arg_strings, *args, **kwargs)


def main(argv: Optional[Sequence[str]] = None):
    argv = argv if argv is not None else sys.argv[1:]
    parser = DefaultSubcommandArgumentParser()
    parser.set_default_subparser("build")
    subparsers = parser.add_subparsers(dest="command", description="Build an add-on")

    build_parser = subparsers.add_parser("build")
    build_parser.add_argument(
        "--source",
        type=str,
        nargs="?",
        help="Folder containing the app.manifest and app source.",
        default="package",
    )
    build_parser.add_argument(
        "--config",
        type=str,
        nargs="?",
        help="Path to configuration file, defaults to globalConfig file in parent directory of source provided.",
        default=None,
    )
    build_parser.add_argument(
        "--ta-version",
        type=str,
        help="Version of TA, default version is version specified in the "
        "package such as app.manifest, app.conf, and globalConfig file.",
        default=None,
    )
    build_parser.add_argument(
        "-o",
        "--output",
        type=str,
        help="Output path to store built add-on.",
        default=None,
    )
    build_parser.add_argument(
        "--python-binary-name",
        type=str,
        help="Python binary name to use to install requirements.",
        default="python3",
    )
    build_parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        default=False,
        help="Show summary report",
    )

    init_parser = subparsers.add_parser("init", description="Bootstrap an add-on.")
    init_parser.add_argument(
        "--addon-name",
        type=str,
        help="Add-on name.",
        required=True,
    )
    init_parser.add_argument(
        "--addon-rest-root",
        type=str,
        help="Add-on REST root.",
        required=False,
        default=None,
    )
    init_parser.add_argument(
        "--addon-display-name",
        type=str,
        help="Add-on display name.",
        required=True,
    )
    init_parser.add_argument(
        "--addon-input-name",
        type=str,
        help="Add-on input name.",
        required=True,
    )
    init_parser.add_argument(
        "--addon-version",
        type=str,
        help="Add-on version.",
        default="0.0.1",
    )
    init_parser.add_argument(
        "--overwrite",
        action="store_true",
        default=False,
        help="Overwrite already generated add-on folder.",
    )

    import_from_aob_parser = subparsers.add_parser(
        "import-from-aob", description="[Experimental] Import from AoB."
    )
    import_from_aob_parser.add_argument(
        "--addon-name",
        type=str,
        help="Add-on name.",
        required=True,
    )

    args = parser.parse_args(argv)
    if args.command == "build":
        build.generate(
            source=args.source,
            config_path=args.config,
            addon_version=args.ta_version,
            output_directory=args.output,
            python_binary_name=args.python_binary_name,
            verbose_report=args.verbose
        )
    if args.command == "init":
        init.init(
            addon_name=args.addon_name,
            addon_rest_root=args.addon_rest_root,
            addon_display_name=args.addon_display_name,
            addon_input_name=args.addon_input_name,
            addon_version=args.addon_version,
            overwrite=args.overwrite,
        )
    if args.command == "import-from-aob":
        import_from_aob.import_from_aob(
            addon_name=args.addon_name,
        )


if __name__ == "__main__":
    raise SystemExit(main())
