import * as _ from 'lodash';
import { z } from 'zod';

import { PREDEFINED_VALIDATORS_DICT } from '../constants/preDefinedRegex';
import { getFormattedMessage } from './messageUtil';
import {
    AcceptableFormValueOrNullish,
    NullishFormRecord,
} from '../types/components/shareableTypes';
import {
    AnyOfValidators,
    NumberValidator,
    RegexValidator,
    StringValidator,
} from '../types/globalConfig/validators';
import { AnyEntity, CustomValidatorFunc } from '../types/components/BaseFormTypes';

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

/**
 * @param {string} rawStr
 * @returns {{ error:string, result:Function }}
 */
export const parseFunctionRawStr = (rawStr: string) => {
    let error;
    let result;

    try {
        // eslint-disable-next-line no-eval
        result = eval(`(${rawStr})`);
    } catch (e) {
        error = getFormattedMessage(11, [rawStr]);
    }

    return { error, result };
};

// Validate provided saveValidator function
/**
 * @param {string} validatorFunc
 * @param {NullishFormRecord} formData
 * @returns {{ errorMsg: string }}
 */
export function SaveValidator(validatorFunc: string, formData: NullishFormRecord) {
    const { error, result } = parseFunctionRawStr(validatorFunc);
    if (error) {
        return { errorMsg: error };
    }
    const ret = result(formData);
    if (typeof ret === 'string') {
        return { errorMsg: ret };
    }
}

/**
 *
 * @param {[start: number, end: number]} range
 * @returns {{ error: string | undefined }}
 */
const parseNumberValidator = (range: [number, number]) => {
    const isRangeLegal =
        range.length === 2 && _.isNumber(range[0]) && _.isNumber(range[1]) && range[0] <= range[1];

    const error = isRangeLegal ? undefined : getFormattedMessage(13, [JSON.stringify(range)]);

    return { error };
};

/**
 *
 * @param {string} rawStr
 * @returns {{ error: string | undefined, result: RegExp | undefined }}
 */
const parseRegexRawStr = (rawStr: string | RegExp) => {
    let error;
    let result;

    try {
        result = new RegExp(rawStr);
    } catch (e) {
        // rawStr is wrapped in array as latter on message is formated with {{args[0]}}
        error = getFormattedMessage(12, [String(rawStr)]);
    }

    return { error, result };
};

type CustomValidator = { type: 'custom'; validatorFunc: CustomValidatorFunc };

type entitiesWithoutValidators = Omit<AnyEntity, 'validators'>;

export type ValidatorEntity = entitiesWithoutValidators & {
    validators?: (z.infer<typeof AnyOfValidators> | CustomValidator)[];
};

class Validator {
    entities: ValidatorEntity[];

    isName?: ValidatorEntity;

    constructor(entities?: ValidatorEntity[]) {
        this.entities = entities || [];

        this.isName = entities?.find((e) => e.field === 'name');
    }

    /**
     * @param {AcceptableFormValueOrNullish} attrValue
     * @returns {boolean}
     */
    static checkIsFieldHasInput = (attrValue: AcceptableFormValueOrNullish) =>
        attrValue !== undefined &&
        attrValue !== null &&
        (typeof attrValue === 'string' ? attrValue !== '' : true);

    /**
     * Validate the required field has value
     * @param {string} field
     * @param {string|number} label
     * @param {string|number} [data]
     * @returns {Error|false}
     */
    static RequiredValidator(field: string, label: string, data: AcceptableFormValueOrNullish) {
        if (!Validator.checkIsFieldHasInput(data)) {
            return { errorField: field, errorMsg: getFormattedMessage(6, [label]) };
        }
        return false;
    }

    /**
     * @typedef {ValidatorBase} StringValidatorOptions
     * @property {number} minLength
     * @property {number} maxLength
     * @property {string} errorMsg
     */

