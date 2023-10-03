import * as _ from 'lodash';
import { PREDEFINED_VALIDATORS_DICT } from '../constants/preDefinedRegex';
import { getFormattedMessage } from './messageUtil';

/**
 * @typedef Error
 * @type {object}
 * @property {string} errorMsg
 * @property {string} errorField
 */

/**
 * @typedef ValidatorBase
 * @type {object}
 * @property {string} type
 * @property {string} [errorField]
 * @property {string} [errorMsg]
 */

const parseFunctionRawStr = (rawStr) => {
    let err;
    let result;

    try {
        // eslint-disable-next-line no-eval
        result = eval(`(${rawStr})`);
    } catch (e) {
        err = getFormattedMessage(11, rawStr);
    }

    return { err, result };
};

// Validate provided saveValidator function
export function SaveValidator(validatorFunc, formData) {
    const { error, result } = parseFunctionRawStr(validatorFunc);
    if (error) {
        return { errorMsg: error };
    }
    const ret = result(formData);
    if (typeof ret === 'string') {
        return { errorMsg: ret };
    }
}

const parseNumberValidator = (range) => {
    const isRangeLegal =
        range.length === 2 && _.isNumber(range[0]) && _.isNumber(range[1]) && range[0] <= range[1];

    const error = isRangeLegal ? undefined : getFormattedMessage(13, JSON.stringify(range));

    return { error };
};

const parseRegexRawStr = (rawStr) => {
    let error;
    let result;

    try {
        result = new RegExp(rawStr);
    } catch (e) {
        error = getFormattedMessage(12, rawStr);
    }

    return { error, result };
};

class Validator {
    constructor(entities) {
        this.entities = entities;
        this.isName = entities.find((e) => e.field === 'name');
    }

    // eslint-disable-next-line class-methods-use-this
    static checkIsFieldHasInput = (attrValue) =>
        attrValue !== undefined &&
        attrValue !== null &&
        (typeof attrValue === 'string' ? attrValue.trim() !== '' : true);

    /**
     * Validate the required field has value
     * @param {string} field
     * @param {string|number} label
     * @param {string|number} data
     * @returns {Error|false}
     */
    static RequiredValidator(field, label, data) {
        if (!Validator.checkIsFieldHasInput(data)) {
            return { errorField: field, errorMsg: getFormattedMessage(6, [label]) };
        }
        return false;
    }

    /**
     * @typedef {ValidatorBase} StringValidatorOptions
     * @property {number} minLength
     * @property {number} maxLength
     */

