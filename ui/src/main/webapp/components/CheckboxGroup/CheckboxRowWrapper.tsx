import React from 'react';
import CheckboxRow from './CheckboxRow';
import { Row, ValueByField } from './checkboxGroup.utils';

function CheckboxRowWrapper({
    row,
    values,
    handleRowChange,
}: {
    row: Row;
    values: ValueByField;
    handleRowChange: (newValue: { field: string; checkbox: boolean; text?: string }) => void;
}) {
    const valueForField = values.get(row.field);
    return (
        <CheckboxRow
            field={row.field}
            label={row.checkbox?.label || row.field}
            checkbox={!!valueForField?.checkbox}
            disabled={row.checkbox?.options?.enable === false}
            text={valueForField ? valueForField.text : row.text?.defaultValue?.toString()}
            handleChange={handleRowChange}
        />
    );
}
export default CheckboxRowWrapper;
