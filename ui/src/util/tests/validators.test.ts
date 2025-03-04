import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import Validator, { parseFunctionRawStr, SaveValidator, ValidatorEntity } from '../Validator';

describe('Validator.checkIsFieldHasInput', () => {
    it('should return false for undefined input', () => {
        expect(Validator.checkIsFieldHasInput(undefined)).toBe(false);
    });

    it('should return false for null input', () => {
        expect(Validator.checkIsFieldHasInput(null)).toBe(false);
    });

    it('should return false for empty string input', () => {
        expect(Validator.checkIsFieldHasInput('')).toBe(false);
    });

    it('should return true for string with just spacebar', () => {
        expect(Validator.checkIsFieldHasInput(' ')).toBe(true);
    });

    it('should return true for non-empty string input', () => {
        expect(Validator.checkIsFieldHasInput('non-empty')).toBe(true);
    });

    it('should return true for number input', () => {
        expect(Validator.checkIsFieldHasInput(123)).toBe(true);
    });

    it('should return true for boolean input', () => {
        expect(Validator.checkIsFieldHasInput(true)).toBe(true);
        expect(Validator.checkIsFieldHasInput(false)).toBe(true);
    });

    it('should return true for object input', () => {
        expect(Validator.checkIsFieldHasInput({})).toBe(true);
    });

    it('should return true for file input', () => {
        expect(Validator.checkIsFieldHasInput({ fileContent: 'string' })).toBe(true);
    });

    it('should return true for empty file input', () => {
        expect(Validator.checkIsFieldHasInput({ fileContent: '' })).toBe(true);
    });
});

