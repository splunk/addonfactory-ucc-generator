import { AcceptableFormRecord } from '../../types/components/shareableTypes';
import { isTrue } from '../../util/considerFalseAndTruthy';
import { LABEL_FOR_DEFAULT_TABLE_CELL_VALUE } from './TableConsts';

export function isReadonlyRow(readonlyFieldId: string | undefined, row: AcceptableFormRecord) {
    return Boolean(readonlyFieldId && readonlyFieldId in row && isTrue(row[readonlyFieldId]));
}

export function getTableCellValue(
    row: AcceptableFormRecord,
    field: string,
    mapping: Record<string, string>
) {
    const isNotEmpty =
        field in row && row[field] !== null && row[field] !== undefined && row[field] !== '';

    const defaultValue = mapping?.[LABEL_FOR_DEFAULT_TABLE_CELL_VALUE];

    const mappingExists = isNotEmpty && mapping?.[String(row[field])];

    return (
        mappingExists ||
        (isNotEmpty || !defaultValue ? row[field] : mapping[LABEL_FOR_DEFAULT_TABLE_CELL_VALUE])
    );
}
