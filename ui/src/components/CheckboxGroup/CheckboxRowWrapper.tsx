import React from 'react';
import CheckboxRow from './CheckboxRow';
import { Row, ValueByField } from './checkboxGroup.utils';

function CheckboxRowWrapper({
    row,
    values,
    handleRowChange,
    disabled,
}: {
    row: Row;
    values: ValueByField;
    handleRowChange: (newValue: { field: string; checkbox: boolean; text?: string }) => void;
    disabled?: boolean;
}) {
    const valueForField = values.get(row.field);
    return (
        <CheckboxRow
            field={row.field}
            label={row.checkbox?.label || row.field}
            checkbox={!!valueForField?.checkbox}
            input={valueForField ? valueForField.inputValue : row.input?.defaultValue}
            handleChange={handleRowChange}
            disabled={disabled}
        />
    );
}
export default CheckboxRowWrapper;
