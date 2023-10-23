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
            if (row.input?.required) {
                errorMessage = Validator.RequiredValidator(
                    field,
                    row.checkbox?.label || row.field,
                    rowSubmittedValue.inputValue
                );
                // break loop
                return errorMessage;
            }

            if (row.input?.validators?.length) {
                return row.input?.validators.some((validator) => {
                    const { type } = validator;
                    switch (type) {
                        case 'number':
                            errorMessage = Validator.NumberValidator(
                                field,
                                row.checkbox?.label || row.field,
                                validator,
                                rowSubmittedValue.inputValue
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
