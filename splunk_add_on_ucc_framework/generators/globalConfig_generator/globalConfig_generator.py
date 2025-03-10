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
from typing import Any, Dict, Union, NoReturn
from ..file_generator import FileGenerator


class GlobalConfigGenerator(FileGenerator):
    __description__ = "DESCRIBE THE MINIMAL GLOBAL CONFIG FILE THAT IS GENERATED"

    def _set_attributes(self, **kwargs: Any) -> Union[NoReturn, None]:
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError()

    def generate(self) -> Dict[str, str]:
        globalConfig_file = self.generate_globalconfig()
        return globalConfig_file if globalConfig_file else {"": ""}

    def generate_globalconfig(self) -> Union[Dict[str, str], None]:
        # logic to pass the configs to template file
        # uses the attributes set in  _set_attributes method to render the template
        # use self.get_file_output_path() to get the output file to create the file
        return {"": ""}
