from pathlib import Path
from typing import Any
from splunk_add_on_ucc_framework.commands.openapi_generator.utils import Load


class Init(object):
    def __init__(self, *, json: Any=None, json_path: Path=None) -> None:
        if json==None and json_path==None:
            raise Exception("Neither json nor json_path defined")
        if json and json_path:
            raise Exception("Both json and json_path defined")
        self._json = json if json!=None else Load.json(path=json_path)

class DataClasses(Init):
    def __getattr__(self, name: str):
        _name = f"_{name}"
        if _name in self.__dict__:
            return self.__dict__[_name]
        else:
            raise AttributeError()
            #   hasattr expects AttributeError exception

    def _iteration_manager(self, element: Any) -> Any:
        if type(element) is dict:
            return DataClasses(json=element)
        elif type(element) is list:
            return self._list_iterator(element)
        else:
            return element
    
    def _list_iterator(self, l: list) -> list:
        return_list = []
        for i in l:
            return_list.append(self._iteration_manager(i))
        return return_list
    
    def _iterator(self, json: Any):
        d = json
        for k,v in json.items():
            d[k] = self._iteration_manager(v)
        return d
    
    def __init__(self, *, json: Any = None, json_path: Path=None) -> None:
        super().__init__(json=json, json_path=json_path)
        if type(self._json) is not dict:
            raise TypeError("Json used to create DataClasses has to contain dict at root level")
        self.__dict__.update(self._iterator(self._json))
        #   __dict__ contains references to base object
        #   update, do not override!
