import functools
import json
import os
from typing import Dict, Any

import yaml

from splunk_add_on_ucc_framework import __file__ as module_init_path

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


def get_path_to_source_dir() -> str:
    return os.path.dirname(module_init_path)


def get_testdata_file_path(file_name: str) -> str:
    return os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "testdata", file_name
    )


def get_testdata_file(file_name: str) -> str:
    file_path = get_testdata_file_path(file_name)
    with open(file_path) as fp:
        return fp.read()


def get_testdata(file_name: str) -> Dict[str, Any]:
    config = get_testdata_file(file_name)
    if file_name.endswith(".json"):
        return json.loads(config)
    else:
        return yaml_load(config)
