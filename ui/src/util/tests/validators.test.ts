import Validator from '../Validator';

jest.mock('../messageUtil', () => ({
    getFormattedMessage: jest.fn((id, params) => `Error message ${id} with params ${params}`),
}));

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

    it('should return true for array input', () => {
        expect(Validator.checkIsFieldHasInput([])).toBe(true);
    });
});

describe('Validator.doValidation - regex case', () => {
    const entities = [
        {
            field: 'testField',
            label: 'Test Field',
            validators: [
                {
                    type: 'regex',
                    pattern: '^[a-zA-Z0-9]+$',
                },
            ],
        },
    ];

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
            errorMsg: 'Error message 15 with params Test Field,^[a-zA-Z0-9]+$',
        });
    });

    it('should return an error for invalid regex pattern', () => {
        const invalidEntities = [
            {
                field: 'testField',
                label: 'Test Field',
                validators: [
                    {
                        type: 'regex',
                        pattern: '[invalid',
                    },
                ],
            },
        ];
        const validator = new Validator(invalidEntities);
        const data = { testField: 'test' };
        const result = validator.doValidation(data);
        expect(result).toEqual({
            errorField: 'testField',
            errorMsg: 'Error message 12 with params [invalid',
        });
    });

    it('should return correct errors for start with $ and length 2-8192', () => {
        const validator = new Validator([
            {
                field: 'testField',
                label: 'Test Field',
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
        ]);

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
