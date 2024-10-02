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


class HTMLGenerator(FileGenerator):
    __description__ = "DESCRIBE THE HTML FILE THAT IS GENERATED"

    def _set_attributes(self, **kwargs: Any) -> Union[NoReturn, None]:
        # parse self._global_config and set the require attributes for self
        raise NotImplementedError()

    def generate(self) -> Dict[str, str]:
        html_files = self.generate_html()
        return html_files if html_files else {"": ""}

    def generate_html(self) -> Union[Dict[str, str], None]:
        # uses the attributes set in  _set_attributes method to set the required attributes
        # uses set_template_and_render to load and render the HTML template.
        # use self.writer function to create the html file.
        return {"": ""}
