import { HttpResponse, http } from 'msw';

export const ROW_DATA = [
    {
        name: 'aaaaaaTestName',
        content: {
            account_multiple_select: 'one',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'a',
            token: '******',
            username: 'aaaaaaTestUsername',
        },
    },
    {
        name: 'aaaaaaaTestName',
        content: {
            account_multiple_select: 'one',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'ab',
            token: '******',
            username: 'aaaaaaaTestUsername2',
        },
    },
    {
        name: 'bbbb',
        content: {
            account_multiple_select: 'one',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'abc',
            token: '******',
            username: 'aaaaaausername',
        },
    },
    {
        name: 'ccc',
        content: {
            account_multiple_select: 'one',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'abcd',
            token: '******',
            username: 'cccusername',
        },
    },
    {
        name: 'ddddd',
        content: {
            account_multiple_select: 'two',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'ab',
            token: '******',
            username: 'dddddusername',
        },
    },
    {
        name: 'test1',
        content: {
            account_multiple_select: 'two',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'aaaaa',
            token: '******',
            username: 'test1username',
        },
    },
    {
        name: 'test2',
        content: {
            account_multiple_select: 'two_multiple_select',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: false,
            password: '******',
            custom_text: 'two',
            token: '******',
            username: 'test1username',
        },
    },
    {
        name: 'testsomethingelseName2',
        content: {
            account_multiple_select: 'two_multiple_select',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: true,
            password: '******',
            custom_text: 'testsomethingelsecustomtext2',
            token: '******',
            username: 'test1username',
        },
    },
    {
        name: 'zzzzzzz',
        content: {
            account_multiple_select: 'one',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: true,
            password: '******',
            custom_text: '222222',
            token: '******',
            username: 'zzzzzusername',
        },
    },
];

export const ROW_DATA_FOR_COUNT = [
    ...ROW_DATA,
    {
        name: 'testsomethingelseName3',
        content: {
            account_multiple_select: 'two_multiple_select',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: true,
            password: '******',
            custom_text: 'testsomethingelsecustomtext3',
            token: '******',
            username: 'test1username3',
        },
    },
    {
        name: 'zzzzzzzz',
        content: {
            account_multiple_select: 'one',
            account_radio: '1',
            auth_type: 'basic',
            custom_endpoint: 'login.example.com',
            disabled: true,
            password: '******',
            custom_text: '222222',
            token: '******',
            username: 'zzzzzusername',
        },
    },
];

export const MockRowData = {
    links: {
        create: `/servicesNS/nobody/-/splunk_ta_uccexample_account/_new`,
    },
    updated: '2023-08-21T11:54:12+00:00',
    entry: ROW_DATA,
    messages: [],
};
export const MockRowDataForStatusCount = {
    links: {
        create: `/servicesNS/nobody/-/splunk_ta_uccexample_account/_new`,
    },
    updated: '2023-08-21T11:54:12+00:00',
    entry: ROW_DATA_FOR_COUNT,
    messages: [],
};

export const MockRowDataTogglingResponseDisableTrue = {
    entry: [{ content: { disabled: true } }],
};

export const MockRowDataTogglingResponseDisableFalse = {
    entry: [{ content: { disabled: false } }],
};

export const ServerHandlers = [
    http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_account`, () =>
        HttpResponse.json(MockRowData)
    ),
    http.get('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one', () =>
        HttpResponse.json(MockRowData)
    ),
    http.get('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_two', () =>
        HttpResponse.json(MockRowData)
    ),
];
