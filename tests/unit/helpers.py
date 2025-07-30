import functools
import json
import os
from typing import Dict, Any
from pathlib import Path
import yaml
import xmldiff.main

from splunk_add_on_ucc_framework import __file__ as module_init_path

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


def write_conf_file(path: Path, content: str) -> int:
    return path.write_text(content)


def compare_xml_content(content: str, expected_content: str) -> str:
    diff = xmldiff.main.diff_texts(content, expected_content)
    return " ".join([str(item) for item in diff])


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


def copy_testdata_gc_to_tmp_file(tmp_file_gc: Path, gc_to_load: str) -> None:
    global_config_path = get_testdata_file_path(gc_to_load)

    with open(global_config_path) as file:
        data = file.read()

    with open(tmp_file_gc, "w+") as file:
        file.write(data)
