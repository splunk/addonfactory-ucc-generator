import _ from 'lodash';
import schema from 'rootDir/schema/schema.json';
import {Validator} from 'jsonschema';
import {PREDEFINED_VALIDATORS_DICT} from 'app/constants/preDefinedRegex';

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
    const erros = [];

    const checkBaseOptions = (options) => {
        _.values(options).forEach(d => {
            const {error} = parseFunctionRawStr(d);
            if (error) {
                erros.push(error);
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
                    erros.push(error);
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
    return erros;
}

function parseFunctionRawStr(rawStr) {
    let error, result;

    try {
        result = eval(`(${rawStr})`);
    } catch (e) {
        error = `${rawStr} ${_('is not a function').t()}${_('.').t()}`;
    }

    return {error, result};
}

function parseRegexRawStr(rawStr) {
    let error, result;

    try {
        result = new RegExp(rawStr);
    } catch (e) {
        error = `${rawStr} ${_('is not a legal Regular Expression').t()}${_('.').t()}`;
    }

    return {error, result};
}

function parseNumberValidator(range) {
    const isRangeLegal = range.length === 2 && _.isNumber(range[0]) &&
        _.isNumber(range[1]) && range[0] <= range[1];

    const error = isRangeLegal ? undefined :
        `${JSON.stringify(range)} } ${_('is not a legal number range').t()}${_('.').t()}`;

    return {error};
}

function parseStringValidator(minLength, maxLength) {
    const error = maxLength >= minLength ? undefined :
        `${minLength} ${maxLength} ${_('is not legal as minimum and maximum length of a string').t()}${_('.').t()}`;

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
                    `${_('Input of').t()} ${label} ${_('does not match Regular Expression').t()} ${pattern}${_('.').t()}`;
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
            if(Number.isNaN(val))
                return errorMsg ? errorMsg :
                    `${_('Input of').t()} ${label} ${_('is not a number.').t()}`;

            if(val > range[1] || val < range[0])
                return `${_('Input of').t()} ${label} ${_('is not in range').t()} ${range[0]} - ${range[1]}${_('.').t()}`;
        };
    }

    if(type === 'string') {
        const {minLength, maxLength} = validatorInfo;
        return function(attr) {
            const {error} = parseStringValidator(minLength, maxLength);
            if (error) {
                return error;
            }
            const strLength = this.entry.content.get(attr).length;

            if(strLength > maxLength)
                return errorMsg ? errorMsg :
                    `${_('Length of the').t()} ${label} ${_('input is greater than').t()} ${maxLength}${_('.').t()}`;
            if(strLength < minLength)
                return errorMsg ? errorMsg :
                    `${_('Length of the').t()} ${label} ${_('input is less than').t()} ${minLength}${_('.').t()}`;
        };
    }

    const preDefinedRegexObj = PREDEFINED_VALIDATORS_DICT[type];
    if(preDefinedRegexObj) {
        const {inputValueType, regex} = preDefinedRegexObj;

        return function(attr) {
            const val = this.entry.content.get(attr);

            if(!regex.test(val)) {
                return `${_('Input of').t()} ${label} ${_('is not a').t()} ${inputValueType}${_('.').t()}`;
            }
        };
    }

    // Handle invalid configuration, just in case.
    return () => {};
}

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
}
