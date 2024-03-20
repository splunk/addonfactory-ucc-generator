import pytest

from splunk_add_on_ucc_framework.tabs import LoggingTab


@pytest.fixture
def tab_short():
    return LoggingTab({"type": "loggingTab"})


@pytest.fixture
def definition_long():
    return {
        "type": "loggingComponent",
        "name": "logging_other",
        "title": "Logging other",
        "label": "Log level",
        "field": "loglevel",
        "levels": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        "defaultLevel": "INFO",
    }


@pytest.fixture
def tab_long(definition_long):
    return LoggingTab(definition_long)


@pytest.fixture
def generic_tab_def():
    return {
        "name": "logging",
        "entity": [
            {
                "type": "singleSelect",
                "label": "Log level",
                "options": {
                    "disableSearch": True,
                    "autoCompleteFields": [
                        {"value": "DEBUG", "label": "DEBUG"},
                        {"value": "INFO", "label": "INFO"},
                        {"value": "WARNING", "label": "WARNING"},
                        {"value": "ERROR", "label": "ERROR"},
                        {"value": "CRITICAL", "label": "CRITICAL"},
                    ],
                },
                "defaultValue": "INFO",
                "field": "loglevel",
            }
        ],
        "title": "Logging",
    }


def test_logging_short_tab_has_default_parameters(tab_short):
    assert "name" not in tab_short
    assert tab_short.name == "logging"
    assert "title" not in tab_short
    assert tab_short.title == "Logging"
    assert "entity" not in tab_short
    assert len(tab_short.entity) > 0


def test_logging_long_tab_overrides_parameters(tab_long, definition_long):
    assert tab_long.name == definition_long["name"]
    assert tab_long.title == definition_long["title"]


def test_logging_tab_migration_more_keys(generic_tab_def):
    generic_tab_def["warning"] = {
        "config": {"message": "Some warning for account text config"}
    }
    assert LoggingTab.from_definition(generic_tab_def) is None


def test_logging_tab_migration_wrong_entity_type(generic_tab_def):
    generic_tab_def["entity"][0]["type"] = "otherType"
    assert LoggingTab.from_definition(generic_tab_def) is None


def test_logging_tab_migration_more_entities(generic_tab_def):
    generic_tab_def["entity"].append({"some": "entity"})
    assert LoggingTab.from_definition(generic_tab_def) is None


def test_logging_tab_migration_different_levels(generic_tab_def):
    generic_tab_def["entity"][0]["options"]["autoCompleteFields"] = [
        {"value": "SOME", "label": "SOME"},
        {"value": "LEVEL", "label": "LEVEL"},
    ]
    assert LoggingTab.from_definition(generic_tab_def) is None


def test_logging_tab_migration_defaults(generic_tab_def):
    tab = LoggingTab.from_definition(generic_tab_def)
    assert tab == {"type": "loggingTab"}
    assert tab.render() == generic_tab_def


def test_logging_tab_migration_different_parameters(generic_tab_def):
    generic_tab_def["name"] = "logging_new"
    generic_tab_def["title"] = "Logging new"
    generic_tab_def["entity"][0]["defaultValue"] = "CRITICAL"
    generic_tab_def["entity"][0]["field"] = "log_level"
    generic_tab_def["entity"][0]["label"] = "Log level value"

    tab = LoggingTab.from_definition(generic_tab_def)
    assert tab == {
        "defaultLevel": "CRITICAL",
        "field": "log_level",
        "label": "Log level value",
        "name": "logging_new",
        "title": "Logging new",
        "type": "loggingTab",
    }
    assert tab.render() == generic_tab_def
