import _ from 'lodash';
import {getFormattedMessage} from 'app/util/messageUtil';

// Regex of ipv4, email and date come from
// https://github.com/aldeed/meteor-simple-schema/blob/4c1e2570b1055ad60e1e6540582b882f765fde13/simple-schema.js#L525
export const REGEX_IPV4 = /^(?:(?:[0-1]?\d{1,2}|2[0-4]\d|25[0-5])(?:\.|$)){4}$/;

export const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const REGEX_URL = /^(?:(?:https?|ftp|opc\.tcp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/;

// From https://github.com/moment/moment/blob/2.17.1/moment.js#L1980 moment.js is using regex below for checking ISO8601 date string
export const REGEX_DATE = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

// _.t is undefined in unit test environment, and this dictionary is no need for testing.
// So, an empty object is returned when _.t undefined.
export const PREDEFINED_VALIDATORS_DICT = !_.t ? {} : {
    'url': {regex: REGEX_URL, inputValueType: _(getFormattedMessage(111)).t()},
    'email': {regex: REGEX_EMAIL, inputValueType: _(getFormattedMessage(112)).t()},
    'ipv4': {regex: REGEX_IPV4, inputValueType: _(getFormattedMessage(113)).t()},
    'date': {regex: REGEX_DATE, inputValueType: _(getFormattedMessage(114)).t()}
};
