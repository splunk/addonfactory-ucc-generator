import _ from 'lodash';

// Regex of ipv4, email and date come from
// https://github.com/aldeed/meteor-simple-schema/blob/4c1e2570b1055ad60e1e6540582b882f765fde13/simple-schema.js#L525
export const REGEX_IPV4 = /^(?:(?:[0-1]?\d{1,2}|2[0-4]\d|25[0-5])(?:\.|$)){4}$/;

export const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const REGEX_URL = /^(?:(?:https?|ftp|opc.tcp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/;

// Support dd/mm/yyyy,dd-mm-yyyy or dd.mm.yyyy
// http://stackoverflow.com/questions/15491894/regex-to-validate-date-format-dd-mm-yyyy#answer-15504877
export const REGEX_DATE = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

// _.t is undefined in unit test environment, and this dictionary is no need for testing.
// So, an empty object is returned when _.t undefined.
export const PREDEFINED_VALIDATORS_DICT = !_.t ? {} : {
    'url': {regex: REGEX_URL, inputValueType: _('URL').t()},
    'email': {regex: REGEX_EMAIL, inputValueType: _('email address').t()},
    'ipv4': {regex: REGEX_IPV4, inputValueType: _('IPV4 address').t()},
    'date': {regex: REGEX_DATE, inputValueType: _('date(dd/mm/yyyy, dd-mm-yyyy or dd.mm.yyyy)').t()}
};
