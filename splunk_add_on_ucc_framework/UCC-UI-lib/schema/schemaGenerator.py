from builtins import object
import json
import os
from jsl import AnyOfField, ArrayField, BooleanField, DictField, Document
from jsl import DocumentField, NumberField, OneOfField, StringField, UriField

###
# TODO Need to fix this: Make sure schemagenerator generates proper element for hook
# For time being do the following change in generated schema.json
# replace: "hook": {"$ref": "#/definitions/Hooks"} with "hook": {"type": "object"}
###

# Base Document Class with restricting properties population
class DocumentWithoutAddProp(Document):
    class Options(object):
        additional_properties = False


# Document Element with Label and Value element. Possible values are text, numeric and boolean types
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
    encrypted = BooleanField()



# Base Validator Wrapper component which is extension of DocumentWithoutAddProp Wrapper Component
class ValidatorBase(DocumentWithoutAddProp):
    errorMsg = StringField(max_length=400)


# MetaData component for detailing brief imformation of document/component
class Meta(DocumentWithoutAddProp):
    displayName = StringField(required=True, max_length=200)
    name = StringField(required=True, pattern="^[^<>\:\"\/\\\|\?\*]+$")
    restRoot = StringField(required=True, pattern="^\w+$")
    apiVersion = StringField(required=True, pattern="^(?:\d{1,3}\.){2}\d{1,3}$")
    version = StringField(required=True)
    schemaVersion = StringField( pattern="^(?:\d{1,3}\.){2}\d{1,3}$")


# Text validator for the String Field Value input
class StringValidator(ValidatorBase):
    type = StringField(required=True, enum=["string"])
    minLength = NumberField(required=True, minimum=0)
    maxLength = NumberField(required=True, minimum=0)


# Numeric validator for the Number Field Value input
class NumberValidator(ValidatorBase):
    type = StringField(required=True, enum=["number"])
    range = ArrayField(NumberField(), required=True)


# Regex validator for the text Field Value input
class RegexValidator(ValidatorBase):
    type = StringField(required=True, enum=["regex"])
    pattern = StringField(required=True)


# Email validator for the text Field Value input
class EmailValidator(ValidatorBase):
    type = StringField(required=True, enum=["email"])


# Ipv4 represenation validator
class Ipv4Validator(ValidatorBase):
    type = StringField(required=True, enum=["ipv4"])


# Date Validator
class DateValidator(ValidatorBase):
    type = StringField(required=True, enum=["date"])


# URL Validator
class UrlValidator(ValidatorBase):
    type = StringField(required=True, enum=["url"])

# Entity for Alert Actions
class AlertEntity(DocumentWithoutAddProp):
    field = StringField(required=True, pattern="^\w+$")
    label = StringField(required=True, max_length=30)
    type = StringField(required=True,
                       enum=["text", "singleSelect", "checkbox", "radio", "singleSelectSplunkSearch"])
    help = StringField(max_length=200)
    defaultValue = OneOfField([
        NumberField(),
        StringField(max_length=250),
        BooleanField()
    ])
    required = BooleanField()
    search = StringField(max_length=200)
    valueField = StringField(max_length=200)
    labelField = StringField(max_length=200)
    options = DictField(
        properties={
            "items": ArrayField(DocumentField(ValueLabelPair, as_ref=True))
        }
    )

##
#  Entity Form Field Component Wrapper having field name, label, field types, help/tooltips support, default value
#  Validators and UI Controls such as visibility etc
##
class Entity(DocumentWithoutAddProp):
    field = StringField(required=True, pattern="^\w+$")
    label = StringField(required=True, max_length=30)
    type = StringField(required=True,
                       enum=["custom", "text", "singleSelect", "checkbox", "multipleSelect", "radio", "placeholder", "oauth", "helpLink"])
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
            "denyList": StringField(max_length=350),
            "allowList": StringField(max_length=350),
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
            "auth_type": ArrayField(StringField(max_length=100)),
            "auth_label": StringField(max_length=250),
            "oauth_popup_width": NumberField(),
            "oauth_popup_height": NumberField(),
            "oauth_timeout": NumberField(),
            "auth_code_endpoint": StringField(max_length=350),
            "access_token_endpoint": StringField(max_length=350),
            "text": StringField(max_length=50),
            "link": StringField()
        }
    )
    required = BooleanField()
    encrypted = BooleanField()
    # List of inbuilt field validator
    validators = ArrayField(AnyOfField([
        DocumentField(StringValidator, as_ref=True),
        DocumentField(NumberValidator, as_ref=True),
        DocumentField(RegexValidator, as_ref=True),
        DocumentField(EmailValidator, as_ref=True),
        DocumentField(Ipv4Validator, as_ref=True),
        DocumentField(UrlValidator, as_ref=True),
        DocumentField(DateValidator, as_ref=True)
    ]))


##
# Input Entity is super class of Entity to restrict the predefined field name holding entity field
##
class InputsEntity(Entity):
    # Prevnet Splunk reserved inputs field keys being used in the user customized inputs
    # https://jira.splunk.com/browse/ADDON-13014#comment-1493170

    field = StringField(
        required=True,
        pattern="(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\w+$)"
    )


