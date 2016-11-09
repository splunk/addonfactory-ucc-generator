import schema from 'rootDir/schema/schema.json';
import {Validator} from 'jsonschema';

export function validateSchema(config) {
    const validator = new Validator();
    const res = validator.validate(config, schema);
    return {
        failed: !!res.errors.length,
        errors: res.errors
    };
}
