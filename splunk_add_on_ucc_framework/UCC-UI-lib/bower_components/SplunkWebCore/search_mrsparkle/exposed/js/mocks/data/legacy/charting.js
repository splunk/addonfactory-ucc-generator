var SINGLE_SERIES_DATA = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'b', 'c'],
        ['1', '2', '3']
    ]
};

var SINGLE_SERIES_DATA_ONE_POINT = {
    fields: ['x', 'y'],
    columns: [
        ['a'],
        ['1']
    ]
};

var SINGLE_SERIES_DATA_TEN_POINTS = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    ]
};

var SINGLE_SERIES_DATA_WITH_NULLS = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
        ['10', null, '1', '2', null, '5', null, '3', '4', null, '10']
    ]
};

var SINGLE_SERIES_DATA_THIRTY_POINTS = {
    fields: ['xxxxxxxx', 'yyyyyyyy'],
    columns: [
        ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd', 'eeeeeeeeee', 'ffffffffff', 'gggggggggg', 'hhhhhhhhhh', 'iiiiiiiiii', 'jjjjjjjjjj', 'kkkkkkkkkk', 'llllllllll', 'mmmmmmmmmm', 'nnnnnnnnnn', 'oooooooooo', 'pppppppppp', 'qqqqqqqqqq', 'rrrrrrrrrr', 'ssssssssss', 'tttttttttt', 'uuuuuuuuuu', 'vvvvvvvvvv', 'wwwwwwwwww', 'xxxxxxxxxx', 'yyyyyyyyyy', 'zzzzzzzzzz', '&&&&&&&&&&', '!!!!!!!!!!', '##########', '$$$$$$$$$$'], 
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
    ]
};

var SINGLE_SERIES_DATA_THIRTY_POINTS_WITH_ZEROS = {
    fields: ['xxxxxxxx', 'yyyyyyyy'],
    columns: [
        ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd', 'eeeeeeeeee', 'ffffffffff', 'gggggggggg', 'hhhhhhhhhh', 'iiiiiiiiii', 'jjjjjjjjjj', 'kkkkkkkkkk', 'llllllllll', 'mmmmmmmmmm', 'nnnnnnnnnn', 'oooooooooo', 'pppppppppp', 'qqqqqqqqqq', 'rrrrrrrrrr', 'ssssssssss', 'tttttttttt', 'uuuuuuuuuu', 'vvvvvvvvvv', 'wwwwwwwwww', 'xxxxxxxxxx', 'yyyyyyyyyy', 'zzzzzzzzzz', '&&&&&&&&&&', '!!!!!!!!!!', '##########', '$$$$$$$$$$'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 0, 0, 0, 0, 0, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
    ]
};

var SINGLE_SERIES_DATA_WITH_NEGATIVES = {
    'fields': [
        'thing',
        'monkey'
    ],
    'columns': [
        [
            '10',
            '20',
            '30',
            '40',
            '50',
            '60',
            '70',
            '80',
            '90',
            '100'
        ],
        [
            '2',
            '-1',
            '-10',
            '10',
            '5',
            '8',
            '7',
            '8',
            '9',
            '6'
        ]
    ]
};

var SINGLE_SERIES_DATA_ALL_NEGATIVES = {
    'fields': [
        'fish',
        'bird'
    ],
    'columns': [
        [
            '10',
            '20',
            '30',
            '40',
            '50',
            '60',
            '70',
            '80',
            '90',
            '100'
        ],
        [
            '-2',
            '-1',
            '-10',
            '-10',
            '-5',
            '-8',
            '-7',
            '-8',
            '-9',
            '-6'
        ]
    ]
};

var SINGLE_SERIES_DATA_THIRTY_POINTS_WITH_ZEROS_AND_NEGATIVES = {
    fields: ['xxxxxxxx', 'yyyyyyyy'],
    columns: [
        ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd', 'eeeeeeeeee', 'ffffffffff', 'gggggggggg', 'hhhhhhhhhh', 'iiiiiiiiii', 'jjjjjjjjjj', 'kkkkkkkkkk', 'llllllllll', 'mmmmmmmmmm', 'nnnnnnnnnn', 'oooooooooo', 'pppppppppp', 'qqqqqqqqqq', 'rrrrrrrrrr', 'ssssssssss', 'tttttttttt', 'uuuuuuuuuu', 'vvvvvvvvvv', 'wwwwwwwwww', 'xxxxxxxxxx', 'yyyyyyyyyy', 'zzzzzzzzzz', '&&&&&&&&&&', '!!!!!!!!!!', '##########', '$$$$$$$$$$'],
        [-1, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, -14, 0, 0, 0, 0, 0, 0, 21, 22, 23, 24, 25, 26, 27, 28, 29, 27]
    ]
};

var SINGLE_SERIES_DATA_ZOOM_TOOLTIP_TEST = {
    fields: ['xxxxxxxx', 'yyyyyyyy'],
    columns: [
        ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd', 'eeeeeeeeee', 'ffffffffff', 'gggggggggg', 'hhhhhhhhhh', 'iiiiiiiiii', 'jjjjjjjjjj', 'kkkkkkkkkk', 'llllllllll', 'mmmmmmmmmm', 'nnnnnnnnnn', 'oooooooooo', 'pppppppppp', 'qqqqqqqqqq', 'rrrrrrrrrr', 'ssssssssss', 'tttttttttt', 'uuuuuuuuuu', 'vvvvvvvvvv', 'wwwwwwwwww', 'xxxxxxxxxx', 'yyyyyyyyyy', 'zzzzzzzzzz', '&&&&&&&&&&', '!!!!!!!!!!', '##########', '$$$$$$$$$$'], 
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 40, 2, 1, 1, 1, 1, 1, 1, 1, 1, 50]
    ]
};

