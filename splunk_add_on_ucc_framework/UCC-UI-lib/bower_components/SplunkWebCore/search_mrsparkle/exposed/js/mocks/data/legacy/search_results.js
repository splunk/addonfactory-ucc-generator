var BASIC_MOCK_RESULTS_ROW = {
    fields: ['field1', 'field2', 'field3'],
    rows: [
        ['foo', 1, null],
        ['bar', 2, 4],
        ['baz', 3, 6]
    ],
    init_offset: 12,
    // columns are not actually part of the data structure in the wild, but are useful for expected values in some tests
    columns: [
        ['foo', 'bar', 'baz'],
        [1, 2, 3],
        [null, 4, 6]
    ]

};

var MUTLIVALUE_MOCK_RESULTS_ROW = {
    fields: ['field1', 'field2', 'field3'],
    rows: [
        ['foo', 1, ['a', 'b', 'c']],
        ['bar', 2, ['9', 'e', 'f']],
        ['baz', 3, ['11', 'h', 'i']]
    ],
    // columns are not actually part of the data structure in the wild, but are useful for expected values in some tests
    columns: [
        ['foo', 'bar', 'baz'],
        [1, 2, 3],
        [['a', 'b', 'c'], 4, 6]
    ]

};

var SINGLE_CELL_MUTLIVALUE_MOCK_RESULTS_ROW = {
    fields: ['field1'],
    rows: [
        [['a', 'b', 'c']]
    ],
    // columns are not actually part of the data structure in the wild, but are useful for expected values in some tests
    columns: [
        [['a', 'b', 'c']]
    ]

};

var TIME_SERIES_MOCK_RESULTS_ROW = {
    fields: ['_time', 'field1', 'field2', '_span'],
    rows: [
        ['2012-08-20 01:00:00', 1, null, '1800'],
        ['2012-08-20 01:30:00', 2, 4, '1800'],
        ['2012-08-20 02:00:00', 3, 6, '1800']
    ]
};

var TIME_SERIES_WITH_MILLIS_MOCK_RESULTS_ROW = {
    fields: ['_time', 'field1', 'field2', '_span'],
    rows: [
        ['2012-08-20 01:00:00.100', 1, null, '0.100'],
        ['2012-08-20 01:30:00.200', 2, 4, '0.100'],
        ['2012-08-20 02:00:00.300', 3, 6, '0.100']
    ]
};

var MATCH_TABLE_RESULTS = {
    fields: ['_is_match', '_raw', 'not_raw'],
    rows: [
        ['1', '-- abc 123 --', '-- abc 123 --'],
        ['0', 'abc 123', '']
    ]
};

var MATCH_TABLE_RESULTS_WITH_OFFSET = {
    fields: ['_is_match', '_raw', 'not_raw', '_extracted_fields_bounds'],
    rows: [
        ['1', '-- abc 123 --', '-- abc 123 --', 'letters=3-5&numbers=7-9'],
        ['0', 'abc 123', 'letters=3-6&numbers=7-10']
    ]
};

var MATCH_TABLE_RESULTS_WITH_OFFSET_AND_REQUIRED_TEXT = {
    fields: ['_is_match', '_raw', 'not_raw', '_extracted_fields_bounds'],
    rows: [
        ['1', '-- abc 123 foo --', '-- abc 123 foo --', 'letters=3-5&numbers=7-9'],
        ['0', 'abc 123 foo', 'letters=3-6&numbers=7-10']
    ]
};