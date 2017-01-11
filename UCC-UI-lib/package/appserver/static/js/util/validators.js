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

function appendError(errors, err) {
    if (err) {
        errors.push(err);
    }
}

export function checkDupKeyValues(config, isInput) {
    // Forbid dup name/title in services and tabs
    const servicesLikeArr = _.get(config, isInput ? 'services' : 'tabs');
    const errors = [];
    let error;

    if (servicesLikeArr) {
        const rootFieldName = isInput ? 'inputs.services' : 'configuration.tabs';

        ['name', 'title'].forEach(d => {
            error = parseArrForDupKeys(servicesLikeArr, d, rootFieldName);
            appendError(errors, error);
        });

        // Forbid dup value/label for items and autoCompleteFields
        const checkEntityDupKeyValues = ({options}, objPosition) => {
            if (options) {
                const {items} = options;
                let {autoCompleteFields} = options;
                if (items) {
                    ['label', 'value'].forEach(d => {
                        error = parseArrForDupKeys(items, d, `${objPosition}.options.items`);
                        appendError(errors, error);
                    });
                }

                if (autoCompleteFields) {
                    const isGroupType = !!autoCompleteFields[0].children;

                    // Label checker, allow same label exist in different group, but forbid same label in any single group
                    const labelStoreList = isGroupType ?
                        autoCompleteFields.map(d => d.children) : [autoCompleteFields];
                    labelStoreList.forEach(d => {
                        error = parseArrForDupKeys(d, 'label', `${objPosition}.options.autoCompleteFields`);
                        appendError(errors, error);
                    });

                    if (isGroupType) {
                        autoCompleteFields = _.flatten(_.union(autoCompleteFields.map(d => d.children)));
                    }
                    error = parseArrForDupKeys(autoCompleteFields, 'value', `${objPosition}.options.autoCompleteFields`);
                    appendError(errors, error);
                }
            }
        };

        // Forbid dup field/label for entity
        servicesLikeArr.forEach((serviceLikeObj, i) => {
            const entityPosition = `${rootFieldName}[${i}].entity`;
            if (serviceLikeObj.entity) {
                ['field', 'label'].forEach(d => {
                    error = parseArrForDupKeys(serviceLikeObj.entity, d, entityPosition);
                    appendError(errors, error);
                });
                serviceLikeObj.entity.forEach((obj, i) => {
                    checkEntityDupKeyValues(obj, `${entityPosition}[${i}]`);
                });
            }
        });
    }

    return errors;
}

// In this function, we can be sure that the config has already passed the basic schema validation
function checkConfigDetails({pages: {configuration, inputs}}) {
    let error, errors = [];

    const checkBaseOptions = (options) => {
        _.values(options).forEach(d => {
            const {error} = parseFunctionRawStr(d);
            appendError(errors, error);
        });
    };

    const checkEntity = (entity, rootName, isCollectionType = true) => {
        _.values(entity).forEach(item => {
            const {validators} = item;

            _.values(validators).forEach(d => {
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
                appendError(errors, error);
            });
        });

        if (isCollectionType) {
            // Name field should be provided
            if (_.every(_.values(entity), ({field}) => field !== 'name')) {
                appendError(errors, getFormattedMessage(23, rootName));
            }
        }
    };

    if (inputs) {
        const {services} = inputs;
        services.forEach(service => {
            const {entity, options, name} = service;
            checkBaseOptions(options);
            checkEntity(entity, name);
        });
        errors = errors.concat(checkDupKeyValues(inputs, true));
    }

    if(configuration) {
        configuration.tabs.forEach(tab => {
            const {entity, options, name} = tab;
            checkBaseOptions(options);
            checkEntity(entity, name, !!tab.table);
        });
        errors = errors.concat(checkDupKeyValues(configuration, false));
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

function parseArrForDupKeys(arr, targetField, entityName) {
    const uniqFieldsLength = _.uniqBy(arr, d => {
        if (_.isString(d[targetField])) {
            return d[targetField].toLowerCase();
        }
        return d[targetField];
    }).length;
    if (arr.length != uniqFieldsLength) {
        return getFormattedMessage(21, targetField, entityName);
    }
}

function parseObjForDupKeys(obj, targetField, entityName) {
    const pairs = _.toPairs(obj);
    return parseArrForDupKeys(pairs, targetField, entityName);
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