var SINGLE_SERIES_DATA_ZOOM_TOOLTIP_TEST_2 = {
    fields: ['xxxxxxxx', 'yyyyyyyy'],
    columns: [
        ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd', 'eeeeeeeeee', 'ffffffffff', 'gggggggggg', 'hhhhhhhhhh', 'iiiiiiiiii', 'jjjjjjjjjj', 'kkkkkkkkkk', 'llllllllll', 'mmmmmmmmmm', 'nnnnnnnnnn', 'oooooooooo', 'pppppppppp', 'qqqqqqqqqq', 'rrrrrrrrrr', 'ssssssssss', 'tttttttttt', 'uuuuuuuuuu', 'vvvvvvvvvv', 'wwwwwwwwww', 'xxxxxxxxxx', 'yyyyyyyyyy', 'zzzzzzzzzz', '&&&&&&&&&&', '!!!!!!!!!!', '##########', '$$$$$$$$$$'],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 50, 2, 1, 1, 1, 1, 1, 1, 1, 1, 45]
    ]
};

var SINGLE_SERIES_DATA_ZOOM_TOOLTIP_TEST_3 = {
    fields: ['xxxxxxxx', 'yyyyyyyy'],
    columns: [
        ['aaaaaaaaaa', 'bbbbbbbbbb', 'cccccccccc', 'dddddddddd', 'eeeeeeeeee', 'ffffffffff', 'gggggggggg', 'hhhhhhhhhh', 'iiiiiiiiii', 'jjjjjjjjjj', 'kkkkkkkkkk', 'llllllllll', 'mmmmmmmmmm', 'nnnnnnnnnn', 'oooooooooo', 'pppppppppp', 'qqqqqqqqqq', 'rrrrrrrrrr', 'ssssssssss', 'tttttttttt', 'uuuuuuuuuu', 'vvvvvvvvvv', 'wwwwwwwwww', 'xxxxxxxxxx', 'yyyyyyyyyy', 'zzzzzzzzzz', '&&&&&&&&&&', '!!!!!!!!!!', '##########', '$$$$$$$$$$'],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 50, 2, 1, 1, 1, 1, 1, 1, 1, 1, 40]
    ]
};

var DATA_ZOOM_OVERLAY_TEST = {
    fields: ['x', 'y', 'z'],
    columns: [
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 
        ['1', '2', '3', '4', '10', '4', '3', '2', '1', '0']
    ]
};

var LONG_VALUE_NAME = {
    fields: ['x', 'y'],
    columns: [
        ['dsfkmsdflkdsmfdpfodksfpdoskfpdsofkdspfoksdjfnsdfkjsdnfkjsdndspfodksfpdokfdpofkspodkfpdsokpsokpsfokfpsodkfpsodkfpsdofksdpofkdspfosdkfpodskfpdsofkdspofkdspofksdopfkdspfksdpfkdspof'],
        ['1']
    ]
};

var SHORT_VALUE_NAMES = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'bc', 'def', 'ghij'],
        ['1', '2', '3', '2']
    ]
};

var LONG_VALUE_NAMES = {
    fields: ['x', 'y'],
    columns: [
        ['dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk'],
        ['1', '2', '3', '2', '4', '3', '2', '1']
    ]
};

var MANY_LONG_VALUE_NAMES = {
    fields: ['x', 'y'],
    columns: [
        ['dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk',
        'dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk',
        'dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk',
        'dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk',
        'dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk',
        'dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'gdgfadfdsgfhfdjhfgjgdhgfdhgfdhgfdjhdjfdhdfghdfhfdjghgfhd', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtey', 'safdafweafxcdafdafwexvfdfeasdcxczxcrewrewrewdfdsafdf',
        'dsfasdjlsjfkdsjalfjklsajf;lksdjflkajflkjsalkfjklajlkfdjsalkfjds;la', 'sdjfkahjvkbakjlwehrjkwhjkahwjkdhjskhfjkdshfjkshakjhekhrjwew', 'skjdhaklbfkwenkrjhkwjhaklshxchsjahfdjkshfajkwhefjkhasdjkfhkjsdafk', 'saklfjwlkejralkwjrlkajslkjclkdsjflkwjrlkwjerlkajrlksjlk'],
        ['1', '2', '3', '2', '4', '3', '2', '1','1', '2', '3', '2', '4', '3', '2', '1','1', '2', '3', '2', '4', '3', '2', '1','1', '2', '3', '2', '4', '3', '2', '1','1', '2', '3', '2', '4', '3', '2', '1','1', '2', '3', '2', '4', '3', '2', '1']
    ]
};

var MIXED_VALUE_NAMES = {
    fields: ['x', 'y'],
    columns: [
        ['dfsafdsafdfdsfsafasfsadfadfsafdafsfsafadsfsafsafdsafasdfsafdsasdfdsa', 'abc', 'werwrwtrewywytreuytuyetiuytoioiuypoipoi[pooipiuyoiuoyuiryuytuetyrtedsfadsfdsafdsafdsafdsafsdafdsafdsfadsafsafdsafsdsafdsfasdfasy', 'd'],
        ['1', '2', '3', '2']
    ]
};

var LONG_SERIES_NAME = {
    fields: ['dsfkmsdflkdsmfdpfodksfpdoskfpdsofkdspfoksdjfnsdfkjsdnfkjsdndspfodksfpdokfdpofkspodkfpdsokpsokpsfokfpsodkfpsodkfpsdofksdpofkdspfosdkfpodskfpdsofkdspofkdspofksdopfkdspfksdpfkdspof', 'y'],
    columns: [
        ['h'],
        ['1']
    ]
};

var LONG_SERIES_AND_VALUE_NAME = {
    fields: ['x', 'dsfkmsdflkdsmfdpfodksfpdoskfpdsofkdspfoksdjfnsdfkjsdnfkjsdndspfodksfpdokfdpofkspodkfpdsokpsokpsfokfpsodkfpsodkfpsdofksdpofkdspfosdkfpodskfpdsofkdspofkdspofksdopfkdspfksdpfkdspof'],
    columns: [
        ['dsfkmsdflkdsmfdpfodksfpdoskfpdsofkdspfoksdjfnsdfkjsdnfkjsdndspfodksfpdokfdpofkspodkfpdsokpsokpsfokfpsodkfpsodkfpsdofksdpofkdspfosdkfpodskfpdsofkdspofkdspofksdopfkdspfksdpfkdspof'],
        ['1']
    ]
};

