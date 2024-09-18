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
import os
import os.path as op
from typing import Dict, List, Set

from splunk_add_on_ucc_framework.commands.rest_builder import (
    global_config_builder_schema,
)
from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig

__all__ = ["RestBuilder"]

_import_declare_content = """
import os
import sys
import re
from os.path import dirname

ta_name = '{ta_name}'
pattern = re.compile(r'[\\\\/]etc[\\\\/]apps[\\\\/][^\\\\/]+[\\\\/]bin[\\\\/]?$')
new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]
new_paths.insert(0, os.path.join(dirname(dirname(__file__)), "lib"))
new_paths.insert(0, os.path.sep.join([os.path.dirname(__file__), ta_name]))
sys.path = new_paths
"""

_import_declare_os_lib_content = """
bindir = os.path.dirname(os.path.realpath(os.path.dirname(__file__)))
libdir = os.path.join(bindir, "lib")
platform = sys.platform
python_version = "".join(str(x) for x in sys.version_info[:2])
"""


def _generate_import_declare_test(
    schema: global_config_builder_schema.GlobalConfigBuilderSchema,
) -> str:
    base_content = _import_declare_content.format(ta_name=schema.product)
    libraries = schema.global_config.os_libraries
    if not libraries:
        return base_content

    base_content += _import_declare_os_lib_content
    os_lib_part = ""

    paths = group_libs_by_python_version_and_platform(libraries)
    for python_version, os_specific_paths in paths.items():
        os_lib_part += f'\nif python_version == "{python_version}":\n'
        for lib_os, targets in os_specific_paths.items():
            if lib_os == "windows":
                os_lib_part += '\tif platform.startswith("win"):\n'
                for target in targets:
                    os_lib_part += get_insert_to_syspath_str(target)
            elif lib_os == "darwin":
                os_lib_part += '\tif platform.startswith("darwin"):\n'
                for target in targets:
                    os_lib_part += get_insert_to_syspath_str(target)
            else:
                os_lib_part += '\tif platform.startswith("linux"):\n'
                for target in targets:
                    os_lib_part += get_insert_to_syspath_str(target)

    return base_content + os_lib_part


def group_libs_by_python_version_and_platform(
    libraries: List[OSDependentLibraryConfig],
) -> Dict[str, Dict[str, Set[str]]]:
    """Returns os specific paths grouped by python version and platform"""
    python_versions = {lib.python_version for lib in libraries}
    os_specific_paths = {}
    for python_version in python_versions:
        os_specific_paths[python_version] = get_paths_to_add(
            [lib for lib in libraries if lib.python_version == python_version]
        )
    return os_specific_paths


def get_paths_to_add(libraries: List[OSDependentLibraryConfig]) -> Dict[str, Set[str]]:
    result: Dict[str, Set[str]] = {}
    for library in libraries:
        lib_os = library.os
        target = os.path.normpath(library.target)
        result.setdefault(lib_os, set()).add(target)
    return result


def get_insert_to_syspath_str(target: str) -> str:
    return f'\t\tsys.path.insert(0, os.path.join(libdir, "{target}"))\n'


class _RestBuilderOutput:
    readme = "README"
    default = "default"
    bin = "bin"

    def __init__(self, path: str) -> None:
        self._path = path
        self._root_path = op.abspath(self._path)
        if not op.isdir(self._root_path):
            os.makedirs(self._root_path)
        self._content: Dict[str, List[str]] = {}

    def put(self, subpath: str, file_name: str, content: str) -> None:
        path = op.join(self._root_path, subpath)
        if not op.isdir(path):
            os.makedirs(path)
        full_name = op.join(path, file_name)
        if full_name not in self._content:
            self._content[full_name] = []
        self._content[full_name].append(content)

    def save(self) -> None:
        for full_name, contents in list(self._content.items()):
            full_content = "\n\n".join(contents)
            with open(full_name, "w") as f:
                f.writelines(full_content)


class RestBuilder:
    def __init__(
        self,
        schema: global_config_builder_schema.GlobalConfigBuilderSchema,
        output_path: str,
    ) -> None:
        self._schema = schema
        self._output_path = output_path
        self.output = _RestBuilderOutput(self._output_path)

    def add_executable_attribute(self) -> None:
        def _add_executable_attribute(file_path: str) -> None:
            if op.isfile(file_path):
                st = os.stat(file_path)
                os.chmod(file_path, st.st_mode | 0o111)

        bin_path = os.path.join(
            self._output_path,
            self.output.bin,
        )
        files_under_bin = os.listdir(bin_path)
        for file_path in files_under_bin:
            _add_executable_attribute(file_path)

    def build(self) -> None:
        for endpoint in self._schema.endpoints:
            self.output.put(
                self.output.bin,
                endpoint.rh_name + ".py",
                endpoint.generate_rh(),
            )

        self.output.put(
            self.output.bin,
            "import_declare_test.py",
            _generate_import_declare_test(self._schema),
        )
        self.output.save()
