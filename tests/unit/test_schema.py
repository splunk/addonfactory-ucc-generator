import functools
from typing import Any

import jsonschema
import pytest
from jsonschema.exceptions import ValidationError


@pytest.fixture
def schema_validate(schema_json):
    return functools.partial(jsonschema.validate, schema=schema_json)


@pytest.fixture
def config(global_config_all_json_content):
    class BetterDict(dict[Any, Any]):
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
        config.with_tab_entity(
            {"type": "interval", "field": "interval", "label": "Interval"}
        )
    )


@pytest.mark.parametrize(
    "value", [-1, 0, 0.1, 100, 100.1, "-1", "0", "0.1", "01", "01.1", "100", "100.1"]
)
def test_interval_entity_default_value_correct(schema_validate, config, value):
    schema_validate(
        config.with_tab_entity(
            {
                "type": "interval",
                "field": "interval",
                "label": "Interval",
                "defaultValue": value,
            }
        )
    )


@pytest.mark.parametrize(
    "value",
    [
        -10,
        -10.1,
        -1.1,
        "-10",
        "-1.0",
        "-0.1",
        "1.",
        ".1",
    ],
)
def test_interval_entity_default_value_incorrect(schema_validate, config, value):
    with pytest.raises(ValidationError):
        schema_validate(
            config.with_tab_entity(
                {
                    "type": "interval",
                    "field": "interval",
                    "label": "Interval",
                    "defaultValue": value,
                }
            )
        )


def test_interval_entity_options(schema_validate, config):
    schema_validate(
        config.with_tab_entity(
            {
                "type": "interval",
                "field": "interval",
                "label": "Interval",
                "options": {"range": [1, 3]},
            }
        )
    )


def test_rest_handler_without_ui(schema_validate, config):
    crh = {
        "name": "some_name",
        "endpoint": "some_endpoint",
        "handlerType": "EAI",
        "registerHandler": {
            "file": "my_handler.py",
            "actions": ["list", "create", "edit", "remove"],
        },
        "requestParameters": {
            "create": {
                "some_param": {"schema": {"type": "string"}, "required": True},
                "other_param": {"schema": {"type": "number"}},
                "other_param_nullable": {
                    "schema": {
                        "type": "number",
                        "nullable": True,
                    }
                },
            },
            "list": {
                "array_param": {
                    "schema": {
                        "type": "array",
                        "items": {"type": "string"},
                    }
                },
                "obj_param": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "key": {"type": "string"},
                        },
                    }
                },
            },
        },
        "responseParameters": {
            "list": {
                "some_param": {"schema": {"type": "string"}},
            },
        },
    }
    config.setdefault("options", {})["restHandlers"] = [crh]
    schema_validate(config)

    crh["registerHandler"] = {
        "file": "my_handler.py",
        "actions": ["list", "create", "edit", "remove"],
    }

    schema_validate(config)
