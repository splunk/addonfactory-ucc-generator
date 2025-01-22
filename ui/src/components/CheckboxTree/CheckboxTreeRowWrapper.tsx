import React from 'react';
import CheckboxRow from './CheckboxTreeRow';
import { Row, ValueByField } from './types';

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
            handleChange={handleRowChange}
            disabled={disabled}
        />
    );
}
export default CheckboxRowWrapper;
