import _ from 'lodash';
import schema from 'rootDir/schema/schema.json';
import {Validator} from 'jsonschema';
import {PREDEFINED_VALIDATORS_DICT} from 'app/constants/preDefinedRegex';

export function validateSchema(config) {
    const validator = new Validator();
    const res = validator.validate(config, schema);
    return {
        failed: !!res.errors.length,
        errors: res.errors
    };
};

function validatorFactory(validatorInfo, label) {
    const {type, errorMsg} = validatorInfo;

    if(type === 'regex') {
        const {pattern} = validatorInfo;
        // Assume pattern can be an empty string, so using !== here
        if(pattern !== undefined) {
            return function(attr) {
                const val = this.entry.content.get(attr);
                try {
                    const regex = new RegExp(pattern);
                    if(!regex.test(val))
                        return errorMsg ? errorMsg :
                            `${_('Input of').t()} ${label} ${_('does not match Regular Expression').t()} ${pattern}${_('.').t()}`;
                } catch (e) {
                    return `${pattern} ${_('is not a legal Regular Expression').t()}${_('.').t()}`;
                }
            }
        }
    }

    if(type === 'number') {
        const {range} = validatorInfo;
        if(range && _.isArray(range) && range.length === 2 &&
            _.isNumber(range[0]) && _.isNumber(range[1]) &&
            range[0] <= range[1]
        ) {
            return function(attr) {
                const val = Number(this.entry.content.get(attr));
                if(Number.isNaN(val))
                    return errorMsg ? errorMsg :
                        `${_('Input of').t()} ${label} ${_('is not a number.').t()}`;

                if(val > range[1] || val < range[0])
                    return `${_('Input of').t()} ${label} ${_('is not in range').t()} ${range[0]} - ${range[1]}${_('.').t()}`;
            }
        }
    }

    if(type === 'string') {
        const {minLength, maxLength} = validatorInfo;
        if(minLength !== undefined && _.isNumber(minLength) &&
            maxLength !== undefined && _.isNumber(maxLength) &&
            maxLength >= minLength
        ) {
            return function(attr) {
                const strLength = this.entry.content.get(attr).length;

                if(strLength > maxLength)
                    return errorMsg ? errorMsg :
                        `${_('Length of the').t()} ${label} ${_('input is greater than').t()} ${maxLength}${_('.').t()}`;
                if(strLength < minLength)
                    return errorMsg ? errorMsg :
                        `${_('Length of the').t()} ${label} ${_('input is less than').t()} ${minLength}${_('.').t()}`;
            }
        }
    }

    const preDefinedRegexObj = PREDEFINED_VALIDATORS_DICT[type];
    if(preDefinedRegexObj) {
        const {inputValueType, regex} = preDefinedRegexObj;

        return function(attr) {
            const val = this.entry.content.get(attr);

            if(!regex.test(val)) {
                return `${_('Input of').t()} ${label} ${_('is not a').t()} ${inputValueType}${_('.').t()}`;
            }
        }
    }

    // Handle invalid configuration, just in case.
    return () => {};
};

export function generateValidators(entities) {
    return entities.reduce((res, entity) => {
        const backboneValidators = (entity.validators || []).map(d => {
            let validator;
            validator = validatorFactory(d, entity.label);
            return {
                validator,
                fieldName: entity.field
            };
        });
        return res.concat(backboneValidators);
    }, []);
};
