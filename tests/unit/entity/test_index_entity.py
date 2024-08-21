from splunk_add_on_ucc_framework.entity import IndexEntity


def test_interval_min_definition():
    definition = {"type": "index", "field": "index", "label": "Index"}
    index = IndexEntity.from_definition(definition)

    assert index == definition
    assert index.short_form() == definition
    assert index.long_form() == {
        "type": "singleSelect",
        "field": "index",
        "label": "Index",
        "defaultValue": "default",
        "options": {
            "endpointUrl": "data/indexes?search=isInternal=0+disabled=0",
            "denyList": "^_.*$",
            "createSearchChoice": True,
        },
        "validators": [
            {
                "type": "regex",
                "errorMsg": "Index names must begin with a letter or a number and must contain only letters, "
                "numbers, underscores or hyphens.",
                "pattern": "^[a-zA-Z0-9][a-zA-Z0-9\\\\_\\\\-]*$",
            },
            {
                "type": "string",
                "errorMsg": "Length of index name should be between 1 and 80.",
                "minLength": 1,
                "maxLength": 80,
            },
        ],
    }


def test_interval_max_definition():
    definition = {
        "type": "index",
        "field": "index",
        "label": "Index",
        "defaultValue": "my_default",
        "help": "help text",
        "required": False,
    }
    index = IndexEntity.from_definition(definition)

    assert index == definition
    assert index.short_form() == definition
    assert index.long_form() == {
        "type": "singleSelect",
        "field": "index",
        "label": "Index",
        "help": "help text",
        "required": False,
        "defaultValue": "my_default",
        "options": {
            "endpointUrl": "data/indexes?search=isInternal=0+disabled=0",
            "denyList": "^_.*$",
            "createSearchChoice": True,
        },
        "validators": [
            {
                "type": "regex",
                "errorMsg": "Index names must begin with a letter or a number and must contain only letters, numbers, "
                "underscores or hyphens.",
                "pattern": "^[a-zA-Z0-9][a-zA-Z0-9\\\\_\\\\-]*$",
            },
            {
                "type": "string",
                "errorMsg": "Length of index name should be between 1 and 80.",
                "minLength": 1,
                "maxLength": 80,
            },
        ],
    }
