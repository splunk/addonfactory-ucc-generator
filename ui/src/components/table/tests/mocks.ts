import { GlobalConfig } from '../../../types/globalConfig/globalConfig';
import { getSimpleConfig } from '../stories/configMockups';

const headers = [
    {
        label: 'Name',
        field: 'name',
    },
    {
        label: 'Interval',
        field: 'interval',
    },
    {
        label: 'Status',
        field: 'disabled',
    },
];

const baseConfig = getSimpleConfig();
const customRowFileName = 'CustomInputRow';

const serviceName = 'example_input_one';

export const MOCK_CONFIG = {
    ...baseConfig,
    pages: {
        ...baseConfig.pages,
        inputs: {
            title: serviceName,
            services: [
                {
                    title: serviceName,
                    name: serviceName,
                    entity: [
                        {
                            label: 'Name',
                            field: 'name',
                            type: 'text',
                        },
                        {
                            label: 'Interval',
                            field: 'interval',
                            type: 'text',
                        },
                    ],
                },
            ],
            table: {
                actions: ['edit'],
                header: headers,
                moreInfo: headers,
                customRow: {
                    src: customRowFileName,
                    type: 'external',
                },
            },
        },
    },
} satisfies GlobalConfig;

export const CUSTOM_CELL_FILE_NAME = 'CustomInputCell';

export const MOCK_CONFIG_CUSTOM_CELL = {
    ...baseConfig,
    pages: {
        ...baseConfig.pages,
        inputs: {
            title: serviceName,
            services: [
                {
                    title: serviceName,
                    name: serviceName,
                    entity: [
                        {
                            label: 'Name',
                            field: 'name',
                            type: 'text',
                        },
                        {
                            label: 'Interval',
                            field: 'interval',
                            type: 'text',
                        },
                    ],
                },
            ],
            table: {
                actions: ['edit'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Interval',
                        field: 'interval',
                        customCell: {
                            src: CUSTOM_CELL_FILE_NAME,
                            type: 'external',
                        },
                    },
                    {
                        label: 'Status',
                        field: 'disabled',
                    },
                ],
                moreInfo: headers,
            },
        },
    },
} satisfies GlobalConfig;

export const getConfigWithHeadersManyServices = (
    newHeaders: {
        label: string;
        field: string;
    }[],
    serviceNumber = 3
) => {
    return {
        ...MOCK_CONFIG,
        pages: {
            ...MOCK_CONFIG.pages,
            inputs: {
                title: serviceName,
                services: Array.from(Array(serviceNumber).keys()).map((_, index) => ({
                    title: `${serviceName}${index}`,
                    name: `${serviceName}${index}`,
                    entity: [
                        {
                            label: 'Name',
                            field: 'name',
                            type: 'text',
                        },
                        {
                            label: 'Interval',
                            field: 'interval',
                            type: 'text',
                        },
                    ],
                })),
                table: {
                    actions: ['edit'],
                    header: newHeaders,
                    moreInfo: newHeaders,
                },
            },
        },
    } satisfies GlobalConfig;
};
