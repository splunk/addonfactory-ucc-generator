import { TableContextDataTypes } from '../../../context/TableContext';

export const MOCK_CONTEXT_STATE_THREE_INPUTS = {
    rowData: {
        example_input_one: {
            test: {
                name: 'test',
                interval: '123123',
                serviceName: 'example_input_one',
            },
        },
        example_input_two: {},
        example_input_three: {},
        example_input_four: {
            test: {
                name: 'test',
                interval: '123123123',
                serviceName: 'example_input_four',
            },
            other_input: {
                name: 'other_input',
                interval: '123123',
                serviceName: 'example_input_four',
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
