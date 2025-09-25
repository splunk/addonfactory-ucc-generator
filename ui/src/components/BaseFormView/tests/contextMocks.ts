import { TableContextDataTypes } from '../../../context/TableContext';

export const MOCK_CONTEXT_STATE_THREE_INPUTS = {
    rowData: {
        example_input_one: {
            test: {
                name: 'test',
                interval: '123123',
                serviceName: 'example_input_one',
                serviceTitle: 'Example Input One',
            },
        },
        example_input_two: {},
        example_input_three: {},
        example_input_four: {
            test: {
                name: 'test',
                interval: '123123123',
                serviceName: 'example_input_four',
                serviceTitle: 'Example Input Four',
            },
            other_input: {
                name: 'other_input',
                interval: '123123',
                serviceName: 'example_input_four',
                serviceTitle: 'Example Input Four',
            },
        },
        service_hidden_for_cloud: {},
        service_hidden_for_enterprise: {},
    },
    searchText: '',
    searchType: 'all',
    pageSize: 10,
    currentPage: 0,
} satisfies TableContextDataTypes;

export const MOCK_CONTEXT_STATE_ACCOUNT = {
    rowData: {
        account: {
            test_basic_oauth: {
                auth_type: 'basic',
                disabled: false,
                name: 'test_basic_oauth',
                serviceName: 'account',
                serviceTitle: 'Account',
            },
            test_oauth_oauth: {
                auth_type: 'oauth',
                disabled: false,
                name: 'test_oauth_oauth',
                serviceName: 'account',
                serviceTitle: 'Account',
            },
            test_oauth_client_creds: {
                auth_type: 'oauth_client_credentials',
                disabled: false,
                name: 'test_oauth_client_creds',
                serviceName: 'account',
                serviceTitle: 'Account',
            },
        },
        organization: {
            test_basic_oauth: {
                auth_type: 'basic',
                disabled: false,
                name: 'test_basic_oauth',
                serviceName: 'organization',
                serviceTitle: 'Organization',
            },
            test_oauth_oauth: {
                auth_type: 'oauth',
                disabled: false,
                name: 'test_oauth_oauth',
                serviceName: 'organization',
                serviceTitle: 'Organization',
            },
            test_oauth_client_creds: {
                auth_type: 'oauth_client_credentials',
                disabled: false,
                name: 'test_oauth_client_creds',
                serviceName: 'organization',
                serviceTitle: 'Organization',
            },
        },
    },
    searchText: '',
    searchType: 'all',
    pageSize: 10,
    currentPage: 0,
} satisfies TableContextDataTypes;
