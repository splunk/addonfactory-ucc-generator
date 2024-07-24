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
from abc import abstractmethod
from typing import Any, Dict

from splunk_add_on_ucc_framework.global_config import GlobalConfig

from ..file_generator import FileGenerator


class ConfGenerator(FileGenerator):
    __description__ = "DESCRIBE THE CONF FILE THAT IS GENERATED"

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)
        self.conf_file = ".conf"

    def generate(self) -> Dict[str, str]:
        conf_files: Dict[str, str] = {}
        conf_files.update(self.generate_conf())
        conf_files.update(self.generate_conf_spec())
        return conf_files

    @abstractmethod
    def _set_attributes(self, **kwargs: Any) -> None:
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError

    def generate_conf(self) -> Dict[str, str]:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return {"": ""}

    def generate_conf_spec(self) -> Dict[str, str]:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return {"": ""}

    @property
    def conf_spec_file(self) -> str:
        return f"{self.conf_file}.spec"
