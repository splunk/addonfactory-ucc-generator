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
import os
import ast
from pathlib import Path
from typing import Any, Optional
from splunk_add_on_ucc_framework.generators.file_generator import FileGenerator
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class CustomCommandPy(FileGenerator):
    __description__ = "Generates Python files for custom search commands provided in the globalConfig."

    def __init__(
        self, global_config: GlobalConfig, input_dir: str, output_dir: str
    ) -> None:
        super().__init__(global_config, input_dir, output_dir)
        self.commands_info = []
        for command in global_config.custom_search_commands:
            argument_list: list[str] = []
            import_map = False
            imported_file_name = command["fileName"].replace(".py", "")
            template = command["commandType"].replace(" ", "_") + ".template"
            if command["commandType"] == "transforming":
                module_path = Path(
                    os.path.realpath(
                        os.path.join(self._input_dir, "bin", command["fileName"])
                    )
                )

                if not module_path.is_file():
                    raise FileNotFoundError(
                        f"Module path '{module_path}' does not point to a valid file."
                    )
                module_content = ast.parse(module_path.read_text(encoding="utf-8"))
                for node in module_content.body:
                    if isinstance(node, ast.FunctionDef) and node.name == "map":
                        import_map = True

            for argument in command["arguments"]:
                argument_dict = {
                    "name": argument["name"],
                    "require": argument.get("required", False),
                    "validate": argument.get("validate"),
                    "default": argument.get("defaultValue"),
                }
                self.argument_generator(argument_list, argument_dict)
            self.commands_info.append(
                {
                    "imported_file_name": imported_file_name,
                    "file_name": command["commandName"],
                    "class_name": command["commandName"].title(),
                    "description": command.get("description"),
                    "syntax": command.get("syntax"),
                    "template": template,
                    "list_arg": argument_list,
                    "import_map": import_map,
                }
            )

    def argument_generator(
        self, argument_list: list[str], arg: dict[str, Any]
    ) -> list[str]:
        validate_str = ""
        validate = arg.get("validate", {})
        if validate:
            validate_type = validate["type"]
            if validate_type in ("Integer", "Float"):
                min_val = validate.get("minimum")
                max_val = validate.get("maximum")
                args = []
                if min_val is not None:
                    args.append(f"minimum={min_val}")
                if max_val is not None:
                    args.append(f"maximum={max_val}")
                validate_args = ", ".join(args)
                validate_str = (
                    f", validate=validators.{validate_type}({validate_args})"
                    if args
                    else f", validate=validators.{validate_type}()"
                )
            else:
                validate_str = f", validate=validators.{validate_type}()"

        if arg["default"] is None:
            arg_str = (
                f"{arg['name']} = Option(name='{arg['name']}', "
                f"require={arg.get('require')}"
                f"{validate_str})"
            )
        else:
            arg_str = (
                f"{arg['name']} = Option(name='{arg['name']}', "
                f"require={arg.get('require')}"
                f"{validate_str}, "
                f"default='{arg.get('default', '')}')"
            )
        argument_list.append(arg_str)
        return argument_list

    def generate(self) -> Optional[list[dict[str, str]]]:
        if not self.commands_info:
            return None

        generated_files = []
        for command_info in self.commands_info:
            file_name = command_info["file_name"] + ".py"
            file_path = self.get_file_output_path(["bin", file_name])
            self.set_template_and_render(
                template_file_path=["custom_command"],
                file_name=command_info["template"],
            )
            rendered_content = self._template.render(
                imported_file_name=command_info["imported_file_name"],
                class_name=command_info["class_name"],
                description=command_info["description"],
                syntax=command_info["syntax"],
                list_arg=command_info["list_arg"],
                import_map=command_info["import_map"],
            )
            generated_files.append(
                {
                    "file_name": file_name,
                    "file_path": file_path,
                    "content": rendered_content,
                }
            )
        return generated_files