var EMPTY_DATA = {
    fields: [],
    columns: []
};

var SINGLE_COLUMN_DATA = {
    fields: ['x'],
    columns: [['a', 'b', 'c']]
};

var LONG_NUMERIC_LABELS = {
    fields: ['x', 'y'],
    columns: [
        ['1', '2', '3', '4', '5'],
        ['1000000', '2000000', '3000000', '4000000', '5000000']
    ]
};

var PIE_DATA_WITH_COLLAPSING = {
    fields: ['name', 'size'],
    columns: [
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
        ['1', '2', '3', '1000', '2000', '3000', '4000', '5000', '6000', '4', '5']
    ]
};

var PIE_DATA_INVALID_NUMBERS = {
    fields: ['a', 'b', 'c'],
    columns: [
        ['d', 'e', 'f'],
        ['h', 'i', 'g'],
        ['x', 'y', 'z']
    ]
};

var POSITIVE_NEGATIVE_SERIES_DATA = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'b', 'c', 'd'],
        ['2', '-3', '4', '-5']
    ]
};

var POINT_LINE_SERIES = {
    fields: ['x', 'y1', 'y2', 'y3'],
    columns: [
        ['num'],
        [1],
        [2],
        [3]
    ]
};

var LINE_MULTI_SERIES_DATA = {
    fields: ['x', 'y1', 'y2', 'y3'],
    columns: [
        ['num', 'nyan', 'nan', 'nayn'],
        [1, 2, 3, 4],
        [2, 5, 9, 10],
        [3, 13, 9, 7]
    ]
};

var SCATTER_SINGLE_SERIES_DATA = {
    fields: ['x', 'y'],
    columns: [
        ['11', '22', '33'],
        ['-1', '-2', '-3']
    ]
};

var SCATTER_SINGLE_SERIES_DATA_WITH_METADATA = {
    fields: [
        {
            name: 'marks',
            groupby_rank: 0
        },
        {
            name: 'x'
        },
        {
            name: 'y'
        }
    ],
    columns: [
        ['a', 'b', 'c'],
        ['11', '22', '33'],
        ['-1', '-2', '-3']
    ]
};

var SCATTER_MULTI_SERIES_DATA = {
    fields: ['name', 'x', 'y'],
    columns: [
        ['f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9']
    ]
};

var SCATTER_MULTI_SERIES_SMALL_NUMBERS = {
    'fields': [
        'x',
        'y',
        'z'
    ],
    'columns': [
        [
            'a',
            'b',
            'c',
            'a',
            'b',
            'b',
            'c',
            'c',
            'f'
        ],
        [
            '2',
            '-1',
            '-1',
            '4',
            '5',
            '8',
            '7',
            '8',
            '9',
            '6'
        ],
        [
            '1',
            '2',
            '5',
            '1',
            '4',
            '3.3',
            '5',
            '2'
        ]
    ]
};

