import json
from jsl import AnyOfField, ArrayField, BooleanField, DictField, Document
from jsl import DocumentField, NumberField, OneOfField, StringField, UriField

class DocumentWithoutAddProp(Document):
    class Options(object):
        additional_properties = False

class Meta(DocumentWithoutAddProp):
    displayName = StringField(required=True)
    name = StringField(required=True)
    restRoot = StringField(required=True)
    uccVersion = StringField(required=True)
    version = StringField(required=True)

class StringValidator(DocumentWithoutAddProp):
    type = StringField(required=True, enum=["string"])
    minLength = NumberField(required=True)
    maxLength = NumberField(required=True)

class NumberValidator(DocumentWithoutAddProp):
    type = StringField(required=True, enum=["number"])
    range = ArrayField(NumberField(), required=True)

class RegexpValidator(DocumentWithoutAddProp):
    type = StringField(required=True, enum=["regex"])
    pattern = StringField(required=True)

class Entity(DocumentWithoutAddProp):
    field = StringField(required=True)
    label = StringField(required=True)
    type = StringField(required=True)
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

class TabContentBase(Document):
    entity = ArrayField(DocumentField(Entity, as_ref=True), required=True)
    title = StringField(required=True)
    options = DictField()

class Table(DocumentWithoutAddProp):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone", "enable"]), required=True)
    moreInfo = ArrayField(DictField(
        properties={
            "field": StringField(required=True),
            "label": StringField(required=True)
        }
    ))
    header = ArrayField(DictField(
        properties={
            "field": StringField(required=True),
            "label": StringField(required=True)
        }
    ), required=True)

class AccountTabContent(TabContentBase):
    name = StringField(required=True, enum=["account"])
    table = DocumentField(Table, as_ref=True, required=True)

class CustomizedTabContent(TabContentBase):
    name = StringField(required=True)
    table = DocumentField(Table, as_ref=True)

class LoggingTabContent(TabContentBase):
    name = StringField(required=True, enum=["logging"])

class ProxyTabContent(TabContentBase):
    name = StringField(required=True, enum=["proxy"])

class ConfigurationPage(DocumentWithoutAddProp):
    description = StringField(required=True)
    title = StringField(required=True)
    tabs = ArrayField(AnyOfField([
        DocumentField(AccountTabContent, as_ref=True),
        DocumentField(CustomizedTabContent, as_ref=True),
        DocumentField(LoggingTabContent, as_ref=True),
        DocumentField(ProxyTabContent, as_ref=True)
    ]), required=True)

class InputsPage(DocumentWithoutAddProp):
    description = StringField()
    table = DocumentField(Table, as_ref=True, required=True)
    services = ArrayField(DictField(
        properties={
            "name": StringField(required=True),
            "title": StringField(required=True),
            "entity": ArrayField(DocumentField(Entity, as_ref=True), required=True)
        }
    ), required=True)
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
