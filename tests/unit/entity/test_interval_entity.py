from splunk_add_on_ucc_framework.entity import IntervalEntity

from splunk_add_on_ucc_framework.entity.interval_entity import CRON_REGEX


def test_interval_minimal_definition():
    definition = {"type": "interval", "field": "interval", "label": "Interval"}
    interval = IntervalEntity.from_definition(definition)

    assert interval == definition
    assert interval.short_form() == definition
    assert interval.long_form() == {
        "field": "interval",
        "label": "Interval",
        "type": "text",
        "validators": [
            {
                "errorMsg": "Interval must be either a non-negative number, CRON interval or -1.",
                "pattern": CRON_REGEX,
                "type": "regex",
            }
        ],
    }


def test_interval_full_definition():
    definition = {
        "type": "interval",
        "field": "interval",
        "label": "Interval input",
        "required": True,
        "defaultValue": 15,
        "help": "Some help",
        "options": {
            "range": [10, 20],
        },
    }
    interval = IntervalEntity.from_definition(definition)

    assert interval == definition
    assert interval.short_form() == definition
    assert interval.long_form() == {
        "field": "interval",
        "label": "Interval input",
        "type": "text",
        "defaultValue": 15,
        "help": "Some help",
        "required": True,
        "validators": [
            {
                "errorMsg": "Interval input must be either a non-negative number, CRON interval or -1.",
                "pattern": CRON_REGEX,
                "type": "regex",
            },
            {
                "errorMsg": "Interval input must be between 10 and 20",
                "range": [10, 20],
                "type": "number",
            },
        ],
    }


def test_interval_migration():
    definition = {
        "field": "interval",
        "label": "Interval",
        "type": "text",
        "defaultValue": 15,
        "help": "Some help",
        "tooltip": "Some tooltip",
        "required": True,
        "validators": [
            {
                "errorMsg": "Interval must be either a non-negative number, CRON interval or -1.",
                "pattern": CRON_REGEX,
                "type": "regex",
            },
        ],
    }

    expected_definition = {
        "type": "interval",
        "field": "interval",
        "label": "Interval",
        "required": True,
        "defaultValue": 15,
        "help": "Some help",
        "tooltip": "Some tooltip",
    }

    entity = IntervalEntity.from_definition(definition)
    assert entity == expected_definition
    assert entity.long_form() == definition
    assert entity.short_form() == expected_definition


def test_interval_migration_with_range():
    definition = {
        "field": "interval",
        "label": "Interval",
        "type": "text",
        "defaultValue": 15,
        "help": "Some help",
        "tooltip": "Some tooltip",
        "required": True,
        "validators": [
            {
                "errorMsg": "Interval must be either a non-negative number, CRON interval or -1.",
                "pattern": CRON_REGEX,
                "type": "regex",
            },
            {
                "errorMsg": "Interval must be between 10 and 20",
                "range": [10, 20],
                "type": "number",
            },
        ],
    }

    expected_definition = {
        "type": "interval",
        "field": "interval",
        "label": "Interval",
        "required": True,
        "defaultValue": 15,
        "help": "Some help",
        "tooltip": "Some tooltip",
        "options": {
            "range": [10, 20],
        },
    }

    entity = IntervalEntity.from_definition(definition)
    assert entity == expected_definition
    assert entity.long_form() == definition
    assert entity.short_form() == expected_definition


def test_interval_migration_wrong_type():
    definition = {
        "type": "singleSelect",
        "label": "Object",
        "field": "object",
        "required": True,
    }
    assert IntervalEntity.from_definition(definition) is None


def test_interval_migration_wrong_field():
    definition = {
        "type": "text",
        "field": "other_field",
        "label": "Other field",
        "validators": [
            {
                "errorMsg": "Other field must be either a non-negative number, CRON interval or -1.",
                "pattern": CRON_REGEX,
                "type": "regex",
            },
        ],
    }
    assert IntervalEntity.from_definition(definition) is None


def test_interval_migration_no_validation():
    definition = {
        "field": "interval",
        "label": "Interval",
        "type": "text",
        "defaultValue": 15,
        "help": "Some help",
        "tooltip": "Some tooltip",
        "required": True,
    }
    assert IntervalEntity.from_definition(definition) is None
