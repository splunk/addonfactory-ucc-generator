import {Validator} from 'jsonschema';

export function validateSchema(config) {
    const schema = require('rootDir/schema/schema.json');

    const validator = new Validator();
    const res = validator.validate(config, schema);
    return {
        failed: !!res.errors.length,
        errors: res.errors
    };
}
