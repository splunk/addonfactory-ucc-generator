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
import json as json_lib
import dataclasses
from typing import Any, Dict, List


class EnhancedJSONEncoder(json_lib.JSONEncoder):
    def default(self, o: Any) -> Dict[str, Any]:
        if dataclasses.is_dataclass(o):
            return dataclasses.asdict(o)
        return super().default(o)


class Init:
    def _list_iterator(self, _list: List[Any]) -> Any:
        return_list = []
        for i in _list:
            if i is None:
                pass
            elif isinstance(i, list):
                return_list.append(self._list_iterator(i))
            elif isinstance(i, dict):
                return_list.append(self._iterator(i))
            else:
                return_list.append(i)
        return return_list

    def _iterator(self, json: Any) -> Any:
        d = {}
        for k, v in json.items():
            if v is None:
                pass
            elif isinstance(v, list):
                d[k] = self._list_iterator(v)
            elif isinstance(v, dict):
                d[k] = self._iterator(v)
            else:
                d[k] = v
        return d

    def __str__(self) -> str:
        return json_lib.dumps(self, cls=EnhancedJSONEncoder)

    def get_json(self, *, remove_nulls: bool = False) -> Dict[Any, Any]:
        j = json_lib.loads(str(self))
        if remove_nulls:
            j = self._iterator(json=j)
        return j

    @property
    def json(self) -> Dict[Any, Any]:
        return self.get_json(remove_nulls=True)
