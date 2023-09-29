import { useEffect } from 'react';
import Validator from '../../util/Validator';
import { CheckboxGroupProps, parseValue } from './checkboxGroup.utils';

type MaybeError =
    | {
          errorField: string;
          errorMsg: string;
      }
    | false;

export function validateCheckboxGroup(
    field: string,
    packedValue: string,
    options: CheckboxGroupProps['controlOptions']
): MaybeError {
    let errorMessage: MaybeError = false;
    const parsedValue = parseValue(packedValue);
    options.rows.some((row) => {
        const rowSubmittedValue = parsedValue.get(row.field);
        if (rowSubmittedValue) {
            if (row.text.required) {
                errorMessage = Validator.RequiredValidator(
                    field,
                    row.checkbox?.label || row.field,
                    rowSubmittedValue?.text
                );
                // break loop
                return errorMessage;
            }

            const { validators } = row.text;
            if (validators?.length) {
                return validators.some((validator) => {
                    const { type } = validator;
                    switch (type) {
                        case 'regex':
                            errorMessage = Validator.RegexValidator(
                                field,
                                row.checkbox?.label || row.field,
                                validator,
                                rowSubmittedValue?.text
                            );
                            return errorMessage;
                        case 'string':
                            errorMessage = Validator.StringValidator(
                                field,
                                row.checkbox?.label || row.field,
                                validator,
                                rowSubmittedValue?.text
                            );
                            return errorMessage;

                        case 'number':
                            errorMessage = Validator.NumberValidator(
                                field,
                                row.checkbox?.label || row.field,
                                validator,
                                rowSubmittedValue?.text
                            );

                            return errorMessage;

                        default:
                            throw new Error(
                                `[CheckboxGroup] Unsupported validator ${type} for field ${field}`
                            );
                    }
                });
            }
        }
        return false;
    });
    return errorMessage;
}

export function useValidation(
    addCustomValidator: CheckboxGroupProps['addCustomValidator'],
    field: string,
    controlOptions: CheckboxGroupProps['controlOptions']
) {
    useEffect(() => {
        addCustomValidator?.(field, (submittedField, submittedValue) => {
            const validationResult = validateCheckboxGroup(
                submittedField,
                submittedValue,
                controlOptions
            );
            if (validationResult !== false) {
                return validationResult.errorMsg;
            }
            return validationResult;
        });
    }, [field, addCustomValidator, controlOptions]);
}
