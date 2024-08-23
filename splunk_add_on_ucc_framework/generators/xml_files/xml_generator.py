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
from ..file_generator import FileGenerator
from typing import Dict, Any, Union, NoReturn
from splunk_add_on_ucc_framework.global_config import GlobalConfig


class XMLGenerator(FileGenerator):
    __description__ = "DESCRIBE THE XML FILE THAT IS GENERATED"

    def __init__(
        self,
        global_config: GlobalConfig,
        input_dir: str,
        output_dir: str,
        **kwargs: Any
    ) -> None:
        super().__init__(global_config, input_dir, output_dir, **kwargs)

    def _set_attributes(self, **kwargs: Any) -> Union[NoReturn, None]:
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError()

    def generate(self) -> Dict[str, str]:
        xml_files = self.generate_xml()
        return xml_files if xml_files else {"": ""}

    def generate_xml(self) -> Union[Dict[str, str], None]:
        # uses the attributes set in  _set_attributes method to set the required attributes
        # use self.writer function to create the xml file.
        return {"": ""}
