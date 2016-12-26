import _ from 'lodash';
import schema from 'rootDir/schema/schema.json';
import {Validator} from 'jsonschema';
import {PREDEFINED_VALIDATORS_DICT} from 'app/constants/preDefinedRegex';
import {getFormattedMessage} from 'app/util/messageUtil';
import BaseModel from 'app/models/Base.Model';

export function validateSchema(config) {
    const validator = new Validator();
    const res = validator.validate(config, schema);
    if(!res.errors.length) {
        res.errors = checkConfigDetails(config);
    }
    return {
        failed: !!res.errors.length,
        errors: res.errors
    };
}

// In this function, we can be sure that the config has already passed the basic schema validation
function checkConfigDetails({pages: {configuration, inputs}}) {
    const errors = [];

    const checkBaseOptions = (options) => {
        _.values(options).forEach(d => {
            const {error} = parseFunctionRawStr(d);
            if (error) {
                errors.push(error);
            }
        });
    };

    const checkEntity = (entity) => {
        _.values(entity).forEach(item => {
            const {validators} = item;
            _.values(validators).forEach(d => {
                let error;
                switch (d.type) {
                    case 'string':
                        error = parseStringValidator(d.minLength, d.maxLength).error;
                        break;
                    case 'number':
                        error = parseNumberValidator(d.range).error;
                        break;
                    case 'regex':
                        error = parseRegexRawStr(d.pattern).error;
                        break;
                    default:
                }
                if (error) {
                    errors.push(error);
                }
            });
        });
    };

    if (inputs) {
        const {services} = inputs;
        services.forEach(service => {
            const {entity, options} = service;
            checkBaseOptions(options);
            checkEntity(entity);
            _.values(options).forEach(d => console.log(d));
        });
    }

    if(configuration) {
        configuration.tabs.forEach(tab => {
            const {entity, options} = tab;
            checkBaseOptions(options);
            checkEntity(entity);
        });
    }
    return errors;
}

function parseFunctionRawStr(rawStr) {
    let error, result;

    try {
        result = eval(`(${rawStr})`);
    } catch (e) {
        error = getFormattedMessage(11, rawStr);
    }

    return {error, result};
}

function parseRegexRawStr(rawStr) {
    let error, result;

    try {
        result = new RegExp(rawStr);
    } catch (e) {
        error = getFormattedMessage(12, rawStr);
    }

    return {error, result};
}

function parseNumberValidator(range) {
    const isRangeLegal = range.length === 2 && _.isNumber(range[0]) &&
        _.isNumber(range[1]) && range[0] <= range[1];

    const error = isRangeLegal ? undefined :
        getFormattedMessage(13, JSON.stringify(range));

    return {error};
}

function parseStringValidator(minLength, maxLength) {
    const error = maxLength >= minLength ? undefined :
        getFormattedMessage(14, minLength, maxLength);

    return {error};
}

function validatorFactory(validatorInfo, label) {
    const {type, errorMsg} = validatorInfo;

    if(type === 'regex') {
        const {pattern} = validatorInfo;
        return function(attr) {
            const {error, result: regex} = parseRegexRawStr(pattern);
            if (error) {
                return error;
            }
            const val = this.entry.content.get(attr);
            if(!regex.test(val)) {
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
            const val = Number(this.entry.content.get(attr));
            if(Number.isNaN(val)) {
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
            let str = this.entry.content.get(attr);
            str = str === undefined ? '' : str;

            if(str.length > maxLength)
                return errorMsg ? errorMsg :
                    getFormattedMessage(18, label, maxLength);
            if(str.length < minLength)
                return errorMsg ? errorMsg :
                    getFormattedMessage(17, label, minLength);
        };
    }

    const preDefinedRegexObj = PREDEFINED_VALIDATORS_DICT[type];
    if(preDefinedRegexObj) {
        const {inputValueType, regex} = preDefinedRegexObj;

        return function(attr) {
            const val = this.entry.content.get(attr);

            if(!regex.test(val)) {
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
        const {validators, required} = entity;
        const backboneValidators = (validators || []).map(d => {
            let validator;
            validator = validatorFactory(d, entity.label);
            return {
                validator,
                fieldName: entity.field
            };
        });

        if (required) {
            backboneValidators.push({
                validator: BaseModel.prototype.nonEmptyString,
                fieldName: entity.field
            });
        }

        return res.concat(backboneValidators);
    }, []);
}
