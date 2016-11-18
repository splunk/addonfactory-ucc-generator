import _ from 'lodash';
import schema from 'rootDir/schema/schema.json';
import {Validator} from 'jsonschema';

export function validateSchema(config) {
    const validator = new Validator();
    const res = validator.validate(config, schema);
    return {
        failed: !!res.errors.length,
        errors: res.errors
    };
};

// TODO: support customized error message
function validatorFactory(validatorInfo) {
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
                        return errorMsg ? errorMsg : `Value of ${attr} not match RegExp ${pattern}.`;
                } catch (e) {
                    return `${pattern} isn't a legal RegExp.`;
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
                    return errorMsg ? errorMsg : `Value of ${attr} is not a number.`;

                if(val > range[1] || val < range[0])
                    return `Value of ${attr} not in range ${range[0]} - ${range[1]}.`;
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
                    return errorMsg ? errorMsg : `Value of ${attr} is too long(more than ${maxLength} characters).`;
                if(strLength < minLength)
                    return errorMsg ? errorMsg : `Value of ${attr} is too short(less than ${minLength} characters).`;
            }
        }
    }

    // Handle invalid configuration, just in case.
    return () => {};
};

// TODO: currently, each field only support one validator, need fix that.
export function generateValidators(entities) {
    return entities.reduce((res, entity) => {
        const backboneValidators = (entity.validators || []).map(d => {
            let validator;
            validator = validatorFactory(d);
            return {
                validator,
                fieldName: entity.field
            };
        });
        return res.concat(backboneValidators);
    }, []);
};
