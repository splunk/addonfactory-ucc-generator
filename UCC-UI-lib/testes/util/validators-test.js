import assert from 'assert';
import {generateValidators} from 'app/util/validators';

describe('Validators generator testes', () => {
    describe('generateValidators should works', () => {
        it('Empty array should be returned when input is empty', () => {
            const result = generateValidators([]);
            assert.equal(typeof result, 'object');
            assert.equal(result.length, 0);
        });

        it('Entity with single validator should output single KV pairs', () => {
            const src = [
                {
                    'field': 'api_uuid',
                    'label': 'API UUID',
                    'type': 'text',
                    'validators': [
                        {
                            'type': 'regex',
                            'pattern': '\\w{1,50}'
                        }
                    ]
                }
            ];
            const result = generateValidators(src);
            assert.equal(result.length, 1);
            assert.equal(result[0].fieldName, src[0].field);
            assert.equal(typeof result[0].validator, 'function');
        });

        it('Entity with multiple validator should output multiple KV pairs', () => {
            const src = [
                {
                    'field': 'api_uuid',
                    'label': 'API UUID',
                    'type': 'text',
                    'validators': [
                        {
                            'type': 'regex',
                            'pattern': '\\w{1,50}'
                        }
                    ]
                },
                {
                    'field': 'api_uuid2',
                    'validators': [
                        {
                            'type': 'regex',
                            'pattern': '\\w{1,50}'
                        }
                    ]
                }
            ];
            const result = generateValidators(src);
            assert.equal(result.length, 2);
        });

        it('Required field itself will create a validator', () => {
            const src = [
                {
                    'field': 'api_uuid',
                    'label': 'API UUID',
                    'type': 'text',
                    'required': true
                }
            ];
            const result = generateValidators(src);
            assert.equal(result.length, 1);
        });
    });
});
