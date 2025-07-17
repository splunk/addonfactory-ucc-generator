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
from abc import ABC
from os.path import realpath, sep, dirname, abspath
from typing import Any, Dict, List, Union, NoReturn, Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from splunk_add_on_ucc_framework.utils import (
    write_file,
)
from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import (
    GlobalConfigBuilderSchema,
)
from splunk_add_on_ucc_framework.global_config import GlobalConfig
from splunk_add_on_ucc_framework import __file__ as ucc_framework_file
from . import file_const as fc

__all__ = ["FileGenerator", "begin"]

logger = logging.getLogger("ucc_gen")


class FileGenerator(ABC):
    __description__ = "DESCRIBE THE FILE THAT IS GENERATED"

    _ucc_dir = abspath(dirname(ucc_framework_file))

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
    ) -> None:
        """
        :param global_config: the GlobalConfig object that is validated and parsed
        :param input_dir: the path to the source code of globalConfig.(json|yaml)
        :param output_dir: the path to output/<addon_name> directory

        """
        super().__init__()
        self._global_config = global_config
        self._input_dir = input_dir
        self._output_dir = output_dir
        self._template_dir = [(sep.join([self._ucc_dir, "templates"]))]
        self._template = Environment(
            loader=FileSystemLoader(self._template_dir),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )
        self._addon_name: str = global_config.product
        self.writer = write_file
        self._gc_schema: GlobalConfigBuilderSchema = GlobalConfigBuilderSchema(
            global_config
        )
        self._set_attributes()

    def _set_attributes(self) -> Union[NoReturn, None]:
        raise NotImplementedError()

    def generate(self) -> Optional[List[Dict[str, str]]]:
        raise NotImplementedError()

    def _get_output_dir(self) -> str:
        return sep.join([realpath(self._output_dir), self._addon_name])

    def get_file_output_path(self, output_piece: Union[List[str], str]) -> str:
        if isinstance(output_piece, str):
            return sep.join([self._get_output_dir(), output_piece])
        elif isinstance(output_piece, list):
            return sep.join([self._get_output_dir()] + output_piece)

        raise TypeError(
            "Invalid type of output_piece, provided type='%s'" % (type(output_piece))
        )

    def set_template_and_render(
        self, template_file_path: List[str], file_name: str
    ) -> None:
        assert file_name.endswith(".template")
        select_autoescape(disabled_extensions=("template"))

        self._template = Environment(
            loader=FileSystemLoader(sep.join(self._template_dir + template_file_path)),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
        )
        self._template = self._template.get_template(file_name)

    def _render(self, file_name: str, **kwargs: Any) -> str:
        select_autoescape(disabled_extensions=("template",))
        template = self._template.get_template(file_name)
        return template.render(kwargs)


def begin(
    global_config: GlobalConfig, input_dir: str, output_dir: str
) -> List[Dict[str, str]]:
    generated_files: List[Dict[str, str]] = []
    for item in fc.GEN_FILE_LIST:
        file_details = item.file_class(global_config, input_dir, output_dir).generate()
        if file_details is None:
            continue
        for details in file_details:
            write_file(
                details["file_name"],
                details["file_path"],
                details["content"],
                merge_mode=details.get("merge_mode", "stanza_overwrite"),
            )
            logger.info(
                f"Successfully generated '{details['file_name']}' at '{details['file_path']}"
            )
            generated_files.append({details["file_name"]: details["file_path"]})

    return generated_files
