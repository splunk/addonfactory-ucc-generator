import pytest

from splunk_add_on_ucc_framework.tabs import Tab, resolve_tab, LoggingTab


@pytest.fixture
def definition():
    return {
        "name": "logging",
        "warning": {"config": {"message": "Some warning for account text config"}},
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


@pytest.fixture
def tab(definition):
    return Tab(definition)


def test_tab_object_equal_to_definition(definition, tab):
    assert definition == tab


def test_tab_parameters(tab, definition):
    assert definition["name"] == tab["name"] == tab.name
    assert definition["title"] == tab["title"] == tab.title
    assert definition["entity"] == tab["entity"] == tab.entity


def test_resolve_tab_normal(definition):
    tab = resolve_tab(definition)
    assert type(tab) is Tab
    assert definition["name"] == tab["name"] == tab.name


def test_resolve_tab_other():
    tab = resolve_tab({"type": "loggingTab"})
    assert type(tab) is LoggingTab
    assert "name" not in tab
    assert tab.name is not None
