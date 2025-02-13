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
from typing import Any, Dict, Union
import os
from importlib import import_module
import sys

from splunk_add_on_ucc_framework.generators.python_files import PyGenerator

GENERATED_FILES = {}


class CustomCommandPy(PyGenerator):
    __description__ = (
        "Generates python files for custom commands provided in the globalConfig."
    )

    def _set_attributes(self, **kwargs: Any) -> None:
        self.commands_info = []
        if self._global_config and self._global_config.has_custom_search_commands():
            for command in kwargs["custom_search_commands"]:
                arguments = []
                import_map = False
                command["fileName"] = command["fileName"].replace(".py", "")
                template = command["commandType"] + ".template"
                if command["commandType"] == "reporting":
                    src_pkg_bin = os.path.realpath(os.path.join(self._input_dir, "bin"))
                    sys.path.insert(0, src_pkg_bin)
                    if hasattr(import_module(command["fileName"]), "map"):
                        import_map = True
                    sys.path.pop(0)
                for argument in command["arguments"]:
                    arguments.append(
                        {
                            "name": argument["name"],
                            "require": argument.get("required"),
                            "validate": argument.get("validate"),
                            "default": argument.get("defaultValue"),
                        }
                    )

                self.commands_info.append(
                    {
                        "file_name": command["fileName"],
                        "class_name": command["commandName"].title(),
                        "description": command.get("description"),
                        "syntax": command.get("syntax"),
                        "template": template,
                        "arguments": arguments,
                        "import_map": import_map,
                    }
                )

    def generate_python(self) -> Union[Dict[str, str], None]:
        if not (
            self._global_config and self._global_config.has_custom_search_commands()
        ):
            return None

        for command_info in self.commands_info:
            file_name = command_info["file_name"] + "command.py"
            file_path = self.get_file_output_path(["bin", file_name])
            self.set_template_and_render(
                template_file_path=["custom_command"],
                file_name=command_info["template"],
            )
            rendered_content = self._template.render(
                file_name=command_info["file_name"],
                class_name=command_info["class_name"],
                description=command_info["description"],
                syntax=command_info["syntax"],
                arguments=command_info["arguments"],
                import_map=command_info["import_map"],
            )
            self.writer(
                file_name=file_name,
                file_path=file_path,
                content=rendered_content,
            )
            GENERATED_FILES.update({file_name: file_path})
        return GENERATED_FILES