var SCATTER_MULTI_SERIES_DATA_DESCENDING_X = {
    fields: ['name', 'x', 'y'],
    columns: [
        ['f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'],
        ['33', '22', '11', '66', '55', '44', '99', '88', '77'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9']
    ]
};

var SCATTER_MULTI_SERIES_DATA_SAME_X = {
    fields: ['name', 'x', 'y'],
    columns: [
        ['f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'],
        ['22', '22', '22', '55', '55', '55', '88', '88', '88'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9']
    ]
};

var SCATTER_MULTI_SERIES_DATA_WITH_METADATA = {
    fields: [
        {
            name: 'marks',
            groupby_rank: 0
        },
        {
            name: 'name'
        },
        {
            name: 'x'
        },
        {
            name: 'y'
        }
    ],
    columns: [
        ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        ['f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9']
    ]
};

var SCATTER_TWO_COLUMN_DATA_WITH_METADATA = {
    fields: [
        {
            name: 'marks',
            groupby_rank: 0
        },
        {
            name: 'x'
        }
    ],
    columns: [
        ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99']
    ]
};

var BUBBLE_THREE_SERIES_DATA_WITH_METADATA = {
    fields: [
        {
            name: 'marks',
            groupby_rank: 0
        },
        {
            name: 'x'
        },
        {
            name: 'y'
        }
    ],
    columns: [
        ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9']
    ]
};

var BUBBLE_SINGLE_SERIES_DATA = {
    fields: ['x', 'y', 'z'],
    columns: [
        ['11', '22', '33'],
        ['-1', '-2', '-3'],
        ['2', '6', '14']
    ]
};

var BUBBLE_SINGLE_SERIES_DATA_WITH_METADATA = {
    fields: [
        {
            name: 'marks',
            groupby_rank: 0
        },
        {
            name: 'x'
        },
        {
            name: 'y'
        },
        {
            name: 'z'
        }
    ],
    columns: [
        ['a', 'b', 'c'],
        ['11', '22', '33'],
        ['-1', '-2', '-3'],
        ['2', '6', '14']
    ]
};

var BUBBLE_MULTI_SERIES_DATA = {
    fields: ['name', 'x', 'y', 'z'],
    columns: [
        ['f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9'],
        ['2', '4', '6', '8', '10', '12', '14', '16', '18']
    ]
};

var BUBBLE_MULTI_SERIES_DATA_WITH_METADATA = {
    fields: [
        {
            name: 'marks',
            groupby_rank: 0
        },
        {
            name: 'name'
        },
        {
            name: 'x'
        },
        {
            name: 'y'
        },
        {
            name: 'z'
        }
    ],
    columns: [
        ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        ['f', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9'],
        ['2', '4', '6', '8', '10', '12', '14', '16', '18']
    ]
};

var SPECIAL_CHARACTERS_DATA = {
    fields: ['<"&name\'>', '<"&x\'>', '<"&y\'>'],
    columns: [
        ['<"&a\'>', '<"&b\'>', '<"&c\'>'],
        ['1', '2', '3'],
        ['7', '6', '5']
    ]
};

var TWO_SERIES_DATA = {
    fields: ['x', 'y1', 'y2'],
    columns: [
        ['q', 'r', 's'],
        ['11', '22', '33'],
        ['-1', '-2', '-3']
    ]
};

var THREE_SERIES_DATA = {
    fields: ['x', 'y1', 'y2', 'y3'],
    columns: [
        ['q', 'r', 's'],
        ['11', '22', '33'],
        ['-1', '-2', '-3'],
        ['0.5', '0.25', '0.125']
    ]
};

var TIME_SERIES_DATA = {
    fields: ['_time', 'y1', 'y2', 'y3', '_span'],
    columns: [
        ['2012-11-21T12:50:00.000-08:00', '2012-11-21T12:51:00.000-08:00', '2012-11-21T12:52:00.000-08:00'],
        ['11', '22', '33'],
        ['-1', '-2', '-3'],
        ['0.5', '0.25', '0.125'],
        ['60', '60', '60']
    ]
};

var TIME_SERIES_CROSSING_DAY_BOUNDARY = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        ['2012-11-21T23:00:00.000-08:00', '2012-11-22T00:00:00.000-08:00', '2012-11-22T01:00:00.000-08:00'],
        ['11', '22', '33'],
        ['3600', '3600', '360']
    ]
};

var TIME_SERIES_LABEL_DATA = {
    fields: ['_time', 'y1', 'y2', 'y3', '_span'],
    columns: [
        ['2012-10-31T23:00:00.000-08:00', '2012-11-01T00:00:00.000-08:00', '2012-11-01T01:00:00.000-08:00'],
        ['11', '22', '33'],
        ['-1', '-2', '-3'],
        ['0.5', '0.25', '0.125'],
        ['3600', '3600', '3600']
    ]
};

var TIME_SERIES_NINE_POINTS = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        [
            "2013-01-08T12:37:48.000-08:00","2013-01-08T12:37:49.000-08:00","2013-01-08T12:37:50.000-08:00",
            "2013-01-08T12:37:51.000-08:00","2013-01-08T12:37:52.000-08:00","2013-01-08T12:37:53.000-08:00",
            "2013-01-08T12:37:54.000-08:00","2013-01-08T12:37:55.000-08:00","2013-01-08T12:37:56.000-08:00"
        ],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['1', '1', '1', '1', '1', '1', '1', '1', '1']
    ]
};

var TIME_SERIES_WITH_TOTAL = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        [
            "2013-01-08T12:37:48.000-08:00","2013-01-08T12:37:49.000-08:00","2013-01-08T12:37:50.000-08:00",
            "2013-01-08T12:37:51.000-08:00","2013-01-08T12:37:52.000-08:00","2013-01-08T12:37:53.000-08:00",
            "2013-01-08T12:37:54.000-08:00","2013-01-08T12:37:55.000-08:00","ALL"
        ],
        ['1', '2', '3', '4', '5', '6', '7', '8', '900'],
        ['1', '1', '1', '1', '1', '1', '1', '1', '1']
    ]
};

var TIME_SERIES_ONE_POINT = {
    fields: ['_time', 'y1'],
    columns: [
        ["2013-01-08T12:37:48.000-08:00"],
        ['1']
    ]
};

var TIME_SERIES_NINE_POINTS_DAY_SPAN = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        [
            "2012-12-31T00:00:00.000-08:00","2013-01-01T00:00:00.000-08:00","2013-01-02T00:00:00.000-08:00",
            "2013-01-03T00:00:00.000-08:00","2013-01-04T00:00:00.000-08:00","2013-01-05T00:00:00.000-08:00",
            "2013-01-06T00:00:00.000-08:00","2013-01-07T00:00:00.000-08:00","2013-01-08T00:00:00.000-08:00"
        ],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400']
    ]
};

var TIME_SERIES_THIRTEEN_POINTS_DAY_SPAN = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        [
            "2012-12-31T00:00:00.000-08:00","2013-01-01T00:00:00.000-08:00","2013-01-02T00:00:00.000-08:00",
            "2013-01-03T00:00:00.000-08:00","2013-01-04T00:00:00.000-08:00","2013-01-05T00:00:00.000-08:00",
            "2013-01-06T00:00:00.000-08:00","2013-01-07T00:00:00.000-08:00","2013-01-08T00:00:00.000-08:00",
            "2013-01-09T00:00:00.000-08:00","2013-01-10T00:00:00.000-08:00","2013-01-11T00:00:00.000-08:00",
            "2013-01-12T00:00:00.000-08:00"
        ],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        ['86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400']
    ]
};

var TIME_SERIES_NINE_POINTS_COLLAPSING = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        [
            "2012-12-31T00:00:00.000-08:00","2013-01-01T00:00:00.000-08:00","2013-01-02T00:00:00.000-08:00",
            "2013-01-03T00:00:00.000-08:00","2013-01-04T00:00:00.000-08:00","2013-01-05T00:00:00.000-08:00",
            "2013-01-06T00:00:00.000-08:00","2013-01-07T00:00:00.000-08:00","2013-01-08T00:00:00.000-08:00",
            "2013-01-09T00:00:00.000-08:00","2013-01-10T00:00:00.000-08:00"
        ],
        ['1', '2', '3', '4', '5', '600', '7', '8', '9', '1000', '11'],
        ['86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400', '86400']
    ]
};

