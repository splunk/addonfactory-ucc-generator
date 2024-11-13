import { AcceptableFormRecord } from '../../types/components/shareableTypes';
import { isTrue } from '../../util/considerFalseAndTruthy';
import { LABEL_FOR_DEFAULT_TABLE_CELL_VALUE } from './TableConsts';

export function isReadonlyRow(readonlyFieldId: string | undefined, row: AcceptableFormRecord) {
    return Boolean(readonlyFieldId && readonlyFieldId in row && isTrue(row[readonlyFieldId]));
}

export function getTableCellValue(
    row: AcceptableFormRecord,
    field: string,
    mapping?: Record<string, string>
) {
    const value = row[field];
    const valueIsEmpty = value === null || value === undefined || value === '';
    if (!valueIsEmpty) {
        return mapping?.[String(value)] || value;
    }

    const defaultValue = mapping?.[LABEL_FOR_DEFAULT_TABLE_CELL_VALUE];
    return defaultValue || value;
}
