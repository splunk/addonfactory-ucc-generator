import json
import os
from jsl import AnyOfField, ArrayField, BooleanField, DictField, Document
from jsl import DocumentField, NumberField, OneOfField, StringField, UriField


class DocumentWithoutAddProp(Document):
    class Options(object):
        additional_properties = False


class ValueLabelPair(DocumentWithoutAddProp):
    value = OneOfField([
        NumberField(),
        StringField(max_length=250),
        BooleanField()
    ])
    label = StringField(required=True, max_length=100)


class OAuthFields(DocumentWithoutAddProp):
    oauth_field = StringField(max_length=100)
    label = StringField(max_length=100)
    field = StringField(max_length=100)
    help = StringField(max_length=200)


class ValidatorBase(DocumentWithoutAddProp):
    errorMsg = StringField(max_length=400)


class Meta(DocumentWithoutAddProp):
    displayName = StringField(required=True, max_length=200)
    name = StringField(required=True, pattern="^[^<>\:\"\/\\\|\?\*]+$")
    restRoot = StringField(required=True, pattern="^\w+$")
    apiVersion = StringField(required=True, pattern="^(?:\d{1,3}\.){2}\d{1,3}$")
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
    type = StringField(required=True,
                       enum=["custom", "text", "singleSelect", "checkbox", "multipleSelect", "radio", "placeholder", "oauth"])
    help = StringField(max_length=200)
    tooltip = StringField(max_length=250)
    defaultValue = OneOfField([
        NumberField(),
        StringField(max_length=250),
        BooleanField()
    ])
    options = DictField(
        properties={
            "disableSearch": BooleanField(),
            "autoCompleteFields": OneOfField([
                ArrayField(DictField(
                    properties={
                        "label": StringField(required=True, max_length=150),
                        "children": ArrayField(DocumentField(ValueLabelPair, as_ref=True), required=True)
                    }
                )),
                ArrayField(DocumentField(ValueLabelPair, as_ref=True))
            ]),
            "endpointUrl": StringField(max_length=350),
            "blackList": StringField(max_length=350),
            "whiteList": StringField(max_length=350),
            "delimiter": StringField(max_length=1),
            "items": ArrayField(DocumentField(ValueLabelPair, as_ref=True)),
            "referenceName": StringField(max_length=250),
            "enable": BooleanField(),
            "placeholder": StringField(max_length=250),
            "display": BooleanField(),
            "labelField": StringField(max_length=250),
            "src": StringField(max_length=250),
            "defaultValue": StringField(max_length=250),
            "disableonEdit": BooleanField(),
            "basic": ArrayField(DocumentField(OAuthFields, as_ref=True)),
            "oauth": ArrayField(DocumentField(OAuthFields, as_ref=True)),
            "auth_type": ArrayField(StringField(max_length=100))
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


class InputsEntity(Entity):
    # Prevnet Splunk reserved inputs field keys being used in the user customized inputs
    # https://jira.splunk.com/browse/ADDON-13014#comment-1493170

    field = StringField(
        required=True,
        pattern="(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\w+$)"
    )


class ConfigurationEntity(Entity):
    field = StringField(
        required=True,
        pattern="(?!^(?:output_mode|output_field|owner|app|sharing)$)(?:^\w+$)"
    )


class Table(DocumentWithoutAddProp):
    moreInfo = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            "label": StringField(required=True, max_length=30),
            "mapping": DictField(required=False)
        }
    ))
    header = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            "label": StringField(required=True, max_length=30),
            "mapping": DictField(required=False),
            "customCell": DictField(required=False)
        }
    ), required=True)
    customRow = DictField(required=False)


class InputsTable(Table):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone", "enable"]), required=True)


class ConfigurationTable(Table):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone"]), required=True)


class Hooks(DocumentWithoutAddProp):
    saveValidator = StringField(max_length=3000)
    onLoad = StringField(max_length=3000)
    onChange = StringField(max_length=3000)


class TabContent(DocumentWithoutAddProp):
    entity = ArrayField(DocumentField(ConfigurationEntity, as_ref=True), required=True)
    name = StringField(required=True, pattern="^[\/\w]+$", max_length=250)
    title = StringField(required=True, max_length=50)
    options = DocumentField(Hooks, as_ref=True)
    table = DocumentField(ConfigurationTable, as_ref=True)
    conf = StringField(required=False, max_length=100)
    restHandlerName = StringField(required=False, max_length=100)


class ConfigurationPage(DocumentWithoutAddProp):
    title = StringField(required=True, max_length=60)
    description = StringField(max_length=200)
    tabs = ArrayField(DocumentField(TabContent, as_ref=True), required=True, min_items=1)


class InputsPage(DocumentWithoutAddProp):
    title = StringField(required=True, max_length=60)
    description = StringField(max_length=200)
    table = DocumentField(InputsTable, as_ref=True, required=True)
    services = ArrayField(DictField(
        properties={
            "name": StringField(required=True, pattern="^[0-9a-zA-Z][0-9a-zA-Z_-]*$", max_length=50),
            "title": StringField(required=True, max_length=100),
            "entity": ArrayField(DocumentField(InputsEntity, as_ref=True), required=True),
            "options": DocumentField(Hooks, as_ref=True),
            "groups": ArrayField(DictField(
                properties={
                    "options": DictField(
                        properties={
                            "isExpandable": BooleanField(),
                            "expand": BooleanField()
                        }
                    ),
                    "label": StringField(required=True, max_length=100),
                    "field": ArrayField(StringField(required=True, pattern="^\w+$"))
                }
            ), required=False),
            "style": StringField(required=False, enum=["page", "dialog"]),
            "hook": DictField(required=False),
            "conf": StringField(required=False, max_length=100),
            "restHandlerName": StringField(required=False, max_length=100)
        }
    ), required=True)
    menu = DictField(required=False)


class Pages(DocumentWithoutAddProp):
    configuration = DocumentField(ConfigurationPage, as_ref=True, required=False)
    inputs = DocumentField(InputsPage, as_ref=True, required=False)


class UCCConfig(DocumentWithoutAddProp):
    meta = DocumentField(Meta, as_ref=True, required=True)
    pages = DocumentField(Pages, as_ref=True, required=True)

if __name__ == "__main__":
    formated = json.dumps(UCCConfig.get_schema(ordered=True), indent=4)
    formated = formated.replace("__main__.", "")

    cur_dir = os.path.dirname(__file__)
    with open(os.path.join(cur_dir, 'schema.json'), 'w+') as schema_handler:
        schema_handler.write(formated)
