import functools
import json
from typing import Any, Dict
from pathlib import Path

import jsonschema
import pytest

from splunk_add_on_ucc_framework import __file__ as module_init_path


@pytest.fixture
def schema_path():
    return Path(module_init_path).parent / "schema" / "schema.json"


@pytest.fixture
def schema_json(schema_path):
    with schema_path.open() as fp:
        return json.load(fp)


@pytest.fixture
def schema_validate(schema_json):
    return functools.partial(jsonschema.validate, schema=schema_json)


@pytest.fixture
def config(global_config_all_json_content):
    class BetterDict(Dict[Any, Any]):
        def with_tab(self, tab):
            self["pages"]["configuration"]["tabs"].append(tab)
            return self

    return BetterDict(global_config_all_json_content)


def test_logging_component_short(schema_validate, config):
    schema_validate(config.with_tab({"type": "loggingTab"}))


def test_logging_component_long(schema_validate, config):
    schema_validate(
        config.with_tab(
            {
                "type": "loggingTab",
                "name": "logging",
                "title": "Logging",
                "label": "Log level",
                "field": "loglevel",
                "levels": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
                "defaultLevel": "INFO",
            }
        )
    )
