import functools
import json
from typing import Any, Dict
from pathlib import Path

import jsonschema
import pytest
from jsonschema.exceptions import ValidationError

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

        def with_tab_entity(self, entity, tabnum=0):
            self["pages"]["configuration"]["tabs"][tabnum]["entity"].append(entity)
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


def test_interval_entity_correct(schema_validate, config):
    schema_validate(
        config.with_tab_entity({"type": "interval"}).with_tab_entity(
            {"type": "interval", "field": "interval", "label": "Interval"}
        )
    )


@pytest.mark.parametrize(
    "value", [-1, 0, 0.1, 100, 100.1, "-1", "0", "0.1", "100", "100.1"]
)
def test_interval_entity_default_value_correct(schema_validate, config, value):
    schema_validate(config.with_tab_entity({"type": "interval", "defaultValue": value}))


@pytest.mark.parametrize(
    "value",
    [
        -10,
        -10.1,
        -1.1,
        "-10",
        "-1.0",
        "-0.1",
        "01",
        "01.1",
        "1.",
        ".1",
    ],
)
def test_interval_entity_default_value_incorrect(schema_validate, config, value):
    with pytest.raises(ValidationError):
        schema_validate(
            config.with_tab_entity({"type": "interval", "defaultValue": value})
        )


def test_interval_entity_options(schema_validate, config):
    schema_validate(
        config.with_tab_entity({"type": "interval", "options": {"min": 1}})
        .with_tab_entity({"type": "interval", "options": {"max": 3}})
        .with_tab_entity({"type": "interval", "options": {"min": 1, "max": 3}})
        .with_tab_entity({"type": "interval", "options": {"range": [1, 3]}})
    )


@pytest.mark.parametrize(
    "value", [{"min": 123, "max": 456, "range": [1, 3]}, {"range": [1, 2, 3]}]
)
def test_interval_entity_options_incorrect(schema_validate, config, value):
    with pytest.raises(ValidationError):
        schema_validate(config.with_tab_entity({"type": "interval", "options": value}))
