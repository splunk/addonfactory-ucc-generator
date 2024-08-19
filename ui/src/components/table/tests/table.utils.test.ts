import { LABEL_FOR_DEFAULT_TABLE_CELL_VALUE } from '../TableConsts';
import { getTableCellValue } from '../table.utils';

it('should return row[field] if field exists in row and is not empty', () => {
    const row = {
        field1: 'value1',
    };
    const field = 'field1';
    const mapping = {
        [LABEL_FOR_DEFAULT_TABLE_CELL_VALUE]: 'defaultValue',
    };
    const result = getTableCellValue(row, field, mapping);
    expect(result).toBe('value1');
});

it('should return mapping[LABEL_FOR_DEFAULT_TABLE_CELL_VALUE] if field does not exist in row and defaultValue exists in mapping', () => {
    const row = {
        field2: 'value2',
    };
    const field = 'field1';
    const mapping = {
        [LABEL_FOR_DEFAULT_TABLE_CELL_VALUE]: 'defaultValue',
    };
    const result = getTableCellValue(row, field, mapping);
    expect(result).toBe('defaultValue');
});

it('should return row[field] if field exists in row and is empty but defaultValue does not exist in mapping', () => {
    const row = {
        field1: '',
    };
    const field = 'field1';
    const mapping = {};
    const result = getTableCellValue(row, field, mapping);
    expect(result).toBe('');
});

it('should return undefined if field does not exist in row and defaultValue does not exist in mapping', () => {
    const row = {
        field2: '',
    };
    const field = 'field1';
    const mapping = {};
    const result = getTableCellValue(row, field, mapping);
    expect(result).toBeUndefined();
});

it('should return correctly mapped value as field1 exists in row and its value should be mapped', () => {
    const row = {
        field1: 'someValue',
    };
    const field = 'field1';
    const mapping = {
        someValue: 'mappedValue',
    };
    const result = getTableCellValue(row, field, mapping);
    expect(result).toBe('mappedValue');
});
