__author__ = 'Zimo'


CONNECTOR_OR = ' OR '
CONNECTOR_AND = ' AND '
ENABLED = 'enabled'
DISABLED = 'disabled'
PRINT_TAB = '    '
PRINT_DASH = '|---'
PRINT_SPACE = ' '
JSON_EXTENSION = '.json'
BASE_EVENT = 'BaseEvent'
BASE_SEARCH = 'BaseSearch'
EVENTTYPE = 'eventtype'
SOURCETYPE = 'sourcetype'
FIELDS = 'fields'
SEARCHES = 'searches'
CONNECTOR_EQUAL = ' === '
FIELDS_LENGTH = 60
BIGGER_STRING = 'zzzzzzzzzz'
ACTUAL_FIELDS = 'Actual Fields'
EXPECTED_FIELDS = 'Expected Fields'

PROPS_CONF_SPEC_STANZA = { 'SOURCETYPE': 'sourcetype',
                           'HOST': 'host',
                           'SOURCE': 'source',
                           'RULE': 'rule',
                           'DELAYEDRULE': 'delayedrule',
                           'CONNECTOR': '::'}

PROPS_CONF_SPEC_OPERATION = { 'EVAL': 'EVAL',
                              'FIELDALIAS': 'FIELDALIAS',
                              'LOOKUP': 'LOOKUP',
                              'EXTRACT': 'EXTRACT',
                              'REPORT': 'REPORT',
                              'RENAME': 'rename'}

EVENTTYPES_CONF_SPEC = { 'SEARCH': 'search',
                         'SOURCETYPE': 'sourcetype'}

TAGS_CONF_SEPC = { 'TAG': 'tag',
                   'EVENTTYPE': 'eventtype'}

TYPE_ARRAY = 'ARRAY'
TYPE_TAG = 'TAG'