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
    const {type} = validatorInfo;

    if(type === 'regex') {
        const {pattern} = validatorInfo;
        if(pattern) {
            return function(attr) {
                const val = this.entry.content.get(attr);
                try {
                    const regex = new RegExp(pattern);
                    if(!regex.test(val))
                        return `field ${attr} not match RegExp ${pattern}`;
                } catch (e) {
                    return `${pattern} isn't a legal RegExp`;
                }
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
            validator = validatorFactory(d);
            return {
                validator,
                fieldName: entity.field
            };
        });
        return res.concat(backboneValidators);
    }, []);
};
