import _ from 'lodash';
import {PREDEFINED_VALIDATORS_DICT} from 'app/constants/preDefinedRegex';
import {getFormattedMessage} from 'app/util/messageUtil';
import {
  parseNumberValidator,
  parseRegexRawStr,
  parseStringValidator
} from 'app/util/uccConfigurationValidators';
import BaseModel from 'app/models/Base.Model';

// Required fields will be checked by `nonEmptyString`, all other validators are generated in this method
function validatorFactory(validatorInfo, label) {
    const {type, errorMsg} = validatorInfo;

    const checkIsFieldHasInput = (attrValue) => {
        return attrValue !== undefined && attrValue !== '';
    };

    if(type === 'regex') {
        const {pattern} = validatorInfo;
        return function(attr) {
            const {error, result: regex} = parseRegexRawStr(pattern);
            if (error) {
                return error;
            }
            const attrValue = this.entry.content.get(attr);
            if(checkIsFieldHasInput(attrValue) && !regex.test(attrValue)) {
                return  errorMsg ? errorMsg :
                    getFormattedMessage(15, label, pattern);
            }
        };
    }

    if(type === 'number') {
        const {range} = validatorInfo;
        return function(attr) {
            const {error} = parseNumberValidator(range);
            if(error) {
                return error;
            }
            const attrValue = this.entry.content.get(attr);
            if (!checkIsFieldHasInput(attrValue)) {
                return;
            }

            const val = Number(attrValue);
            if(_.isNaN(val)) {
                return errorMsg ? errorMsg :
                    getFormattedMessage(16, label);
            }

            if(val > range[1] || val < range[0]) {
                return errorMsg ? errorMsg :
                    getFormattedMessage(8, label, range[0], range[1]);
            }
        };
    }

    if(type === 'string') {
        const {minLength, maxLength} = validatorInfo;
        return function(attr) {
            const {error} = parseStringValidator(minLength, maxLength);
            if (error) {
                return error;
            }

            // Treat field without sepcified value as empty string
            const attrValue = this.entry.content.get(attr);
            if (!checkIsFieldHasInput(attrValue)) {
                return;
            }

            if(attrValue.length > maxLength)
                return errorMsg ? errorMsg :
                    getFormattedMessage(18, label, maxLength);
            if(attrValue.length < minLength)
                return errorMsg ? errorMsg :
                    getFormattedMessage(17, label, minLength);
        };
    }

    const preDefinedRegexObj = PREDEFINED_VALIDATORS_DICT[type];
    if(preDefinedRegexObj) {
        const {inputValueType, regex} = preDefinedRegexObj;

        return function(attr) {
            const attrValue = this.entry.content.get(attr);

            if(checkIsFieldHasInput(attrValue) && !regex.test(attrValue)) {
                return errorMsg ? errorMsg :
                    getFormattedMessage(19, label, inputValueType);
            }
        };
    }

    // Handle invalid configuration, just in case.
    return () => {};
}

export function generateValidators(entities) {
    return entities.reduce((res, entity) => {
        const {
            validators,
            required,
            field: fieldName,
            label
        } = entity;
        const backboneValidators = (validators || []).map(d => {
            const validator = validatorFactory(d, label);
            return {validator, fieldName};
        });

        if (required) {
            backboneValidators.unshift({
                validator: BaseModel.prototype.nonEmptyString,
                fieldName
            });
        }

        return res.concat(backboneValidators);
    }, []);
}
