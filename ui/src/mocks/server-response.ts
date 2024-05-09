export const MOCKED_TA_NAME = 'Splunk_TA_mocked_name';
export const MOCKED_TA_INPUT = 'splunk_ta_mocked_input_name';

export const mockServerResponse = {
    links: {
        create: `/servicesNS/nobody/${MOCKED_TA_NAME}/${MOCKED_TA_INPUT}/_new`,
    },
    updated: '2023-08-21T11:54:12+00:00',
    entry: [],
    messages: [],
};

export const mockServerResponseWithContent = {
    links: {
        create: `/servicesNS/nobody/${MOCKED_TA_NAME}/${MOCKED_TA_INPUT}/_new`,
    },
    updated: '2023-08-21T11:54:12+00:00',
    entry: [
        {
            content: {
                disabled: true,
            },
        },
    ],
    messages: [],
};

export const mockServerResponseForInput = {
    links: {
        create: `/servicesNS/nobody/${MOCKED_TA_NAME}/${MOCKED_TA_INPUT}/_new`,
    },
    updated: '2023-08-21T11:54:12+00:00',
    entry: [
        {
            name: 'name',
            content: {},
        },
    ],
    messages: [],
};
