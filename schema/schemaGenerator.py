import json
from jsl import AnyOfField, ArrayField, BooleanField, DictField, Document
from jsl import DocumentField, NumberField, OneOfField, StringField, UriField

class DocumentWithoutAddProp(Document):
    class Options(object):
        additional_properties = False

class ValueLabelPair(DocumentWithoutAddProp):
    value = StringField(required=True, max_length=300, pattern="^\w+$")
    label = StringField(required=True, max_length=150)

class ValidatorBase(DocumentWithoutAddProp):
    errorMsg = StringField(enum=["string"], max_length=400)

class Meta(DocumentWithoutAddProp):
    displayName = StringField(required=True, max_length=200)
    name = StringField(required=True, pattern="^[^<>\:\"\/\\\|\?\*]+$")
    restRoot = StringField(required=True, pattern="^[a-z0-9_]+$")
    uccVersion = StringField(required=True, pattern="^(?:\d{1,3}\.){2}\d{1,3}$")
    version = StringField(required=True)

class StringValidator(ValidatorBase):
    type = StringField(required=True, enum=["string"])
    minLength = NumberField(required=True, minimum=0)
    maxLength = NumberField(required=True, minimum=0)

class NumberValidator(ValidatorBase):
    type = StringField(required=True, enum=["number"])
    range = ArrayField(NumberField(), required=True)

class RegexValidator(ValidatorBase):
    type = StringField(required=True, enum=["regex"])
    pattern = StringField(required=True)

class EmailValidator(ValidatorBase):
    type = StringField(required=True, enum=["email"])

class Ipv4Validator(ValidatorBase):
    type = StringField(required=True, enum=["ipv4"])

class DateValidator(ValidatorBase):
    type = StringField(required=True, enum=["date"])

class UrlValidator(ValidatorBase):
    type = StringField(required=True, enum=["url"])


class Entity(DocumentWithoutAddProp):
    field = StringField(required=True, pattern="^\w+$")
    label = StringField(required=True, max_length=30)
    type = StringField(required=True, enum=["text", "singleSelect", "checkbox", "multipleSelect", "password", "radio"])
    help = StringField(max_length=200)
    defaultValue = OneOfField([
        NumberField(),
        StringField(max_length=250),
        BooleanField()
    ])
    options = DictField(
        properties={
            "disableSearch": BooleanField(),
            "autoCompleteFields": ArrayField(DictField(
                properties={
                    "label": StringField(required=True, max_length=150),
                    "value": StringField(max_length=300, pattern="^\w+$"),
                    "children": ArrayField(DocumentField(ValueLabelPair, as_ref=True))
                }
            )),
            "customizedUrl": StringField(max_length=350),
            "delimiter": StringField(max_length=30),
            "items": ArrayField(DocumentField(ValueLabelPair, as_ref=True)),
            "referenceName": StringField(max_length=250),
            "enable": BooleanField(),
            "placeholder": StringField(max_length=250)
        }
    )
    required = BooleanField()
    encrypted = BooleanField()
    validators = ArrayField(AnyOfField([
        DocumentField(StringValidator, as_ref=True),
        DocumentField(NumberValidator, as_ref=True),
        DocumentField(RegexValidator, as_ref=True),
        DocumentField(EmailValidator, as_ref=True),
        DocumentField(Ipv4Validator, as_ref=True),
        DocumentField(UrlValidator, as_ref=True),
        DocumentField(DateValidator, as_ref=True)
    ]))

class Table(DocumentWithoutAddProp):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone", "enable"]), required=True)
    moreInfo = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            "label": StringField(required=True, max_length=30)
        }
    ))
    header = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            "label": StringField(required=True, max_length=30)
        }
    ), required=True)

class Hooks(DocumentWithoutAddProp):
    saveValidator = StringField()
    onLoad = StringField()

class TabContent(DocumentWithoutAddProp):
    entity = ArrayField(DocumentField(Entity, as_ref=True), required=True)
    name = StringField(required=True, pattern="^\w+$", max_length=250)
    title = StringField(required=True, max_length=50)
    options = DocumentField(Hooks, as_ref=True)
    table = DocumentField(Table, as_ref=True)

class ConfigurationPage(DocumentWithoutAddProp):
    title = StringField(required=True, max_length=60)
    description = StringField(max_length=200)
    tabs = ArrayField(DocumentField(TabContent, as_ref=True), required=True, min_items=1)

class InputsPage(DocumentWithoutAddProp):
    title = StringField(required=True, max_length=60)
    description = StringField(max_length=200)
    table = DocumentField(Table, as_ref=True, required=True)
    services = ArrayField(DictField(
        properties={
            "name": StringField(required=True, pattern="^\w+$"),
            "title": StringField(required=True, max_length=50),
            "entity": ArrayField(DocumentField(Entity, as_ref=True), required=True),
            "options": DocumentField(Hooks, as_ref=True)
        }
    ), required=True)

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
