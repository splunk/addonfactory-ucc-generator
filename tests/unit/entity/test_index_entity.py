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
        "validators": [{"type": "index_name"}],
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
        "validators": [{"type": "index_name"}],
    }