var TIME_SERIES_NINE_POINTS_TWO_DAY_SPAN = {
    fields: ['_time', 'y1', '_span'],
    columns: [
        [
            "2013-01-01T00:00:00.000-08:00","2013-01-03T00:00:00.000-08:00","2013-01-05T00:00:00.000-08:00",
            "2013-01-07T00:00:00.000-08:00","2013-01-09T00:00:00.000-08:00","2013-01-11T00:00:00.000-08:00",
            "2013-01-13T00:00:00.000-08:00","2013-01-15T00:00:00.000-08:00","2013-01-17T00:00:00.000-08:00"
        ],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        ['172800', '172800', '172800', '172800', '172800', '172800', '172800', '172800', '172800']
    ]
};

var TIME_SERIES_WITH_NULLS = {
    "fields": [
        "_time",
        "bytes",
        "_span"
    ],
    "columns": [
        [
            "2013-11-25T15:59:50.000-08:00", "2013-11-25T16:00:00.000-08:00", "2013-11-25T16:00:10.000-08:00",
            "2013-11-25T16:00:20.000-08:00", "2013-11-25T16:00:30.000-08:00", "2013-11-25T16:00:40.000-08:00" ],
        [ "10000", "136", "", "5", "787709", "20000" ],
        [ "10", "10", "10", "10", "10", "10" ]
    ]
};

var TIME_SERIES_48_POINTS = {
     "fields": ["_time", "Count of HTTP_Request", "_span"],
    "columns": [
        [
            "2011-08-20T00:00:00.000-07:00",
            "2011-08-20T00:30:00.000-07:00",
            "2011-08-20T01:00:00.000-07:00",
            "2011-08-20T01:30:00.000-07:00",
            "2011-08-20T02:00:00.000-07:00",
            "2011-08-20T02:30:00.000-07:00",
            "2011-08-20T03:00:00.000-07:00",
            "2011-08-20T03:30:00.000-07:00",
            "2011-08-20T04:00:00.000-07:00",
            "2011-08-20T04:30:00.000-07:00",
            "2011-08-20T05:00:00.000-07:00",
            "2011-08-20T05:30:00.000-07:00",
            "2011-08-20T06:00:00.000-07:00",
            "2011-08-20T06:30:00.000-07:00",
            "2011-08-20T07:00:00.000-07:00",
            "2011-08-20T07:30:00.000-07:00",
            "2011-08-20T08:00:00.000-07:00",
            "2011-08-20T08:30:00.000-07:00",
            "2011-08-20T09:00:00.000-07:00",
            "2011-08-20T09:30:00.000-07:00",
            "2011-08-20T10:00:00.000-07:00",
            "2011-08-20T10:30:00.000-07:00",
            "2011-08-20T11:00:00.000-07:00",
            "2011-08-20T11:30:00.000-07:00",
            "2011-08-20T12:00:00.000-07:00",
            "2011-08-20T12:30:00.000-07:00",
            "2011-08-20T13:00:00.000-07:00",
            "2011-08-20T13:30:00.000-07:00",
            "2011-08-20T14:00:00.000-07:00",
            "2011-08-20T14:30:00.000-07:00",
            "2011-08-20T15:00:00.000-07:00",
            "2011-08-20T15:30:00.000-07:00",
            "2011-08-20T16:00:00.000-07:00",
            "2011-08-20T16:30:00.000-07:00",
            "2011-08-20T17:00:00.000-07:00",
            "2011-08-20T17:30:00.000-07:00",
            "2011-08-20T18:00:00.000-07:00",
            "2011-08-20T18:30:00.000-07:00",
            "2011-08-20T19:00:00.000-07:00",
            "2011-08-20T19:30:00.000-07:00",
            "2011-08-20T20:00:00.000-07:00",
            "2011-08-20T20:30:00.000-07:00",
            "2011-08-20T21:00:00.000-07:00",
            "2011-08-20T21:30:00.000-07:00",
            "2011-08-20T22:00:00.000-07:00",
            "2011-08-20T22:30:00.000-07:00",
            "2011-08-20T23:00:00.000-07:00",
            "2011-08-20T23:30:00.000-07:00"
        ],
        [
            "36",
            "36",
            "40",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "36",
            "28",
            "36",
            "90",
            "175",
            "254",
            "148",
            "98",
            "231",
            "251",
            "344",
            "259",
            "137",
            "145",
            "155",
            "319",
            "226",
            "166",
            "231",
            "54",
            "36",
            "68",
            "36",
            "170",
            "258",
            "36",
            "36",
            "167",
            "109",
            "36",
            "40",
            "36"
        ],
        [
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800"
        ]
    ]
};

var RANGE_SERIES_DATA = {
    fields: ['x', 'count', 'lower', 'predicted', 'upper', '_lowercount', '_predictedcount', '_uppercount'],
    columns: [
        ['a', 'b', 'c', 'd'],
        ['10', '15', '20', '25'],
        ['7', '8', '9', '10'],
        ['11', '14', '21', '25'],
        ['22', '23', '24', '26'],
        ['lower', 'lower', 'lower', 'lower'],
        ['predicted', 'predicted', 'predicted', 'predicted'],
        ['upper', 'upper', 'upper', 'upper']
    ]
};

var DOUBLE_RANGE_SERIES_DATA = {
    fields: ['x', 'foo', 'bar', 'lower_foo', 'predicted_foo', 'upper_foo',
             'lower_bar', 'predicted_bar', 'upper_bar', '_lowerfoo',
             '_predictedfoo', '_upperfoo', '_lowerbar', '_predictedbar', '_upperbar'],
    columns: [
        // x
        ['a', 'b', 'c', 'd'],
        // foo
        ['15', '16', '14', '18'],
        // bar
        ['28', '24', '26', '25'],
        // foo lower/predicted/upper
        ['11', '14', '13', '15'],
        ['16', '15', '14', '16'],
        ['17', '17', '16', '19'],
        // bar lower/predicted/upper
        ['25', '23', '24', '21'],
        ['26', '24', '25', '26'],
        ['29', '26', '27', '27'],
        // _lowerfoo/_predictedfoo/_upperfoo
        ['lower_foo', 'lower_foo', 'lower_foo', 'lower_foo'],
        ['predicted_foo', 'predicted_foo', 'predicted_foo', 'predicted_foo'],
        ['upper_foo', 'upper_foo', 'upper_foo', 'upper_foo'],
        // _lowerbar/_predictedbar/_upperbar
        ['lower_bar', 'lower_bar', 'lower_bar', 'lower_bar'],
        ['predicted_bar', 'predicted_bar', 'predicted_bar', 'predicted_bar'],
        ['upper_bar', 'upper_bar', 'upper_bar', 'upper_bar']
    ]
};

