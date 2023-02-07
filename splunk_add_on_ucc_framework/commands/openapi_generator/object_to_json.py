import json as json_lib
import copy
import dataclasses
from typing import Any

class EnhancedJSONEncoder(json_lib.JSONEncoder):
        def default(self, o):
            if dataclasses.is_dataclass(o):
                return dataclasses.asdict(o)
            return super().default(o)
        
class Init(object):
    
    def _list_iterator(self, l: list) -> list:
        return_list = []
        for i in l:
            if i == None:
                pass
            elif type(i) is list:
                return_list.append(self._list_iterator(i))
            elif type(i) is dict:
                return_list.append(self._iterator(i))
            else:
                return_list.append(i)
        return return_list
    
    def _iterator(self, json: Any):
        d = {}
        for k,v in json.items():
            if v == None:
                pass
            elif type(v) is list:
                d[k] = self._list_iterator(v)
            elif type(v) is dict:
                d[k] = self._iterator(v)
            else:
                d[k] = v
        return d

    def __str__(self) -> str:
        return json_lib.dumps(self, cls=EnhancedJSONEncoder)
 
    def get_json(self,*,remove_nulls: bool=False) -> json_lib:
        j = json_lib.loads(str(self))
        if remove_nulls:
            j = self._iterator(json=j)
        return j
    
    @property
    def json(self) -> json_lib:
        return self.get_json(remove_nulls=True)
         