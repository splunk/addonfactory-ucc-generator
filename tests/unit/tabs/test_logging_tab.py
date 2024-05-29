import pytest

from splunk_add_on_ucc_framework.tabs import LoggingTab


@pytest.fixture
def definition_long():
    return {
        "type": "loggingTab",
        "name": "logging",
        "title": "Logging",
        "label": "Log level",
        "field": "loglevel",
        "levels": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        "defaultLevel": "INFO",
        "help": "some help",
    }


@pytest.fixture
def tab_long(definition_long):
    return LoggingTab.from_definition(definition_long)


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
                "required": True,
            }
        ],
        "title": "Logging",
    }


def test_logging_long_tab(tab_long, generic_tab_def):
    generic_tab_def["entity"][0]["help"] = "some help"
    assert tab_long == generic_tab_def


def test_logging_short_tab_has_default_parameters():
    tab_short = LoggingTab.from_definition({"type": "loggingTab"})
    assert tab_short is not None
    assert tab_short["name"] == "logging"
    assert tab_short["title"] == "Logging"
    assert len(tab_short["entity"]) == 1


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
    assert tab is not None
    assert tab.short_form() == {"type": "loggingTab"}
    assert tab == generic_tab_def


def test_logging_tab_migration_different_parameters(generic_tab_def):
    generic_tab_def["name"] = "logging_new"
    generic_tab_def["title"] = "Logging new"
    generic_tab_def["entity"][0]["defaultValue"] = "CRITICAL"
    generic_tab_def["entity"][0]["field"] = "log_level"
    generic_tab_def["entity"][0]["label"] = "Log level value"

    tab = LoggingTab.from_definition(generic_tab_def)
    assert tab is not None
    assert tab.short_form() == {
        "defaultLevel": "CRITICAL",
        "field": "log_level",
        "label": "Log level value",
        "name": "logging_new",
        "title": "Logging new",
        "type": "loggingTab",
    }
    assert tab == generic_tab_def


def test_logging_tab_with_help_and_required_fields():
    tab_json = {
        "name": "logging",
        "title": "Logging",
        "entity": [
            {
                "type": "singleSelect",
                "label": "Log Level",
                "help": "(DEBUG, INFO, WARNING, ERROR or CRITICAL)",
                "required": True,
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
                "field": "loglevel",
            }
        ],
    }

    tab = LoggingTab.from_definition(tab_json)
    assert tab == tab_json
    assert tab.short_form() == {
        "type": "loggingTab",
        "label": "Log Level",
        "help": "(DEBUG, INFO, WARNING, ERROR or CRITICAL)",
    }


def test_logging_tab_different_levels():
    tab_json = {
        "entity": [
            {
                "defaultValue": "INFO",
                "field": "loglevel",
                "type": "singleSelect",
                "label": "Log level",
                "required": True,
                "options": {
                    "autoCompleteFields": [
                        {"value": "DEBUG", "label": "DEBUG"},
                        {"value": "INFO", "label": "INFO"},
                        {"value": "WARN", "label": "WARN"},
                        {"value": "ERROR", "label": "ERROR"},
                        {"value": "CRITICAL", "label": "CRITICAL"},
                    ],
                    "disableSearch": True,
                },
            }
        ],
        "name": "logging",
        "title": "Logging",
    }

    tab = LoggingTab.from_definition(tab_json)
    assert tab == tab_json
    assert tab.short_form() == {
        "type": "loggingTab",
        "levels": [
            "DEBUG",
            "INFO",
            "WARN",
            "ERROR",
            "CRITICAL",
        ],
    }


def test_logging_wrong_type():
    assert LoggingTab.from_definition({"type": "otherTab"}) is None


def test_logging_too_many_entity_parameters(generic_tab_def):
    generic_tab_def["entity"][0]["some_other"] = 123
    assert LoggingTab.from_definition(generic_tab_def) is None


def test_logging_too_many_entity_options(generic_tab_def):
    generic_tab_def["entity"][0]["options"]["some_other"] = 123
    assert LoggingTab.from_definition(generic_tab_def) is None