var LONG_AXIS_LABEL_DATA = {
    fields: ['x', 'y'],
    columns: [
        [
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
        ],
        ['1', '2', '3']
    ]
};

var MANY_AXIS_LABEL_DATA = {
    fields: ['x', 'y'],
    columns: [
        [
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            'ccccccccccccccccccccccccccccccccccccccc',
            'ddddddddddddddddddddddddddddddddddddddd',
            'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            'fffffffffffffffffffffffffffffffffffffff',
            'ggggggggggggggggggggggggggggggggggggggg',
            'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
            'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii',
            'jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj',
            'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
            'lllllllllllllllllllllllllllllllllllllll',
            'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
            'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
            'ooooooooooooooooooooooooooooooooooooooo',
            'ppppppppppppppppppppppppppppppppppppppp',
            'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
            'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
            'sssssssssssssssssssssssssssssssssssssss',
            'ttttttttttttttttttttttttttttttttttttttt',
            'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
            'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv',
            'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
            'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
        ],
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26']
    ]
};

var MANY_AXIS_SHORT_LABEL_DATA = {
    "fields": [
        "date_second",
        "count",
        "percent",
        "_tc"
    ],
    "columns": [
        [
            "52",
            "42",
            "53",
            "25",
            "38",
            "48",
            "26",
            "1",
            "34",
            "47",
            "54",
            "46",
            "50",
            "14",
            "39",
            "51",
            "28",
            "27",
            "40",
            "49",
            "15",
            "41",
            "8",
            "2",
            "29",
            "5",
            "44",
            "37",
            "24",
            "13",
            "3",
            "19",
            "7",
            "17",
            "32",
            "21",
            "36",
            "55",
            "30",
            "43",
            "9",
            "45",
            "12",
            "23",
            "59",
            "22",
            "31",
            "20",
            "57",
            "11",
            "58",
            "35",
            "0",
            "56",
            "16",
            "4",
            "33",
            "18",
            "10",
            "6"
        ],
        [
            "440",
            "389",
            "381",
            "369",
            "360",
            "344",
            "337",
            "326",
            "318",
            "312",
            "307",
            "299",
            "294",
            "271",
            "267",
            "265",
            "251",
            "249",
            "245",
            "237",
            "233",
            "210",
            "202",
            "188",
            "157",
            "154",
            "150",
            "147",
            "144",
            "128",
            "125",
            "124",
            "118",
            "117",
            "115",
            "115",
            "111",
            "105",
            "93",
            "69",
            "63",
            "63",
            "63",
            "62",
            "61",
            "61",
            "60",
            "60",
            "59",
            "59",
            "58",
            "56",
            "56",
            "54",
            "34",
            "30",
            "19",
            "6",
            "6",
            "4"
        ],
        [
            "4.400000",
            "3.890000",
            "3.810000",
            "3.690000",
            "3.600000",
            "3.440000",
            "3.370000",
            "3.260000",
            "3.180000",
            "3.120000",
            "3.070000",
            "2.990000",
            "2.940000",
            "2.710000",
            "2.670000",
            "2.650000",
            "2.510000",
            "2.490000",
            "2.450000",
            "2.370000",
            "2.330000",
            "2.100000",
            "2.020000",
            "1.880000",
            "1.570000",
            "1.540000",
            "1.500000",
            "1.470000",
            "1.440000",
            "1.280000",
            "1.250000",
            "1.240000",
            "1.180000",
            "1.170000",
            "1.150000",
            "1.150000",
            "1.110000",
            "1.050000",
            "0.930000",
            "0.690000",
            "0.630000",
            "0.630000",
            "0.630000",
            "0.620000",
            "0.610000",
            "0.610000",
            "0.600000",
            "0.600000",
            "0.590000",
            "0.590000",
            "0.580000",
            "0.560000",
            "0.560000",
            "0.540000",
            "0.340000",
            "0.300000",
            "0.190000",
            "0.060000",
            "0.060000",
            "0.040000"
        ],
        [
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000",
            "10000"
        ]
    ]
};

var LONG_FIELD_NAME_DATA = {
    fields: [
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
        'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
        'ssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss'
    ],
    columns: [
        ['a', 'b', 'c'],
        ['1', '3', '5'],
        ['2', '4', '6'],
        ['10', '10', '10']
    ]
};

var TWENTY_FIELDS_DATA = {
    fields: ['x', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'],
    columns: [
        ['A', 'B', 'C'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3'],
        ['1', '2', '3']
    ]
};

var PIE_DATA = {
    fields: ['name', 'x', 'y'],
    columns: [
        ['a', 'b', 'f', 'c', 'd', 'g', 'e', 'i', 'h'],
        ['11', '22', '33', '44', '55', '66', '77', '88', '99'],
        ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9']
    ]
};

var PIE_DATA_HORIZ_LABELS = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'b'],
        ['5', '5']
    ]
};

var PIE_DATA_VERT_LABELS = {
    fields: ['x', 'y'],
    columns: [
        ['a', 'b', 'c', 'd'],
        ['1', '300', '300', '300']
    ]
};

