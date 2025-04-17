import { parseValue, packValue } from './utils';
import { ValueByField } from './types';

describe('parseValue', () => {
    test('should return an empty map if collection is undefined', () => {
        const result = parseValue();
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    test('should return an empty map if collection is an empty string', () => {
        const result = parseValue('');
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });

    test('should parse a comma-separated string into a map', () => {
        const collection = 'field1, field2,field3';
        const result = parseValue(collection);

        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(3);
        expect(result.get('field1')).toEqual({ checkbox: true });
        expect(result.get('field2')).toEqual({ checkbox: true });
        expect(result.get('field3')).toEqual({ checkbox: true });
    });

    test('should trim whitespace from field names', () => {
        const collection = '  field1  ,  field2 ,field3  ';
        const result = parseValue(collection);

        expect(result.size).toBe(3);
        expect(result.has('field1')).toBe(true);
        expect(result.has('field2')).toBe(true);
        expect(result.has('field3')).toBe(true);
    });

    test('should split string using custom delimiter', () => {
        const collection = 'field1|field2|field3';
        const result = parseValue(collection, '|');

        expect(result.size).toBe(3);
        expect(result.has('field1')).toBe(true);
        expect(result.has('field2')).toBe(true);
        expect(result.has('field3')).toBe(true);
    });
});

describe('packValue', () => {
    test('should return an empty string if the map is empty', () => {
        const map: ValueByField = new Map();
        const result = packValue(map);
        expect(result).toBe('');
    });

    test('should return a comma-separated string for map entries with checkbox set to true', () => {
        const map: ValueByField = new Map([
            ['field1', { checkbox: true }],
            ['field2', { checkbox: true }],
            ['field3', { checkbox: true }],
        ]);
        const result = packValue(map);
        expect(result).toBe('field1,field2,field3');
    });

    test('should exclude entries with checkbox set to false', () => {
        const map: ValueByField = new Map([
            ['field1', { checkbox: true }],
            ['field2', { checkbox: false }],
            ['field3', { checkbox: true }],
        ]);
        const result = packValue(map);
        expect(result).toBe('field1,field3');
    });

    test('should handle maps with no valid checkbox entries', () => {
        const map: ValueByField = new Map([
            ['field1', { checkbox: false }],
            ['field2', { checkbox: false }],
        ]);
        const result = packValue(map);
        expect(result).toBe('');
    });

    test('should create string using custom delimiter', () => {
        const map: ValueByField = new Map([
            ['field1', { checkbox: true }],
            ['field2', { checkbox: true }],
        ]);
        const result = packValue(map, '|');
        expect(result).toBe('field1|field2');
    });
});
