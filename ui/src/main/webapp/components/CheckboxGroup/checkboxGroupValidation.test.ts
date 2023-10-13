import Validator from '../../util/Validator';
import { validateCheckboxGroup } from './checkboxGroupValidation';

describe('validateCheckboxGroup', () => {
    it('should handle required validation', () => {
        const mockRequiredValidator = jest.fn().mockReturnValue(false);
        Validator.RequiredValidator = mockRequiredValidator;

        const result = validateCheckboxGroup('field1', 'field1/', {
            rows: [
                {
                    field: 'field1',
                    input: { required: true },
                    checkbox: { label: 'Label 1' },
                },
            ],
        });

        expect(mockRequiredValidator).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should handle number validation', () => {
        const mockNumberValidator = jest.fn().mockReturnValue(false);
        Validator.NumberValidator = mockNumberValidator;

        const result = validateCheckboxGroup('field1', 'field1/123', {
            rows: [
                {
                    field: 'field1',
                    input: { validators: [{ type: 'number', range: [1, 2] }] },
                    checkbox: { label: 'Label 1' },
                },
            ],
        });

        expect(mockNumberValidator).toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should throw an error for unsupported validator', () => {
        expect(() => {
            validateCheckboxGroup('field1', 'field1/123', {
                rows: [
                    {
                        field: 'field1',
                        // @ts-expect-error tests
                        input: { validators: [{ type: 'unsupported' }] },
                        checkbox: { label: 'Label 1' },
                    },
                ],
            });
        }).toThrow('[CheckboxGroup] Unsupported validator unsupported for field field1');
    });

    it('should return false if no validation is required', () => {
        const result = validateCheckboxGroup('field1', 'field1/123', {
            rows: [
                {
                    field: 'field1',
                    input: {},
                    checkbox: { label: 'Label 1' },
                },
            ],
        });

        expect(result).toBe(false);
    });

    it('should skip validation if no value provided', () => {
        const mockNumberValidator = jest.fn().mockReturnValue(false);
        Validator.NumberValidator = mockNumberValidator;
        const result = validateCheckboxGroup('field1', '', {
            rows: [
                {
                    field: 'field1',
                    input: { validators: [{ type: 'number', range: [1, 2] }] },
                    checkbox: { label: 'Label 1' },
                },
            ],
        });
        expect(mockNumberValidator).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });
});
