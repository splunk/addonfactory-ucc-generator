import { PREDEFINED_VALIDATORS_DICT } from '../constants/preDefinedRegex';
import { getFormattedMessage } from './messageUtil';
import {
    parseNumberValidator,
    parseRegexRawStr,
    parseStringValidator,
} from './uccConfigurationValidators';

class Validator {
    constructor(entities) {
        this.entities = JSON.parse(entities);
    }

    checkIsFieldHasInput = (attrValue) => {
        return attrValue !== undefined && attrValue !== '';
    };

    RequiredValidator(field, data) {
        if (!this.checkIsFieldHasInput(data)) {
            return { error: true, msg: getFormattedMessage(6, field) };
        }
    }

    StringValidator(field, validator, data) {
        const { error } = parseStringValidator(validator.minLength, validator.maxLength);
        if (error) {
            return { error: true, msg: error };
        }
        if (this.checkIsFieldHasInput(data) && data.length > validator.maxLength) {
            return {
                error: true,
                msg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(18, [field, validator.maxLength]),
            };
        }
        if (this.checkIsFieldHasInput(data) && data.length < validator.minLength) {
            return {
                error: true,
                msg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(17, [field, validator.minLength]),
            };
        }
    }

    RegexValidator(field, validator, data) {
        const { error, result: regex } = parseRegexRawStr(validator.pattern);
        if (error) {
            return { error: true, msg: error };
        }
        if (this.checkIsFieldHasInput(data) && !regex.test(data)) {
            return {
                error: true,
                msg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(15, [field, validator.pattern]),
            };
        }
    }

    PreDefinedRegexValidator(field, validator, data, pattern, inputValueType) {
        const { error, result: regex } = parseRegexRawStr(pattern);
        if (error) {
            return { error: true, msg: error };
        }
        if (this.checkIsFieldHasInput(data) && !regex.test(data)) {
            return {
                error: true,
                msg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(19, [field, inputValueType]),
            };
        }
    }

    NumberValidator(field, validator, data) {
        const { error } = parseNumberValidator(validator.range);
        if (error) {
            return { error: true, msg: error };
        }

        const val = Number(data);
        if (_.isNaN(val)) {
            return {
                error: true,
                msg: validator.errorMsg ? validator.errorMsg : getFormattedMessage(16, field),
            };
        }
        if (
            (this.checkIsFieldHasInput(data) && val > validator.range[1]) ||
            val < validator.range[0]
        ) {
            return {
                error: true,
                msg: validator.errorMsg
                    ? validator.errorMsg
                    : getFormattedMessage(8, [field, validator.range[0], validator.range[1]]),
            };
        }
    }

    doValidation(data) {
        let ret;
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].required === true) {
                ret = this.RequiredValidator(this.entities[i].field, data[this.entities[i].field]);
                if (ret) {
                    console.log(ret);
                    return ret;
                }
            }
        }

        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].validators) {
                for (var j = 0; j < this.entities[i].validators.length; j++) {
                    switch (this.entities[i].validators[j].type) {
                        case 'string':
                            ret = this.StringValidator(
                                this.entities[i].field,
                                this.entities[i].validators[j],
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'regex':
                            ret = this.RegexValidator(
                                this.entities[i].field,
                                this.entities[i].validators[j],
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'number':
                            ret = this.NumberValidator(
                                this.entities[i].field,
                                this.entities[i].validators[j],
                                data[this.entities[i].field]
                            );
                            if (ret) {
                                return ret;
                            }
                            break;
                        case 'url':
                            ret = this.PreDefinedRegexValidator(
                                this.entities[i].field,
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
                            ret = this.PreDefinedRegexValidator(
                                this.entities[i].field,
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
                            ret = this.PreDefinedRegexValidator(
                                this.entities[i].field,
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
                            ret = this.PreDefinedRegexValidator(
                                this.entities[i].field,
                                this.entities[i].validators[j],
                                data[this.entities[i].field],
                                PREDEFINED_VALIDATORS_DICT.ipv4.regex,
                                PREDEFINED_VALIDATORS_DICT.ipv4.inputValueType
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
    }
}

export default Validator;