    /**
     * Validate the string length of field
     * @param {string} field
     * @param {string|number} label
     * @param {StringValidatorOptions} validator
     * @param {string} data
     * @returns {Error|false}
     */
    static StringValidator(field, label, validator, data) {
        if (Validator.checkIsFieldHasInput(data) && data.length > validator.maxLength) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(18, [label, validator.maxLength]),
            };
        }
        if (Validator.checkIsFieldHasInput(data) && data.length < validator.minLength) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(17, [label, validator.minLength]),
            };
        }
        return false;
    }

    /**
     * @typedef {ValidatorBase} RegexValidatorOptions
     * @property {string} pattern
     */

    /**
     * Validate the field should match the provided Regex
     * @param {string} field
     * @param {string|number} label
     * @param {RegexValidatorOptions} validator
     * @param {string} data
     * @returns {Error|false}
     */
    static RegexValidator(field, label, validator, data) {
        const { error, result: regex } = parseRegexRawStr(validator.pattern);
        if (error) {
            return { errorField: field, errorMsg: error };
        }
        if (Validator.checkIsFieldHasInput(data) && !regex.test(data)) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(15, [label, validator.pattern]),
            };
        }
        return false;
    }

    // Validate the custom component
    static CustomValidator(validatorFunc, field, data) {
        const ret = validatorFunc(field, data);
        if (typeof ret === 'string') {
            return { errorField: field, errorMsg: ret };
        }
        return false;
    }

    // Validate the field should match predefined Regexes
    static PreDefinedRegexValidator(field, label, validator, data, pattern, inputValueType) {
        const { error, result: regex } = parseRegexRawStr(pattern);
        if (error) {
            return { errorField: field, errorMsg: error };
        }
        if (Validator.checkIsFieldHasInput(data) && !regex.test(data)) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(19, [label, inputValueType]),
            };
        }
        return false;
    }

    /**
     * @typedef {ValidatorBase} NumberValidatorOptions
     * @property {[number, number]} range
     */

    /**
     * Validate the field should match the provided Regex
     * @param {string} field
     * @param {string|number} label
     * @param {NumberValidatorOptions} validator
     * @param {string} data
     * @returns {Error|false}
     */
    // Validate the range of numeric field
    static NumberValidator(field, label, validator, data) {
        const { error } = parseNumberValidator(validator.range);
        if (error) {
            return { errorField: field, errorMsg: error };
        }

        const val = Number(data);
        if (Number.isNaN(val)) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(16, [label]),
            };
        }
        if (
            (Validator.checkIsFieldHasInput(data) && val > validator.range[1]) ||
            val < validator.range[0]
        ) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(8, [label, validator.range[0], validator.range[1]]),
            };
        }
        return false;
    }

    doValidation(data) {
        if (this.isName) {
            const targetValue = data.name;
            const nameFieldLabel = this.isName.label;

            if (typeof targetValue === 'undefined' || targetValue === '' || targetValue == null) {
                return { errorField: 'name', errorMsg: getFormattedMessage(0, [nameFieldLabel]) };
            }
            if (!(typeof targetValue === 'string' || targetValue instanceof String)) {
                return { errorField: 'name', errorMsg: getFormattedMessage(1, [nameFieldLabel]) };
            }
            if (
                targetValue.startsWith('_') ||
                targetValue === '.' ||
                targetValue === '..' ||
                targetValue.toLowerCase() === 'default'
            ) {
                return { errorField: 'name', errorMsg: getFormattedMessage(3, [nameFieldLabel]) };
            }
            const regexMetaCharacters = ['*', '\\', '[', ']', '(', ')', '?', ':'];
            if (regexMetaCharacters.some((d) => targetValue.indexOf(d) > -1)) {
                return { errorField: 'name', errorMsg: getFormattedMessage(3, [nameFieldLabel]) };
            }

            if (targetValue.length >= 1024) {
                return { errorField: 'name', errorMsg: getFormattedMessage(22, [nameFieldLabel]) };
            }
        }

        let ret;
        let i;
        let j;

        for (i = 0; i < this.entities.length; i += 1) {
            if (this.entities[i].required === true) {
                ret = Validator.RequiredValidator(
                    this.entities[i].field,
                    this.entities[i].label,
                    data[this.entities[i].field]
                );
                if (ret) {
                    return ret;
                }
            }
            if (data[this.entities[i].field] === '' || data[this.entities[i].field] === null) {
                // eslint-disable-next-line no-continue
                continue;
            }

            // Error handling for File Component, by checking field value to ##INVALID_FILE## (Emitting from FileInputComponent.jsx)
            if (
                this.entities[i].type === 'file' &&
                data[this.entities[i].field] === '##INVALID_FILE##'
            ) {
                return {
                    errorField: this.entities[i].field,
                    errorMsg: getFormattedMessage(26),
                };
            }

            if (this.entities[i].validators) {
                for (j = 0; j < this.entities[i].validators.length; j += 1) {
                    switch (this.entities[i].validators[j].type) {
                        case 'string':
                            ret = Validator.StringValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'regex':
                            ret = Validator.RegexValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'number':
                            ret = Validator.NumberValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'url':
                            ret = Validator.PreDefinedRegexValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field],
                                PREDEFINED_VALIDATORS_DICT.url.regex,
                                PREDEFINED_VALIDATORS_DICT.url.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'date':
                            ret = Validator.PreDefinedRegexValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field],
                                PREDEFINED_VALIDATORS_DICT.date.regex,
                                PREDEFINED_VALIDATORS_DICT.date.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'email':
                            ret = Validator.PreDefinedRegexValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field],
                                PREDEFINED_VALIDATORS_DICT.email.regex,
                                PREDEFINED_VALIDATORS_DICT.email.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'ipv4':
                            ret = Validator.PreDefinedRegexValidator(
                                this.entities[i].field,
                                this.entities[i].label,
                                this.entities[i].validators[j],
                                data[this.entities[i].field],
                                PREDEFINED_VALIDATORS_DICT.ipv4.regex,
                                PREDEFINED_VALIDATORS_DICT.ipv4.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'custom':
                            ret = Validator.CustomValidator(
                                this.entities[i].validators[j].validatorFunc,
                                this.entities[i].field,
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        default:
                    }
                }
            }
        }
        return false;
    }
}

export default Validator;
