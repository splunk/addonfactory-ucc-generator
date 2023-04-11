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


class GlobalConfigPostProcessor:
    """
    Post process for REST builder.
    """

    output_local = "local"
    _import_declare_template = """
import {import_declare_name}
"""

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

    def __init__(self):
        self.builder = None
        self.schema = None
        self.import_declare_name = "import_declare_test"

    @property
    def root_path(self):
        return getattr(self.builder.output, "_path")

    def import_declare_py_name(self):
        if self.import_declare_name:
            return self.import_declare_name
        return f"{self.schema.namespace}_import_declare"

    def import_declare_py_content(self):
        import_declare_file = op.join(
            self.root_path,
            self.builder.output.bin,
            self.import_declare_py_name() + ".py",
        )
        content = self._import_declare_content.format(
            ta_name=self.schema.product,
        )
        with open(import_declare_file, "w") as f:
            f.write(content)

    def import_declare(self, rh_file):
        with open(rh_file) as f:
            cont = f.readlines()
        import_declare = self._import_declare_template.format(
            import_declare_name=self.import_declare_py_name()
        )
        cont.insert(0, import_declare)
        with open(rh_file, "w") as f:
            f.write("".join(cont))

    def __call__(self, builder, schema):
        """
        :param builder: REST builder
        :param schema: Global Config Schema
        :return:
        """
        self.builder = builder
        self.schema = schema

        self.import_declare_py_content()
        for endpoint in schema.endpoints:
            rh_file = op.join(
                getattr(builder.output, "_path"),
                builder.output.bin,
                endpoint.rh_name + ".py",
            )
            self.import_declare(rh_file)

        # add executable permission to files under bin folder
        def add_executable_attribute(file_path):
            if op.isfile(file_path):
                st = os.stat(file_path)
                os.chmod(file_path, st.st_mode | 0o111)

        bin_path = op.join(getattr(builder.output, "_path"), builder.output.bin)
        items = os.listdir(bin_path)
        list(map(add_executable_attribute, items))