##
# ConfigurationEntity is super class of Entity to restrict the predefined field name holding entity field such as
# output_mode
# output_field
# owner
# app
# sharing
# ##
class ConfigurationEntity(Entity):
    field = StringField(
        required=True,
        pattern="(?!^(?:output_mode|output_field|owner|app|sharing)$)(?:^\w+$)"
    )


##
# Table component schema with headers, additional info and customization row extension
##
class Table(DocumentWithoutAddProp):
    moreInfo = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            "label": StringField(required=True, max_length=30),
            "mapping": DictField(required=False)
        }
    ))
    # Header field names needs to be display on UI
    header = ArrayField(DictField(
        properties={
            "field": StringField(required=True, pattern="^\w+$"),
            "label": StringField(required=True, max_length=30),
            "mapping": DictField(required=False),
            "customCell": DictField(required=False)
        }
    ), required=True)
    # custom Row implementation if required for special cases
    customRow = DictField(required=False)


##
# Input table having all functions of table and edit|delete|clone|enable/disable actions for each row
##
class InputsTable(Table):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone", "enable"]), required=True)


##
# Configuration table having all functions of table and edit|delete|clone|enable/disable actions for each row
##
class ConfigurationTable(Table):
    actions = ArrayField(StringField(enum=["edit", "delete", "clone"]), required=True)


##
# Hook attribute scheme to define custom Hook for various events such as on load, on save and on save
##
class Hooks(DocumentWithoutAddProp):
    saveValidator = StringField(max_length=3000)
    onLoad = StringField(max_length=3000)
    onChange = StringField(max_length=3000)


##
# Tab Content holding the wrapper of Table and Rest Handler Mapping
##
class TabContent(DocumentWithoutAddProp):
    entity = ArrayField(DocumentField(ConfigurationEntity, as_ref=True), required=True)
    name = StringField(required=True, pattern="^[\/\w]+$", max_length=250)
    title = StringField(required=True, max_length=50)
    options = DocumentField(Hooks, as_ref=True)
    table = DocumentField(ConfigurationTable, as_ref=True)
    conf = StringField(required=False, max_length=100)
    restHandlerName = StringField(required=False, max_length=100)
    # Provisioning tab level hook on configuration page
    hook = DocumentField(Hooks, as_ref=True)


##
# ConfigurationPage Component having tabbing pages for configuration of various module
# Each tab is individual TabContent
##
class ConfigurationPage(DocumentWithoutAddProp):
    title = StringField(required=True, max_length=60)
    description = StringField(max_length=200)
    tabs = ArrayField(DocumentField(TabContent, as_ref=True), required=True, min_items=1)


##
# InputsPage Component having table and entity dialogue driven by service handler to add new entry
##
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


##
# Main Page to holding configuration and input page
##
class Pages(DocumentWithoutAddProp):
    configuration = DocumentField(ConfigurationPage, as_ref=True, required=False)
    inputs = DocumentField(InputsPage, as_ref=True, required=False)


##
# Component holding Technology dict in active_response
##
class Technology(DocumentWithoutAddProp):
    version = ArrayField(StringField(required=True, pattern="^\d+(?:\.\d+)*$"),required=True, min_items=1)
    product = StringField(required=True, max_length=100)
    vendor = StringField(required=True, max_length=100)


##
# Main Component holding the alert actions 
##
class Alerts(DocumentWithoutAddProp):
    name = StringField(required=True, pattern="^[a-zA-Z0-9_]+$", max_length=100)
    label = StringField(required=True, max_length=100)
    description = StringField(required=True)
    activeResponse = DictField(properties={
                            "task": ArrayField(StringField(required=True), required=True, min_items=1),
                            "supportsAdhoc": BooleanField(required=True),
                            "subject": ArrayField(StringField(required=True), required=True, min_items=1),
                            "category": ArrayField(StringField(required=True), required=True, min_items=1),
                            "technology": ArrayField(DocumentField(Technology,as_ref=True),required=True, min_items=1),
                            "drilldownUri":StringField(required=False),
                            "sourcetype":StringField(required=False, pattern="^[a-zA-Z0-9:-_]+$", max_length=50)
                        }, required=False)
    entity = ArrayField(DocumentField(AlertEntity, as_ref=True))

##
# Root Component holding all pages and meta information
##
class UCCConfig(DocumentWithoutAddProp):
    meta = DocumentField(Meta, as_ref=True, required=True)
    pages = DocumentField(Pages, as_ref=True, required=True)
    alerts = ArrayField(DocumentField(Alerts, as_ref=True), required=False, min_items=1)

##
# SchemaGenerator responsible to generate schema json file holding information of Flow of UI based on UCCConfig Object
##
if __name__ == "__main__":
    formated = json.dumps(UCCConfig.get_schema(ordered=True), indent=4)
    formated = formated.replace("__main__.", "")

    cur_dir = os.path.dirname(__file__)
    with open(os.path.join(cur_dir, 'schema.json'), 'w+') as schema_handler:
        schema_handler.write(formated)