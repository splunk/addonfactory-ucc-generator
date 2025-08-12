import React from 'react';
import { AcceptableFormRecord } from '../../types/components/shareableTypes';
import { isTrue } from '../../util/considerFalseAndTruthy';
import { LABEL_FOR_DEFAULT_TABLE_CELL_VALUE } from './TableConsts';

export function isReadonlyRow(readonlyFieldId: string | undefined, row: AcceptableFormRecord) {
    return Boolean(readonlyFieldId && readonlyFieldId in row && isTrue(row[readonlyFieldId]));
}

// Helper to ensure non-primitive values are safely rendered
function stringifyValue(value: unknown): React.ReactNode {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }

    if (React.isValidElement(value)) {
        return value;
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

export function getTableCellValue(
    row: AcceptableFormRecord,
    field: string,
    mapping?: Record<string, string>
): React.ReactNode {
    const value = row[field];
    const valueIsEmpty = value === null || value === undefined || value === '';

    if (!valueIsEmpty) {
        const mappedValue = mapping?.[String(value)];
        return typeof mappedValue !== 'undefined' ? mappedValue : stringifyValue(value);
    }

    const defaultValue = mapping?.[LABEL_FOR_DEFAULT_TABLE_CELL_VALUE];
    return defaultValue || value;
}