    /**
     * Validate the string length of field
     * @param {string} field
     * @param {string|number} label
     * @param {StringValidatorOptions} validator
     * @param {string} data
     * @returns {Error|false}
     */
    static StringValidator(
        field: string,
        label: string,
        validator: z.TypeOf<typeof StringValidator>,
        data: AcceptableFormValueOrNullish
    ) {
        if (
            Validator.checkIsFieldHasInput(data) &&
            typeof data === 'string' &&
            data.length > validator.maxLength
        ) {
            return {
                errorField: field,
                errorMsg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(18, [label, validator.maxLength]),
            };
        }

        if (
            Validator.checkIsFieldHasInput(data) &&
            typeof data === 'string' &&
            data.length < validator.minLength
        ) {
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
     * @param {string} [data]
     * @returns {Error|false}
     */
    static RegexValidator(
        field: string,
        label: string,
        validator: z.TypeOf<typeof RegexValidator>,
        data: AcceptableFormValueOrNullish
    ) {
        const { error, result: regex } = parseRegexRawStr(validator.pattern);
        // if regex is undefined it means there is an error
        if (error || regex === undefined) {
            return { errorField: field, errorMsg: error };
        }

        if (Validator.checkIsFieldHasInput(data) && typeof data === 'string' && !regex.test(data)) {
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
    /**
     *
     * @param {CustomValidatorFunc} validatorFunc
     * @param {string} field
     * @param {*} data
     * @returns
     */
    static CustomValidator(
        validatorFunc: CustomValidatorFunc,
        field: string,
        data: AcceptableFormValueOrNullish
    ) {
        const ret = validatorFunc(field, data);
        if (typeof ret === 'string') {
            return { errorField: field, errorMsg: ret };
        }
        return false;
    }

    // Validate the field should match predefined Regexes
    /**
     *
     * @param {string} field
     * @param {string} label
     * @param {NumberValidator | StringValidator | RegexValidator | EmailValidator | Ipv4Validator | UrlValidator | DateValidator } validator
     * @param {AcceptableFormValueOrNullish} data
     * @param {string} pattern
     * @param {string} inputValueType
     * @returns {Error|false}
     */
    static PreDefinedRegexValidator(
        field: string,
        label: string,
        validator: z.TypeOf<typeof AnyOfValidators>,
        data: AcceptableFormValueOrNullish,
        pattern: string | RegExp,
        inputValueType: string
    ) {
        const { error, result: regex } = parseRegexRawStr(pattern);
        // if regex is undefined it means there is an error
        if (error || regex === undefined) {
            return { errorField: field, errorMsg: error };
        }

        if (Validator.checkIsFieldHasInput(data) && typeof data === 'string' && !regex.test(data)) {
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
     * @property {boolean} isInteger
     */

    /**
     * Validate the field should match the provided Regex
     * @param {string} field
     * @param {string|number} label
     * @param {NumberValidatorOptions} validator
     * @param {NullishFormRecord} data
     * @returns {Error|false}
     */
    // Validate the range of numeric field
    static NumberValidator(
        field: string,
        label: string,
        validator: z.TypeOf<typeof NumberValidator>,
        data: AcceptableFormValueOrNullish
    ) {
        // this validation should be before this function but adding it
        // here to avoid any errors until this module is moved to ts
        if (data === null || data === undefined) {
            return false;
        }
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
        // If val is not an integer, return an error
        if (validator?.isInteger && !Number.isInteger(val)) {
            return {
                errorField: field,
                errorMsg: getFormattedMessage(29, [label]),
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

    /**
     *
     * @param {NullishFormRecord} data
     * @returns {Error|false}
     */
    doValidation(data: NullishFormRecord) {
        if (this.isName) {
            const targetValue = data.name;
            const nameFieldLabel = this.isName.label || '';

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

        /**
         * @type {number}
         */
        let i;
        /**
         * @type {number}
         */
        let j;

        for (i = 0; this.entities && i < this.entities.length; i += 1) {
            if (this.entities[i].required === true) {
                ret = Validator.RequiredValidator(
                    this.entities[i].field,
                    this.entities[i].label || '',
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

            const currentEntity = this.entities[i];
            if (!currentEntity?.label) {
                currentEntity.label = '';
            }

            if (currentEntity.validators) {
                for (j = 0; j < currentEntity.validators.length; j += 1) {
                    const currentValidator = currentEntity.validators[j];
                    switch (currentValidator.type) {
                        case 'string':
                            ret = Validator.StringValidator(
                                currentEntity.field,
                                currentEntity.label,
                                currentValidator,
                                data[currentEntity.field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'regex':
                            ret = Validator.RegexValidator(
                                currentEntity.field,
                                currentEntity.label || '',
                                currentValidator,
                                data[currentEntity.field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'number':
                            ret = Validator.NumberValidator(
                                currentEntity.field,
                                currentEntity.label || '',
                                currentValidator,
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'url':
                            ret = Validator.PreDefinedRegexValidator(
                                currentEntity.field,
                                currentEntity.label,
                                currentValidator,
                                data[currentEntity.field],
                                PREDEFINED_VALIDATORS_DICT.url.regex,
                                PREDEFINED_VALIDATORS_DICT.url.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'date':
                            ret = Validator.PreDefinedRegexValidator(
                                currentEntity.field,
                                currentEntity.label,
                                currentValidator,
                                data[currentEntity.field],
                                PREDEFINED_VALIDATORS_DICT.date.regex,
                                PREDEFINED_VALIDATORS_DICT.date.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'email':
                            ret = Validator.PreDefinedRegexValidator(
                                currentEntity.field,
                                currentEntity.label ?? '',
                                currentValidator,
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
                                currentEntity.field,
                                currentEntity.label ?? '',
                                currentValidator,
                                data[currentEntity.field],
                                PREDEFINED_VALIDATORS_DICT.ipv4.regex,
                                PREDEFINED_VALIDATORS_DICT.ipv4.inputValueType
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'custom':
                            ret = Validator.CustomValidator(
                                currentValidator.validatorFunc,
                                currentEntity.field,
                                data[currentEntity.field]
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
