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
from typing import Optional

from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class SearchbnfConf(FileGenerator):
    __description__ = "Generates `searchbnf.conf` for custom search commands provided in the globalConfig."

    def __init__(
        self, global_config: GlobalConfig, input_dir: str, output_dir: str
    ) -> None:
        super().__init__(global_config, input_dir, output_dir)
        self.conf_file = "searchbnf.conf"
        self.searchbnf_info = []
        if global_config.has_custom_search_commands():
            for command in global_config.custom_search_commands:
                if command.get("requiredSearchAssistant", False):
                    if "syntax" in command:
                        syntax = command["syntax"]
                    else:
                        params_syntax = []
                        for param in command["arguments"]:
                            if param.get("syntaxGeneration", True):
                                validator = param.get("validate", {}).get("type", None)
                                if "syntax" in param:
                                    param_syntax = f"{param['name']}={param['syntax']}"
                                elif validator and validator in (
                                    "Set",
                                    "Integer",
                                    "Float",
                                    "Boolean",
                                    "List",
                                    "Duration",
                                    "Map",
                                ):
                                    if validator in ("Integer", "Float", "Duration"):
                                        param_syntax = f"{param['name']}=<int>"
                                    if validator == "Boolean":
                                        param_syntax = f"{param['name']}=<bool>"
                                    if validator == "Set":
                                        param_syntax = f"{param['name']}=({'|'.join(param['validate']['values'])})"
                                    if validator == "List":
                                        param_syntax = (
                                            f"{param['name']}=<string>(,<string>)*"
                                        )
                                    if validator == "Map":
                                        param_syntax = f"{param['name']}=({'|'.join(param['validate']['map'].keys())})"
                                else:
                                    param_syntax = f"{param['name']}=<string>"
                                if param.get("required", False):
                                    params_syntax.append(param_syntax)
                                else:
                                    params_syntax.append(f"({param_syntax})?")

                        syntax = f"{command['commandName']} {' '.join(params_syntax)}"
                        if len(syntax) > 120:
                            syntax = syntax.split(" ")
                            syntax_lines = [syntax[0]]
                            for part in syntax[1:]:
                                if len(syntax_lines[-1]) < 100:
                                    syntax_lines[-1] += f" {part}"
                                else:
                                    syntax_lines.append(part)
                            syntax = " \\\n".join(syntax_lines)

                    description = command["description"]
                    if isinstance(description, list):
                        description = " \\\n".join(description)

                    searchbnf_dict = {
                        "command_name": command["commandName"],
                        "description": description,
                        "shortdesc": command.get("shortdesc", None),
                        "syntax": syntax,
                        "usage": command["usage"],
                        "tags": command.get("tags", None),
                        "examples": command.get("examples", []),
                    }
                    self.searchbnf_info.append(searchbnf_dict)

    def generate(self) -> Optional[list[dict[str, str]]]:
        if not self.searchbnf_info:
            return None

        file_path = self.get_file_output_path(["default", self.conf_file])
        self.set_template_and_render(
            template_file_path=["conf_files"], file_name="searchbnf_conf.template"
        )
        rendered_content = self._template.render(
            searchbnf_info=self.searchbnf_info,
        )
        return [
            {
                "file_name": self.conf_file,
                "file_path": file_path,
                "content": rendered_content,
            }
        ]
