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
from typing import Any, Dict, Union, NoReturn
from ..file_generator import FileGenerator


class ConfGenerator(FileGenerator):
    __description__ = "DESCRIBE THE CONF FILE THAT IS GENERATED"

    def _set_attributes(self, **kwargs: Any) -> Union[NoReturn, None]:
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError()

    def generate(self) -> Dict[str, str]:
        conf_files: Dict[str, str] = {}
        conf_file = self.generate_conf()
        conf_spec_file = self.generate_conf_spec()
        if conf_file:
            conf_files.update(conf_file)
        if conf_spec_file:
            conf_files.update(conf_spec_file)
        return conf_files

    def generate_conf(self) -> Union[Dict[str, str], None]:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return {"": ""}

    def generate_conf_spec(self) -> Union[Dict[str, str], None]:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return {"": ""}
