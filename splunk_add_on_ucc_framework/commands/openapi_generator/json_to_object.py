#
# Copyright 2023 Splunk Inc.
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
from typing import Any, Dict


class DataClasses:
    def __init__(self, json: Dict) -> None:
        self.__dict__.update(self._iterator(json))
        #   __dict__ contains references to base object
        #   update, do not override!

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, DataClasses):
            return NotImplemented
        return self.__dict__ == other.__dict__

    def _iteration_manager(self, element: Any) -> Any:
        if isinstance(element, dict):
            return DataClasses(element)
        elif isinstance(element, list):
            return self._list_iterator(element)
        else:
            return element

    def _list_iterator(self, _list: list) -> list:
        return_list = []
        for i in _list:
            return_list.append(self._iteration_manager(i))
        return return_list

    def _iterator(self, json: Any):
        d = json
        for k, v in json.items():
            d[k] = self._iteration_manager(v)
        return d
