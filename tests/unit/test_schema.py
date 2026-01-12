import json
import pytest
from pathlib import Path
from jsonschema import Draft7Validator
from referencing import Registry, Resource
from jsonschema.exceptions import ValidationError
from typing import Any


# Build registry once for all tests
@pytest.fixture(scope="session")
def schema_registry():
    """Load all schema files into a registry (matches production logic)."""
    schema_dir = Path("splunk_add_on_ucc_framework/schema")
    registry = Registry()

    for json_path in schema_dir.rglob("*.json"):
        schema_data = json.loads(json_path.read_text())
        resource = Resource.from_contents(schema_data)

        # Path relative to schema root, EXACTLY like runtime
        schema_id = str(json_path.relative_to(schema_dir))

        registry = registry.with_resource(uri=schema_id, resource=resource)

    return registry


# Load root schema.json
@pytest.fixture(scope="session")
def root_schema():
    schema_dir = Path("splunk_add_on_ucc_framework/schema")
    return json.loads((schema_dir / "schema.json").read_text())


# Create validator fixture
@pytest.fixture
def schema_validate(root_schema, schema_registry):
    """
    Returns a function that validates config against the root schema
    using the registry (matches the updated validator).
    """
    validator = Draft7Validator(root_schema, registry=schema_registry)

    def validate_func(instance):
        errors = sorted(validator.iter_errors(instance), key=lambda e: e.path)
        if errors:
            for error in errors:
                print(
                    "\nVALIDATION ERROR:",
                    {
                        "path": list(error.path),
                        "message": error.message,
                    },
                )
            raise ValidationError("schema validation failed")

    return validate_func


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
    payload = config.with_tab({"type": "loggingTab"})
    schema_validate(payload)


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
