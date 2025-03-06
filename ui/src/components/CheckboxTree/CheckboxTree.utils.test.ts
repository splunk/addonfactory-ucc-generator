import { describe, expect, test } from 'vitest';
import {
    isGroupWithRows,
    getFlattenRowsWithGroups,
    getNewCheckboxValues,
    getCheckedCheckboxesCount,
    getDefaultValues,
} from './CheckboxTree.utils';
import { GroupWithRows, Row, ValueByField } from './types';

describe('isGroupWithRows', () => {
    test('should return true if the item is a group with rows', () => {
        const group: GroupWithRows = {
            label: 'Group 1',
            options: { isExpandable: true, expand: true },
            fields: ['row1'],
            rows: [],
        };
        expect(isGroupWithRows(group)).toBe(true);
    });

    test('should return false if the item is a row', () => {
        const row: Row = {
            field: 'row1',
            checkbox: { label: 'Row 1' },
        };
        expect(isGroupWithRows(row)).toBe(false);
    });
});

describe('getFlattenRowsWithGroups', () => {
    const controlOptions = {
        groups: [
            {
                label: 'Group 1',
                options: { isExpandable: true, expand: true },
                fields: ['row1', 'row2'],
            },
        ],
        rows: [
            { field: 'row1', checkbox: { label: 'Row 1' } },
            { field: 'row2', checkbox: { label: 'Row 2' } },
            { field: 'row3', checkbox: { label: 'Row 3' } },
        ],
    };

    test('should flatten rows and group rows under their respective groups', () => {
        const result = getFlattenRowsWithGroups(controlOptions);

        expect(result).toHaveLength(2);
        const group = result[0] as GroupWithRows;
        expect(isGroupWithRows(group)).toBe(true);
        expect(group.label).toBe('Group 1');
        expect(group.rows).toHaveLength(2);
        expect(group.rows[0].field).toBe('row1');
        expect(group.rows[1].field).toBe('row2');

        const row = result[1] as Row;
        expect(isGroupWithRows(row)).toBe(false);
        expect(row.field).toBe('row3');
    });

    test('should add rows directly if they do not belong to any group', () => {
        const controlOptionsWithoutGroups = {
            groups: [],
            rows: [{ field: 'row1', checkbox: { label: 'Row 1' } }],
        };
        const result = getFlattenRowsWithGroups(controlOptionsWithoutGroups);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(controlOptionsWithoutGroups.rows[0]);
    });
});

describe('getNewCheckboxValues', () => {
    test('should update the checkbox value for a given field', () => {
        const values: ValueByField = new Map([
            ['field1', { checkbox: true }],
            ['field2', { checkbox: false }],
        ]);
        const newValue = { field: 'field2', checkbox: true };
        const result = getNewCheckboxValues(values, newValue);

        expect(result.get('field1')?.checkbox).toBe(true);
        expect(result.get('field2')?.checkbox).toBe(true);
    });
});

describe('getCheckedCheckboxesCount', () => {
    test('should return the count of checked checkboxes in a group', () => {
        const group: GroupWithRows = {
            label: 'Group 1',
            options: { isExpandable: true, expand: true },
            fields: ['row1', 'row2', 'row3'],
            rows: [
                { field: 'row1', checkbox: { label: 'Row 1' } },
                { field: 'row2', checkbox: { label: 'Row 2' } },
                { field: 'row3', checkbox: { label: 'Row 3' } },
            ],
        };
        const values: ValueByField = new Map([
            ['row1', { checkbox: true }],
            ['row2', { checkbox: false }],
            ['row3', { checkbox: true }],
        ]);

        const result = getCheckedCheckboxesCount(group, values);
        expect(result).toBe(2);
    });

    test('should return 0 if no checkboxes are checked', () => {
        const group: GroupWithRows = {
            label: 'Group 1',
            options: { isExpandable: true, expand: true },
            fields: ['row1', 'row2'],
            rows: [
                { field: 'row1', checkbox: { label: 'Row 1' } },
                { field: 'row2', checkbox: { label: 'Row 2' } },
            ],
        };
        const values: ValueByField = new Map([
            ['row1', { checkbox: false }],
            ['row2', { checkbox: false }],
        ]);

        const result = getCheckedCheckboxesCount(group, values);
        expect(result).toBe(0);
    });
});

describe('getDefaultValues', () => {
    test('should return a map with default checkbox values for each row', () => {
        const rows: Row[] = [
            { field: 'row1', checkbox: { label: 'Row 1', defaultValue: true } },
            { field: 'row2', checkbox: { label: 'Row 2', defaultValue: false } },
        ];

        const result = getDefaultValues(rows);

        expect(result.get('row1')?.checkbox).toBe(true);
        expect(result.get('row2')?.checkbox).toBe(false);
    });

    test('should exclude rows without a defaultValue', () => {
        const rows: Row[] = [
            { field: 'row1', checkbox: { label: 'Row 1', defaultValue: true } },
            { field: 'row2', checkbox: { label: 'Row 2' } }, // No defaultValue
        ];

        const result = getDefaultValues(rows);

        expect(result.has('row1')).toBe(true);
        expect(result.has('row2')).toBe(false);
    });

    test('should handle an empty rows array', () => {
        const result = getDefaultValues([]);
        expect(result.size).toBe(0);
    });
});