var XSS_ATTACK_LABELS = {
    "fields": [
        {
           "name": "label"
        },
        {
            "name": "count",
            "type_special": "count"
        },
        {
            "name": "percent",
            "type_special": "percent"
        },
        {
            "name": "_tc"
        }
    ],
    "columns": [
        [
            "/home/joe/data/spritzer_f0_2012-05-11.log.gz",
            "web",
            "<a href=\"javascript:window.hacked=true\" rel=\"nofollow\">Twitter for iPhone</a>",
            "<a href=\"http://blackberry.com/twitter\" rel=\"nofollow\">Twitter for BlackBerry®</a>",
            "<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>",
            "<a href=\"http://ubersocial.com\" rel=\"nofollow\">UberSocial for BlackBerry</a>",
            "<a href=\"http://mobile.twitter.com\" rel=\"nofollow\">Mobile Web</a>",
            "<a href=\"http://www.echofon.com/\" rel=\"nofollow\">Echofon</a>",
            "<a href=\"http://www.tweetdeck.com\" rel=\"nofollow\">TweetDeck</a>",
            "<a href=\"http://twitterfeed.com\" rel=\"nofollow\">twitterfeed</a>"
        ],
        [
            "25299",
            "6418",
            "3570",
            "2527",
            "2474",
            "794",
            "741",
            "557",
            "486",
            "373"
        ],
        [
            "100.000000",
            "25.368592",
            "14.111230",
            "9.988537",
            "9.779043",
            "3.138464",
            "2.928970",
            "2.201668",
            "1.921025",
            "1.474367"
        ],
        [
            "25299",
            "25299",
            "25299",
            "25299",
            "25299",
            "25299",
            "25299",
            "25299",
            "25299",
            "25299"
        ]
    ]
};

var SMALL_NUMBERS = {
    "fields": [
        "x",
        "y"
    ],
    "columns": [
        [
            "a",
            "b",
            "c"
        ],
        [
            "0.0000039",
            "0.0000048",
            "0.00000375"
        ]
    ]
};

var VERY_SMALL_NUMBERS = {
    "fields": [
        "x",
        "y"
    ],
    "columns": [
        [
            "a",
            "b",
            "c"
        ],
        [
            "0.00000039",
            "0.00000048",
            "0.000000375"
        ]
    ]
};

var MISSING_FIELD_NAME_DATA = {
    "fields": [
        {
            "name": "email"
        },
        {
            "name": "price"
        },
        {
            "name": "product_id"
        },
        {
            "name": "product_name"
        },
        {
            "name": "product_type"
        }
    ],
    "columns": [
        [
            "splunk250@gmail.com",
            "splunk250@yahoo.com",
            "wedw@asd.com",
            "splunk250@hotmail.com",
            null,
            null,
            "xd@2312.ru",
            "yd@2312.ru",
            "splunk250@gmail.com",
            "splunk250@yahoo.com"
        ],
        [
            "29",
            "59",
            "49",
            "79",
            "59",
            "99",
            "89",
            "39",
            "59",
            "99"
        ],
        [
            "AV-CB-01",
            "AV-SB-02",
            "FL-DSH-01",
            "FL-DLH-02",
            "K9-BD-01",
            "K9-CW-01",
            "FI-SW-01",
            "FI-FW-02",
            "RP-LI-02",
            "RP-SN-01"
        ],
        [
            "Birthday Wishes Balloons",
            "Calla Lilies Bouquet",
            "Dreams of Lavender Bouquet",
            "Gardenia Bonsai Plant",
            "Vibrant Countryside Bouquet",
            "Beloved's Embrace Bouquet",
            "Tea & Spa Gift Set",
            "Bountiful Fruit Basket",
            "Decadent Chocolate Assortment",
            "Fragrant Jasmine Plant"
        ],
        [
            "BALLOONS",
            "FLOWERS",
            "FLOWERS",
            "PLANTS",
            "FLOWERS",
            "FLOWERS",
            "GIFTS",
            "GIFTS",
            "CANDY",
            "PLANTS"
        ]
    ]
};

var SPL_83179 = {
    "fields": [
        {
            "name": "bytes",
            "groupby_rank": "0"
        },
        {
            "name": "count"
        }
    ],
    "columns": [
        [
            "-",
            "0",
            "1030",
            "1062",
            "1096",
            "113972",
            "1149",
            "1153",
            "126",
            "1294",
            "1412",
            "1414",
            "1415",
            "1416",
            "1484",
            "17075",
            "1727",
            "1729",
            "1730",
            "1748",
            "1751",
            "1755",
            "1756",
            "1759",
            "1760",
            "1763",
            "1765",
            "1802",
            "1810",
            "1831",
            "1841",
            "1843",
            "199",
            "2023",
            "25204",
            "258",
            "260",
            "2683",
            "27",
            "2813",
            "2910",
            "323",
            "331",
            "354",
            "3568",
            "3569",
            "3669",
            "3674",
            "3735",
            "3891",
            "39",
            "40",
            "427",
            "46192",
            "4673",
            "47",
            "496",
            "524",
            "55",
            "59",
            "60",
            "604",
            "61",
            "624",
            "6402",
            "644",
            "6586",
            "6835",
            "6837",
            "6842",
            "6843",
            "689",
            "69",
            "6920",
            "7014",
            "73",
            "7326",
            "746",
            "7656",
            "7731",
            "77748",
            "7783",
            "79",
            "82",
            "847",
            "862",
            "864",
            "87",
            "91",
            "95",
            "973"
        ],
        [
            "1000",
            "1000",
            "1000",
            null,
            "-1",
            null,
            "-1",
            null,
            null,
            "1000",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "2000",
            null,
            null,
            null,
            null,
            "1000",
            null,
            "1000",
            null,
            "1000",
            "1000",
            null,
            null,
            null,
            "1000",
            "-1",
            null,
            null,
            null,
            "100",
            "20",
            "20",
            null,
            null,
            null,
            "-1",
            "1000",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "-1",
            "1000",
            null,
            null,
            null,
            "-1",
            null,
            "120",
            "0",
            null,
            null,
            null,
            null,
            null,
            null,
            "20",
            null,
            null,
            "-1",
            null,
            "2000",
            "-1",
            "1000",
            "1000",
            "0",
            "1000",
            null,
            "2000",
            null,
            null,
            null,
            "2000",
            "40",
            "40",
            null
        ]
    ]
};