describe('Validator.doValidation - regex case', () => {
    const entities = [
        {
            field: 'testField',
            label: 'Test Field',
            type: 'text',
            validators: [
                {
                    type: 'regex',
                    pattern: '^[a-zA-Z0-9]+$',
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid regex match', () => {
        const validator = new Validator(entities);
        const data = { testField: 'valid123' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for invalid regex match', () => {
        const validator = new Validator(entities);
        const data = { testField: 'invalid!' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field does not match regular expression ^[a-zA-Z0-9]+$',
        });
    });

    it('should return an error for invalid regex pattern', () => {
        const invalidEntities = [
            {
                field: 'testField',
                label: 'Test Field',
                type: 'text',
                validators: [
                    {
                        type: 'regex',
                        pattern: '[invalid',
                    },
                ],
            },
        ] satisfies ValidatorEntity[];

        const validator = new Validator(invalidEntities);
        const data = { testField: 'test' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: '[invalid is not a valid regular expression',
        });
    });

    it('should return correct errors for start with $ and length 2-8192', () => {
        const testEntity = [
            {
                field: 'testField',
                label: 'Test Field',
                type: 'text',
                validators: [
                    {
                        type: 'string',
                        minLength: 2,
                        maxLength: 8192,
                        errorMsg: 'Length of Query parameters should be between 2 and 8192',
                    },
                    {
                        type: 'regex',
                        pattern: '^\\$',
                        errorMsg: "Query parameters should start with '$'",
                    },
                ],
            },
        ] satisfies ValidatorEntity[];

        const validator = new Validator(testEntity);

        expect(validator.doValidation({ testField: ' ' })).toEqual({
            errorField: 'testField',
            errorMsg: 'Length of Query parameters should be between 2 and 8192',
        });

        expect(validator.doValidation({ testField: '$' })).toEqual({
            errorField: 'testField',
            errorMsg: 'Length of Query parameters should be between 2 and 8192',
        });

        expect(validator.doValidation({ testField: '  ' })).toEqual({
            errorField: 'testField',
            errorMsg: "Query parameters should start with '$'",
        });

        expect(validator.doValidation({ testField: 'a$a' })).toEqual({
            errorField: 'testField',
            errorMsg: "Query parameters should start with '$'",
        });

        expect(validator.doValidation({ testField: '$'.repeat(8192) })).toEqual(false);

        expect(validator.doValidation({ testField: ' '.repeat(8193) })).toEqual({
            errorField: 'testField',
            errorMsg: 'Length of Query parameters should be between 2 and 8192',
        });

        expect(validator.doValidation({ testField: '$ ' })).toEqual(false);
    });
});

describe('Validator.doValidation - string case', () => {
    const entities = [
        {
            field: 'testField',
            label: 'Test Field',
            type: 'text',
            validators: [
                {
                    type: 'string',
                    minLength: 5,
                    maxLength: 10,
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid string length', () => {
        const validator = new Validator(entities);
        const data = { testField: 'valid' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for string shorter than minLength', () => {
        const validator = new Validator(entities);
        const data = { testField: 'shor' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Length of Test Field should be greater than or equal to 5',
        });
    });

    it('should return an error for string longer than maxLength', () => {
        const validator = new Validator(entities);
        const data = { testField: 'thisisaverylongstring' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Length of Test Field should be less than or equal to 10',
        });
    });
});

describe('Validator.doValidation - number case', () => {
    const entities = [
        {
            field: 'testField',
            type: 'text',
            label: 'Test Field',
            validators: [
                {
                    type: 'number',
                    range: [1, 10],
                    isInteger: true,
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid number', () => {
        const validator = new Validator(entities);
        const data = { testField: 5 };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it.each([undefined, null])('should return false validation for %s when optional', (value) => {
        const validator = new Validator(entities);
        const data = { testField: value };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it.each([undefined, null])('should return error for %s number when required', (value) => {
        const requiredEntities = [{ ...entities[0], required: true }];
        const validator = new Validator(requiredEntities);
        const data = { testField: value };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field is required',
        });
    });

    it('should return an error for number out of range', () => {
        const validator = new Validator(entities);
        const data = { testField: 15 };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field should be within the range of [1 and 10]',
        });
    });

    it('should return an error for non-integer number', () => {
        const validator = new Validator(entities);
        const data = { testField: 5.5 };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field is not a integer',
        });
    });

    it('should pass validation for non-integer number', () => {
        const entitiesNoneInteger = [
            {
                ...entities[0],
                validators: [
                    {
                        ...entities[0].validators[0],
                        isInteger: false,
                    },
                ],
            },
        ];
        const validator = new Validator(entitiesNoneInteger);
        const data = { testField: 5.5 };
        const result = validator.doValidation(data);
        expect(result).toEqual(false);
    });
});

describe('Validator.doValidation - url case', () => {
    const entities = [
        {
            field: 'testField',
            label: 'Test Field',
            type: 'text',
            validators: [
                {
                    type: 'url',
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid URL', () => {
        const validator = new Validator(entities);
        const data = { testField: 'https://example.com' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for invalid URL', () => {
        const validator = new Validator(entities);
        const data = { testField: 'invalid url' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field is not a valid URL',
        });
    });
});

describe('Validator.doValidation - date case', () => {
    const entities = [
        {
            field: 'testField',
            type: 'text',
            label: 'Test Field',
            validators: [
                {
                    type: 'date',
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid date', () => {
        const validator = new Validator(entities);
        const data = { testField: '2025-02-19' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for invalid date', () => {
        const validator = new Validator(entities);
        const data = { testField: 'invalid-date' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field is not a valid date in ISO 8601 format',
        });
    });
});

describe('Validator.doValidation - email case', () => {
    const entities = [
        {
            field: 'testField',
            type: 'text',
            label: 'Test Field',
            validators: [
                {
                    type: 'email',
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid email', () => {
        const validator = new Validator(entities);
        const data = { testField: 'test@example.com' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for invalid email', () => {
        const validator = new Validator(entities);
        const data = { testField: 'invalid-email' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field is not a valid email address',
        });
    });
});

describe('Validator.doValidation - ipv4 case', () => {
    const entities = [
        {
            field: 'testField',
            type: 'text',
            label: 'Test Field',
            validators: [
                {
                    type: 'ipv4',
                },
            ],
        },
    ] satisfies ValidatorEntity[];

    it('should return false for valid IPv4 address', () => {
        const validator = new Validator(entities);
        const data = { testField: '192.168.0.1' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for invalid IPv4 address', () => {
        const validator = new Validator(entities);
        const data = { testField: 'invalid-ip' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Field Test Field is not a valid IPV4 address',
        });
    });
});

describe('Validator.doValidation - custom case', () => {
    const customValidatorFunc = (field: string, data: AcceptableFormValueOrNullish) => {
        if (data !== 'custom-valid') {
            return `Custom validation failed for ${field}`;
        }
        return false;
    };

    const entities = [
        {
            field: 'testField',
            type: 'checkboxGroup',
            label: 'Test Field',
            validators: [
                {
                    type: 'custom',
                    validatorFunc: customValidatorFunc,
                },
            ],
        },
        // to be changed
        // custom validators do not exist on anyEntity but should be there
        // as users can add it ie. via custom control
        // it is not possible to add it via global config
        // but done via custom js code
    ] satisfies ValidatorEntity[];

    it('should return false for valid custom validation', () => {
        const validator = new Validator(entities);
        const data = { testField: 'custom-valid' };
        const result = validator.doValidation(data);
        expect(result).toBe(false);
    });

    it('should return an error for invalid custom validation', () => {
        const validator = new Validator(entities);
        const data = { testField: 'invalid' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Custom validation failed for testField',
        });
    });
});

describe('parseFunctionRawStr', () => {
    it('should correctly parse a valid function string', () => {
        const validFunctionString = '(data) => data === "valid"';
        const { error, result } = parseFunctionRawStr(validFunctionString);
        expect(error).toBeUndefined();
        expect(result).toBeInstanceOf(Function);
        expect(result('valid')).toBe(true);
    });

    it('should return an error for an empty function string', () => {
        const emptyFunctionString = '';
        const { error, result } = parseFunctionRawStr(emptyFunctionString);
        expect(error).toBe(' is not a function');
        expect(result).toBeUndefined();
    });
});

describe('SaveValidator', () => {
    it('should correctly parse and execute a valid function string', () => {
        const validFunctionString =
            '(data) => data.someFieldName === "valid" ? false : "Invalid data"';
        const formData = { someFieldName: 'valid' };
        const result = SaveValidator(validFunctionString, formData);
        expect(result).toBeUndefined();
    });

    it('should return an error for an invalid function string', () => {
        const invalidFunctionString = '(data) => { invalid }';
        const formData = { someFieldName: 'valid' };
        expect(SaveValidator.bind(null, invalidFunctionString, formData)).toThrow();
    });

    it('should return the error string when the parsed function returns an error string', () => {
        const functionReturningErrorString = '(data) => "Error occurred"';
        const formData = { someFieldName: 'valid' };
        const result = SaveValidator(functionReturningErrorString, formData);
        expect(result).toEqual({ errorMsg: 'Error occurred' });
    });

    it('should not return an error when the parsed function returns a non-error value', () => {
        const functionReturningNonErrorValue = '(data) => false';
        const formData = { someFieldName: 'valid' };
        const result = SaveValidator(functionReturningNonErrorValue, formData);
        expect(result).toBeUndefined();
    });
});

describe('Validator.doValidation - empty values', () => {
    const entity = {
        field: 'testField',
        type: 'text',
        label: 'Test Field',
    } satisfies ValidatorEntity;

    const emptyValues = [undefined, null, ''];

    const validationTypes: (
        | 'string'
        | 'number'
        | 'date'
        | 'regex'
        | 'email'
        | 'ipv4'
        | 'url'
        | 'custom'
    )[] = ['string', 'regex', 'number', 'url', 'date', 'email', 'custom', 'ipv4'];

    it.each(validationTypes)('error as data required %s', (validatorType) => {
        emptyValues.forEach((emptyValue) => {
            const validator = new Validator([
                {
                    ...entity,
                    required: true,
                    // to do change when validators consider custom as validation type
                    validators: [{ type: validatorType }] as ValidatorEntity['validators'],
                } satisfies ValidatorEntity,
            ]);
            const data = { testField: emptyValue };
            const result = validator.doValidation(data);
            expect(result).toEqual({
                errorField: 'testField',
                errorMsg: 'Field Test Field is required',
            });
        });
    });

    it.each(validationTypes)('passes as NOT required %s', (validatorType) => {
        emptyValues.forEach((emptyValue) => {
            const validator = new Validator([
                {
                    ...entity,
                    required: false,
                    validators: [
                        { type: validatorType, validatorFunc: () => false },
                        // to do change when validators consider custom as validation type
                    ] as ValidatorEntity['validators'],
                } satisfies ValidatorEntity,
            ]);
            const data = { testField: emptyValue };
            const result = validator.doValidation(data);
            expect(result).toEqual(false);
        });
    });
});
