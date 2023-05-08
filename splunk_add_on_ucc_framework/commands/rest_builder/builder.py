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
import os
import os.path as op

from splunk_add_on_ucc_framework.commands.rest_builder import (
    global_config_builder_schema,
)
from splunk_add_on_ucc_framework.rest_map_conf import RestmapConf
from splunk_add_on_ucc_framework.web_conf import WebConf

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


def _generate_import_declare_test(addon_name: str) -> str:
    return _import_declare_content.format(ta_name=addon_name)


class _RestBuilderOutput:
    readme = "README"
    default = "default"
    bin = "bin"

    def __init__(self, path):
        self._path = path
        self._root_path = op.abspath(self._path)
        if not op.isdir(self._root_path):
            os.makedirs(self._root_path)
        self._content = {}

    def put(self, subpath, file_name, content):
        path = op.join(self._root_path, subpath)
        if not op.isdir(path):
            os.makedirs(path)
        full_name = op.join(path, file_name)
        if full_name not in self._content:
            self._content[full_name] = []
        self._content[full_name].append(content)

    def save(self):
        for full_name, contents in list(self._content.items()):
            full_content = "\n\n".join(contents)
            with open(full_name, "w") as f:
                f.writelines(full_content)


class RestBuilder:
    def __init__(
        self,
        schema: global_config_builder_schema.GlobalConfigBuilderSchema,
        output_path: str,
    ):
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

    def build(self):
        for endpoint in self._schema.endpoints:
            # If the endpoint is oauth, which is for getting accesstoken. Conf file entries should not get created.
            if endpoint._name != "oauth":
                if endpoint._name == "settings":
                    self.output.put(
                        self.output.default,
                        endpoint.conf_name + ".conf",
                        endpoint.generate_conf_with_default_values(),
                    )

                self.output.put(
                    self.output.readme,
                    endpoint.conf_name + ".conf.spec",
                    endpoint.generate_spec(),
                )

                # Add data input of self defined conf to inputs.conf.spec
                if endpoint._entities[0] and endpoint._entities[0]._conf_name:
                    lines = [
                        "[" + endpoint._name + "://<name>]",
                        "placeholder = placeholder",
                    ]
                    self.output.put(
                        self.output.readme, "inputs.conf.spec", "\n".join(lines)
                    )

            self.output.put(
                self.output.bin,
                endpoint.rh_name + ".py",
                endpoint.generate_rh(),
            )

        self.output.put(
            self.output.default,
            "restmap.conf",
            RestmapConf.build(
                self._schema.endpoints,
                self._schema.namespace,
            ),
        )
        self.output.put(
            self.output.default,
            "web.conf",
            WebConf.build(self._schema.endpoints),
        )
        self.output.put(
            self.output.bin,
            "import_declare_test.py",
            _generate_import_declare_test(self._schema.product),
        )
        self.output.save()
