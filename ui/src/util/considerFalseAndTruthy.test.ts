import { isFalse, isTrue, getValueMapTruthyFalse } from './considerFalseAndTruthy';

describe('isFalse function', () => {
    test.each([
        [null, true],
        [undefined, true],
        ['0', true],
        ['FALSE', true],
        ['F', true],
        ['N', true],
        ['NO', true],
        ['NONE', true],
        ['nOnE', true],
        ['', true],
        [0, true],
        [false, true],
        ['1', false],
        ['TRUE', false],
        [1, false],
        [true, false],
        ['random string', false],
        [{}, false],
        [[], true],
    ])('isFalse(%p) should return %p', (input, expected) => {
        expect(isFalse(input)).toBe(expected);
    });
});

describe('isTrue function', () => {
    test.each([
        [null, false],
        [undefined, false],
        ['1', true],
        ['TRUE', true],
        ['tRuE', true],
        ['T', true],
        ['Y', true],
        ['YES', true],
        [1, true],
        [true, true],
        ['0', false],
        ['FALSE', false],
        [0, false],
        [false, false],
        ['random string', false],
        [{}, false],
        [[], false],
    ])('isTrue(%p) should return %p', (input, expected) => {
        expect(isTrue(input)).toBe(expected);
    });
});

describe('getValueMapTruthyFalse function', () => {
    test.each([
        [null, '0'],
        [undefined, '0'],
        ['0', '0'],
        ['FALSE', '0'],
        ['F', '0'],
        ['N', '0'],
        ['NO', '0'],
        ['NONE', '0'],
        ['', '0'],
        ['1', '1'],
        ['TRUE', '1'],
        ['T', '1'],
        ['Y', '1'],
        ['YES', '1'],
        ['random string', 'random string'],
        [1, '1'],
        [0, '0'],
        [123, 123],
        [true, '1'],
        [false, '0'],
        [{}, {}],
        [[], '0'],
    ])('getValueMapTruthyFalse(%p) should return %p', (input, expected) => {
        expect(getValueMapTruthyFalse(input, 'configuration')).toEqual(expected);
        expect(getValueMapTruthyFalse(input, 'inputs')).toEqual(input);
    });
});
