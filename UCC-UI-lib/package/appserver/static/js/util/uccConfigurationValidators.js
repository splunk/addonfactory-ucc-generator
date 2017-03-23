import {getFormattedMessage} from 'app/util/messageUtil';
import schema from 'rootDir/schema/schema.json';
import {Validator} from 'jsonschema';
import _ from 'lodash';

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

class Error {
    constructor(err, postion) {
        this.message = err;
        this.property = postion;
    }

    toString() {
        return `${this.property ? `${this.property}: ` : ''}${this.message}`;
    }
}

function appendError(errors, err, position) {
    if (err) {
        errors.push(new Error(err, position));
    }
}

export function checkDupKeyValues(config, isInput, position) {
    // Forbid dup name/title in services and tabs
    const servicesLikeArr = _.get(config, isInput ? 'services' : 'tabs');
    const errors = [];
    let error;

    if (servicesLikeArr) {
        position = `${position}.${isInput ? 'services' : 'tabs'}`;


        ['name', 'title'].forEach(d => {
            error = parseArrForDupKeys(servicesLikeArr, d);
            appendError(errors, error, position);
        });

        // Forbid dup value/label for items and autoCompleteFields
        const checkEntityDupKeyValues = ({options}, postion) => {
            if (options) {
                const {items} = options;
                let {autoCompleteFields} = options;
                if (items) {
                    ['label', 'value'].forEach(d => {
                        error = parseArrForDupKeys(items, d);
                        appendError(errors, error, `${postion}.options.items`);
                    });
                }

                if (autoCompleteFields) {
                    const isGroupType = !!autoCompleteFields[0].children;

                    // Label checker, allow same label exist in different group, but forbid same label in any single group
                    const labelStoreList = isGroupType ?
                        autoCompleteFields.map(d => d.children) : [autoCompleteFields];
                    labelStoreList.forEach(d => {
                        error = parseArrForDupKeys(d, 'label');
                        appendError(errors, error, `${postion}.options.autoCompleteFields`);
                    });

                    if (isGroupType) {
                        autoCompleteFields = _.flatten(_.union(autoCompleteFields.map(d => d.children)));
                    }
                    error = parseArrForDupKeys(autoCompleteFields, 'value');
                    appendError(errors, error, `${postion}.options.autoCompleteFields`);
                }
            }
        };

        // Forbid dup field/label for entity
        servicesLikeArr.forEach((serviceLikeObj, i) => {
            const entityPosition = `${position}[${i}].entity`;
            if (serviceLikeObj.entity) {
                ['field', 'label'].forEach((d, i) => {
                    error = parseArrForDupKeys(serviceLikeObj.entity, d);
                    appendError(errors, error, `${entityPosition}[${i}]`);
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
    let error, errors = [], position = 'instantce.pages';

    const checkBaseOptions = (options, position) => {
        _.values(options).forEach((d, i) => {
            const {error} = parseFunctionRawStr(d);
            appendError(errors, error, `${position}[${i}]`);
        });
    };

    const checkEntity = (entity, position) => {
        _.values(entity).forEach((item, i) => {
            const {validators} = item;

            _.values(validators).forEach((d, j) => {
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
                appendError(errors, error, `${position}[${i}].validators[${j}]`);
            });
        });
    };

    if (inputs) {
        const {services} = inputs;
        services.forEach((service, i) => {
            const {entity, options} = service;
            checkBaseOptions(options, `${position}.inputs.services[${i}].options`);
            checkEntity(entity, `${position}.inputs.services[${i}].entity`);
        });
        errors = errors.concat(checkDupKeyValues(inputs, true, `${position}.inputs`));
    }

    if(configuration) {
        configuration.tabs.forEach((tab, i) => {
            const {entity, options} = tab;
            checkBaseOptions(options, `${position}.configuration.tabs[${i}].options`);
            checkEntity(entity, `${position}.configuration.tabs[${i}].entity`);
        });
        errors = errors.concat(checkDupKeyValues(configuration, false, `${position}.configuration`));
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

export function parseRegexRawStr(rawStr) {
    let error, result;

    try {
        result = new RegExp(rawStr);
    } catch (e) {
        error = getFormattedMessage(12, rawStr);
    }

    return {error, result};
}

export function parseArrForDupKeys(arr, targetField) {
    const uniqFieldsLength = _.uniqBy(arr, d => {
        if (_.isString(d[targetField])) {
            return d[targetField].toLowerCase();
        }
        return d[targetField];
    }).length;
    if (arr.length != uniqFieldsLength) {
        return getFormattedMessage(21, targetField);
    }
}

export function parseNumberValidator(range) {
    const isRangeLegal = range.length === 2 && _.isNumber(range[0]) &&
        _.isNumber(range[1]) && range[0] <= range[1];

    const error = isRangeLegal ? undefined :
        getFormattedMessage(13, JSON.stringify(range));

    return {error};
}

export function parseStringValidator(minLength, maxLength) {
    const error = maxLength >= minLength ? undefined :
        getFormattedMessage(14, minLength, maxLength);

    return {error};
}
