from splunk_add_on_ucc_framework.entity import Entity


def test_entity():
    definition = {
        "type": "text",
        "label": "Object",
        "validators": [
            {
                "type": "string",
                "errorMsg": "Max length of text input is 8192",
                "minLength": 0,
                "maxLength": 8192,
            }
        ],
        "field": "object",
        "help": "The name of the object to query for.",
        "required": True,
    }
    entity = Entity.from_definition(definition)

    assert entity == Entity(definition)
    assert entity == definition
    assert entity.short_form() == definition
    assert entity.long_form() == definition
