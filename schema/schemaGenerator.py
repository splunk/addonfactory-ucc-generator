import json
from jsl import AnyOfField, ArrayField, BooleanField, DictField, Document
from jsl import DocumentField, NumberField, OneOfField, StringField, UriField

class DocumentWithoutAddProp(Document):
    class Options(object):
        additional_properties = False

class Meta(DocumentWithoutAddProp):
    # TODO: add pattern
    displayName = StringField(required=True)
    name = StringField(required=True, pattern="^\w+$")
    restRoot = StringField(required=True, pattern="^\w+$")
    uccVersion = StringField(required=True, pattern="^(?:\d{1,3}\.){2}\d{1,3}$")
    version = StringField(required=True, pattern="^(?:\d{1,3}\.){2}\d{1,3}$")

class StringValidator(DocumentWithoutAddProp):
    type = StringField(required=True, enum=["string"])
    minLength = NumberField(required=True, minimum=0)
    maxLength = NumberField(required=True, minimum=0)

class NumberValidator(DocumentWithoutAddProp):
    type = StringField(required=True, enum=["number"])
    range = ArrayField(NumberField(), required=True)

class RegexpValidator(DocumentWithoutAddProp):
    type = StringField(required=True, enum=["regex"])
    pattern = StringField(required=True)

class Entity(DocumentWithoutAddProp):
    field = StringField(required=True, pattern="^\w+$")
    # TODO: add pattern
    label = StringField(required=True)
    type = StringField(required=True, pattern="^\w+$")
    # TODO: add pattern
    help = StringField()
    defaultValue = OneOfField([
        NumberField(),
        StringField()
    ])
    options = DictField()
    required = BooleanField()
    encrypted = BooleanField()
    validators = ArrayField(AnyOfField([
        DocumentField(StringValidator, as_ref=True),
        DocumentField(NumberValidator, as_ref=True),
        DocumentField(RegexpValidator, as_ref=True)
    ]))

class Table(DocumentWithoutAddProp):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone", "enable"]), required=True)
    moreInfo = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            # TODO: add pattern
            "label": StringField(required=True)
        }
    ))
    header = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            # TODO: add pattern
            "label": StringField(required=True)
        }
    ), required=True)

class TabContent(DocumentWithoutAddProp):
    entity = ArrayField(DocumentField(Entity, as_ref=True), required=True)
    name = StringField(required=True, pattern="^\w+$")
    # TODO: add pattern
    title = StringField(required=True)
    options = DictField()
    table = DocumentField(Table, as_ref=True)    

class ConfigurationPage(DocumentWithoutAddProp):
    # TODO: add pattern
    description = StringField(required=True)
    # TODO: add pattern
    title = StringField(required=True)
    tabs = ArrayField(TabContent, required=True)

class InputsPage(DocumentWithoutAddProp):
    # TODO: add pattern
    description = StringField()
    table = DocumentField(Table, as_ref=True, required=True)
    services = ArrayField(DictField(
        properties={
            "name": StringField(required=True, pattern="^\w+$"),
            # TODO: add pattern
            "title": StringField(required=True),
            "entity": ArrayField(DocumentField(Entity, as_ref=True), required=True)
        }
    ), required=True)
    # TODO: add pattern
    title = StringField(required=True)

class Pages(DocumentWithoutAddProp):
    configuration = DocumentField(ConfigurationPage, as_ref=True, required=False)
    inputs = DocumentField(InputsPage, as_ref=True, required=False)

class UCCConfig(DocumentWithoutAddProp):
    meta = DocumentField(Meta, as_ref=True, required=True)
    pages = DocumentField(Pages, as_ref=True, required=True)

if __name__ == "__main__":
    formated = json.dumps(UCCConfig.get_schema(ordered=True), indent=4)
    formated = formated.replace("__main__.", "")

    with open('./schema/schema.json', 'w+') as schema_handler:
        schema_handler.write(formated)
