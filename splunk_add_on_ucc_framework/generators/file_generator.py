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
import logging
from abc import ABC
from os.path import realpath, sep
from typing import Any, Dict, List, Union, NoReturn

from jinja2 import Environment, FileSystemLoader, select_autoescape

from splunk_add_on_ucc_framework.utils import (
    write_file,
)
from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import (
    GlobalConfigBuilderSchema,
)
from splunk_add_on_ucc_framework.global_config import GlobalConfig

from . import file_const as fc

__all__ = ["FileGenerator", "begin"]

logger = logging.getLogger("ucc_gen")


class FileGenerator(ABC):
    __description__ = "DESCRIBE THE FILE THAT IS GENERATED"

    def __init__(
        self,
        global_config: Union[GlobalConfig, None],
        input_dir: str,
        output_dir: str,
        **kwargs: Any,
    ) -> None:
        """
        :param global_config: the GlobalConfig object that is validated and parsed
        :param input_dir: the path to the source code of globalConfig.(json|yaml)
        :param output_dir: the path to output/<addon_name> directory
        :param ucc_dir: the path of source code of UCC framework
        :param addon_name: the addon_name that is being generated

        """
        super().__init__()
        self._global_config = global_config
        self._input_dir = input_dir
        self._output_dir = output_dir
        self._template_dir = [(sep.join([kwargs["ucc_dir"], "templates"]))]
        self._addon_name: str = kwargs["addon_name"]
        self.writer = write_file
        self._gc_schema: Union[GlobalConfigBuilderSchema, None]
        if global_config is not None:
            self._gc_schema = GlobalConfigBuilderSchema(global_config)
        else:
            self._gc_schema = None
        self._set_attributes(**kwargs)

    def _set_attributes(self, **kwargs: Any) -> Union[NoReturn, None]:
        raise NotImplementedError()

    def generate(self) -> Dict[str, str]:
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


def begin(
    global_config: GlobalConfig, input_dir: str, output_dir: str, **kwargs: Any
) -> List[Dict[str, str]]:
    generated_files: List[Dict[str, str]] = []
    for item in fc.GEN_FILE_LIST:
        file_details: Dict[str, str] = {}
        file_details = item.file_class(
            global_config, input_dir, output_dir, **kwargs
        ).generate()
        for k, v in file_details.items():
            if not k:
                continue
            logger.info(f"Successfully generated '{k}' at '{v}'.")
        generated_files.append(file_details)

    return generated_files
