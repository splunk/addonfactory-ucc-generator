import {
    getFlattenRowsWithGroups,
    getNewCheckboxValues,
    Group,
    GroupWithRows,
    packValue,
    parseValue,
    Row,
    ValueByField,
} from './checkboxGroup.utils';

jest.mock('../../util/Validator');

describe('parseValue', () => {
    it('should correctly parse a collection string into a Map', () => {
        const collection = 'collect_collaboration/1200,collect_file/1,collect_task/1';
        const resultMap = parseValue(collection);

        expect(resultMap.size).toBe(3);
        expect(resultMap.get('collect_collaboration')?.text).toBe('1200');
        expect(resultMap.get('collect_collaboration')?.checkbox).toBeTruthy();
        expect(resultMap.get('collect_file')?.text).toBe('1');
        expect(resultMap.get('collect_task')?.text).toBe('1');
    });
    it('should return an empty Map for undefined collection', () => {
        const resultMap = parseValue();
        expect(resultMap.size).toBe(0);
    });

    it('should throw an error for invalid collection format', () => {
        const collection = '/field1,text2/field2';
        expect(() => parseValue(collection)).toThrow('Value is not parsable: /field1,text2/field2');
    });
});

describe('packValue', () => {
    it('should return a comma-separated string of field/text pairs where checkbox is true', () => {
        const testMap = new Map();
        testMap.set('collect_collaboration', { checkbox: true, text: '1200' });
        testMap.set('collect_file', { checkbox: true, text: '1' });
        testMap.set('collect_task', { checkbox: true, text: '1' });
        testMap.set('field4', { checkbox: false, text: '1' });

        const result = packValue(testMap);
        expect(result).toBe('collect_collaboration/1200,collect_file/1,collect_task/1');
    });

    it('should return an empty string if no entries have checkbox set to true', () => {
        const testMap = new Map();
        testMap.set('field1', { checkbox: false, text: 'text1' });
        testMap.set('field2', { checkbox: false, text: 'text2' });

        const result = packValue(testMap);
        expect(result).toBe('');
    });

    it('should return an empty string if the map is empty', () => {
        const testMap = new Map();
        const result = packValue(testMap);
        expect(result).toBe('');
    });

    it('parsed value should be the same as packed value', () => {
        const packedValue =
            'collect_collaboration/1200,collect_file/1,collect_task/1,fieldWithoutValue/';
        expect(packValue(parseValue(packedValue))).toBe(packedValue);
    });
});

describe('getFlattenRowsWithGroups', () => {
    let sampleGroups: Group[];
    let sampleRows: Row[];

    beforeEach(() => {
        sampleGroups = [
            {
                label: 'Group1',
                fields: ['field1', 'field2'],
                options: {
                    isExpandable: true,
                },
            },
            {
                label: 'Group2',
                fields: ['field4'],
                options: {
                    isExpandable: false,
                },
            },
        ];

        sampleRows = [
            {
                field: 'field1',
                checkbox: {
                    label: 'Checkbox1',
                },
                text: {
                    defaultValue: 'value1',
                    required: true,
                },
            },
            {
                field: 'field2',
                checkbox: {
                    label: 'Checkbox2',
                },
                text: {
                    defaultValue: 'value2',
                    required: false,
                },
            },
            {
                field: 'field3',
                checkbox: {
                    label: 'Checkbox3',
                },
                text: {
                    defaultValue: 'value3',
                    required: true,
                },
            },
            {
                field: 'field4',
                checkbox: {
                    label: 'Checkbox4',
                },
                text: {
                    defaultValue: 'value4',
                    required: false,
                },
            },
        ];
    });

    it('should group rows under their respective groups and append ungrouped rows', () => {
        const result = getFlattenRowsWithGroups({ groups: sampleGroups, rows: sampleRows });

        expect(result.length).toBe(3); // 2 groups + 1 ungrouped row

        const group1 = result[0] as GroupWithRows;
        expect(group1.label).toBe('Group1');
        expect(group1.rows.length).toBe(2);
        expect(group1.rows[0].field).toBe('field1');
        expect(group1.rows[1].field).toBe('field2');

        const ungroupedRow = result[1] as Row;
        expect(ungroupedRow.field).toBe('field3');

        const group2 = result[2] as GroupWithRows;
        expect(group2.label).toBe('Group2');
        expect(group2.rows.length).toBe(1);
        expect(group2.rows[0].field).toBe('field4');
    });
});

describe('getNewCheckboxValues function', () => {
    it('should update the checkbox value for an existing field', () => {
        const initialValues: ValueByField = new Map([
            ['field1', { checkbox: true, text: 'text1' }],
        ]);
        const newValue = { field: 'field1', checkbox: false, text: 'newText1' };

        const result = getNewCheckboxValues(initialValues, newValue);
        expect(result.get('field1')).toEqual({ checkbox: false, text: 'newText1' });
    });

    it('should add a new field with checkbox and text values', () => {
        const initialValues: ValueByField = new Map();
        const newValue = { field: 'field2', checkbox: true, text: 'text2' };

        const result = getNewCheckboxValues(initialValues, newValue);
        expect(result.get('field2')).toEqual({ checkbox: true, text: 'text2' });
    });

    it('should set text to an empty string if not provided', () => {
        const initialValues: ValueByField = new Map();
        const newValue = { field: 'field3', checkbox: true };

        const result = getNewCheckboxValues(initialValues, newValue);
        expect(result.get('field3')).toEqual({ checkbox: true, text: '' });
    });
});