var SPL_77620 = {
    "fields": [
        "_time",
        "_span",
        "scheduler",
        "splunk_python",
        "splunk_web_access",
        "splunk_web_service",
        "splunkd"
    ],
    "columns": [
        [
            "2013-12-12T16:30:00.000-08:00",
            "2013-12-12T17:00:00.000-08:00",
            "2013-12-12T17:30:00.000-08:00",
            "2013-12-12T18:00:00.000-08:00",
            "2013-12-12T18:30:00.000-08:00",
            "2013-12-12T19:00:00.000-08:00",
            "2013-12-12T19:30:00.000-08:00",
            "2013-12-12T20:00:00.000-08:00",
            "2013-12-12T20:30:00.000-08:00",
            "2013-12-12T21:00:00.000-08:00",
            "2013-12-12T21:30:00.000-08:00",
            "2013-12-12T22:00:00.000-08:00",
            "2013-12-12T22:30:00.000-08:00",
            "2013-12-12T23:00:00.000-08:00",
            "2013-12-12T23:30:00.000-08:00",
            "2013-12-13T00:00:00.000-08:00",
            "2013-12-13T00:30:00.000-08:00",
            "2013-12-13T01:00:00.000-08:00",
            "2013-12-13T01:30:00.000-08:00",
            "2013-12-13T02:00:00.000-08:00",
            "2013-12-13T02:30:00.000-08:00",
            "2013-12-13T03:00:00.000-08:00",
            "2013-12-13T03:30:00.000-08:00",
            "2013-12-13T04:00:00.000-08:00",
            "2013-12-13T04:30:00.000-08:00",
            "2013-12-13T05:00:00.000-08:00",
            "2013-12-13T05:30:00.000-08:00",
            "2013-12-13T06:00:00.000-08:00",
            "2013-12-13T06:30:00.000-08:00",
            "2013-12-13T07:00:00.000-08:00",
            "2013-12-13T07:30:00.000-08:00",
            "2013-12-13T08:00:00.000-08:00",
            "2013-12-13T08:30:00.000-08:00",
            "2013-12-13T09:00:00.000-08:00",
            "2013-12-13T09:30:00.000-08:00",
            "2013-12-13T10:00:00.000-08:00",
            "2013-12-13T10:30:00.000-08:00",
            "2013-12-13T11:00:00.000-08:00",
            "2013-12-13T11:30:00.000-08:00",
            "2013-12-13T12:00:00.000-08:00",
            "2013-12-13T12:30:00.000-08:00",
            "2013-12-13T13:00:00.000-08:00",
            "2013-12-13T13:30:00.000-08:00"
        ],
        [
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800",
            "1800"
        ],
        [
            "34",
            "60",
            "0",
            "24",
            "60",
            "4",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "8",
            "60",
            "60",
            "60",
            "60",
            "60",
            "60",
            "60",
            "60",
            "60",
            "60",
            "32"
        ],
        [
            "36",
            "61",
            "0",
            "25",
            "61",
            "3",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "6",
            "61",
            "60",
            "61",
            "61",
            "61",
            "61",
            "61",
            "61",
            "61",
            "61",
            "32"
        ],
        [
            "2220",
            "517",
            "0",
            "6710",
            "7713",
            "764",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "946",
            "7109",
            "1821",
            "788",
            "301",
            "301",
            "336",
            "914",
            "0",
            "2591",
            "0",
            "610"
        ],
        [
            "0",
            "10",
            "0",
            "146",
            "148",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "161",
            "143",
            "304",
            "3",
            "0",
            "0",
            "0",
            "0",
            "0",
            "5",
            "0",
            "136"
        ],
        [
            "2124",
            "3590",
            "45",
            "1775",
            "3733",
            "195",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "629",
            "3721",
            "3888",
            "3622",
            "3621",
            "3621",
            "3624",
            "3583",
            "3467",
            "3538",
            "3471",
            "1865"
        ]
    ]
};

var SPL_91116 = {
    "fields": [
        "_time",
        "SnapshotSpace",
        "_span"
    ],
    "columns": [
        [
            "2014-09-22T07:10:00.000-07:00",
            "2014-09-22T07:20:00.000-07:00",
            "2014-09-22T07:30:00.000-07:00",
            "2014-09-22T07:40:00.000-07:00",
            "2014-09-22T07:50:00.000-07:00",
            "2014-09-22T08:00:00.000-07:00",
            "2014-09-22T08:10:00.000-07:00",
            "2014-09-22T08:20:00.000-07:00",
            "2014-09-22T08:30:00.000-07:00",
            "2014-09-22T08:40:00.000-07:00",
            "2014-09-22T08:50:00.000-07:00",
            "2014-09-22T09:00:00.000-07:00",
            "2014-09-22T09:10:00.000-07:00",
            "2014-09-22T09:20:00.000-07:00",
            "2014-09-22T09:30:00.000-07:00",
            "2014-09-22T09:40:00.000-07:00",
            "2014-09-22T09:50:00.000-07:00",
            "2014-09-22T10:00:00.000-07:00",
            "2014-09-22T10:10:00.000-07:00",
            "2014-09-22T10:20:00.000-07:00",
            "2014-09-22T10:30:00.000-07:00",
            "2014-09-22T10:40:00.000-07:00",
            "2014-09-22T10:50:00.000-07:00",
            "2014-09-22T11:00:00.000-07:00",
            "2014-09-22T11:10:00.000-07:00"
        ],
        [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "4291225088",
            "4291225088",
            "4291225088",
            "4291225088",
            "4291225088",
            "4291225088",
            "4291225088",
            "4291225088",
            "4291225088",
            null
        ],
        [
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600",
            "600"
        ]
    ]
};