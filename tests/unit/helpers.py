import functools
import json
import os
from typing import Dict

import yaml

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


def get_path_to_source_dir() -> str:
    return os.path.join(
        os.getcwd(),
        "splunk_add_on_ucc_framework",
    )


def get_testdata_file_path(file_name: str) -> str:
    return os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "testdata", file_name
    )


def get_testdata_file(file_name: str) -> str:
    file_path = get_testdata_file_path(file_name)
    with open(file_path) as fp:
        return fp.read()


def get_testdata(file_name: str) -> Dict:
    config = get_testdata_file(file_name)
    if file_name.endswith(".json"):
        return json.loads(config)
    else:
        return yaml_load(config)
