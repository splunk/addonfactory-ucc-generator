import { z } from 'zod';
import { GlobalConfig, GlobalConfigSchema } from '../../types/globalConfig/globalConfig';
import { AnyOfEntity } from '../../types/globalConfig/entities';

const globalConfigMockCustomControl = {
    pages: {
        configuration: {
            tabs: [
                {
                    name: 'account',
                    table: {
                        actions: ['edit', 'delete', 'clone'],
                        header: [
                            {
                                label: 'Name',
                                field: 'name',
                            },
                        ],
                    },
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the account.',
                            required: true,
                        },
                        {
                            type: 'file',
                            label: 'Upload File',
                            help: "Upload service account's certificate",
                            field: 'service_account',
                            options: {
                                fileSupportMessage: 'Here is the support message',
                                supportedFileTypes: ['json'],
                            },
                            encrypted: true,
                            required: true,
                        },
                        {
                            type: 'custom',
                            label: 'Example Custom Control',
                            field: 'custom_control_field',
                            help: 'This is an example multipleSelect for account entity',
                            options: {
                                src: 'CustomControl',
                                type: 'external',
                            },
                            required: false,
                        },
                    ],
                    title: 'Accounts',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
            subDescription: {
                text: "Configuration page - Ingesting data from to Splunk Cloud?</br>Read our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.",
                links: [
                    {
                        slug: 'blogPost',
                        link: 'https://splk.it/31oy2b2',
                        linkText: 'blog post',
                    },
                ],
            },
        },
        inputs: {
            services: [
                {
                    name: 'demo_input',
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                                {
                                    type: 'string',
                                    errorMsg: 'Length of input name should be between 1 and 100',
                                    minLength: 1,
                                    maxLength: 100,
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the data input.',
                            required: true,
                            encrypted: false,
                        },
                    ],
                    title: 'demo_input',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            subDescription: {
                text: "Inputs page - Ingesting data from to Splunk Cloud?</br>Read our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.",
                links: [
                    {
                        slug: 'blogPost',
                        link: 'https://splk.it/31oy2b2',
                        linkText: 'blog post',
                    },
                ],
            },
            table: {
                actions: ['edit', 'delete', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Interval',
                        field: 'interval',
                    },
                    {
                        label: 'Index',
                        field: 'index',
                    },
                    {
                        label: 'Status',
                        field: 'disabled',
                    },
                ],
                moreInfo: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Interval',
                        field: 'interval',
                    },
                    {
                        label: 'Index',
                        field: 'index',
                    },
                    {
                        label: 'Status',
                        field: 'disabled',
                        mapping: {
                            true: 'Disabled',
                            false: 'Enabled',
                        },
                    },
                ],
            },
        },
    },
    meta: {
        name: 'demo_addon_for_splunk',
        restRoot: 'demo_addon_for_splunk',
        version: '5.31.1R85f0e18e',
        displayName: 'Demo Add-on for Splunk',
        schemaVersion: '0.0.3',
        checkForUpdates: false,
        searchViewDefault: false,
    },
} satisfies z.input<typeof GlobalConfigSchema>;

export function getGlobalConfigMockCustomControl() {
    return GlobalConfigSchema.parse(globalConfigMockCustomControl);
}

const EXAMPLE_GROUPS_ENTITIES = [
    {
        type: 'text',
        label: 'Text 1 Group 2',
        field: 'text_field_1_group_2',
        required: false,
    },
    {
        type: 'text',
        label: 'Text 2 Group 2',
        field: 'text_field_2_group_2',
        required: false,
    },
    {
        type: 'text',
        label: 'Text 1 Group 1',
        field: 'text_field_1_group_1',
        required: false,
    },
    {
        type: 'text',
        label: 'Text 2 Group 1',
        field: 'text_field_2_group_1',
        required: false,
    },
    {
        type: 'text',
        label: 'Text 1 Group 3',
        field: 'text_field_1_group_3',
        required: false,
    },
    {
        type: 'text',
        label: 'Text 2 Group 3',
        field: 'text_field_2_group_3',
        required: false,
    },
] satisfies z.input<typeof AnyOfEntity>[];

const GROUPS_FOR_EXAMPLE_ENTITIES = [
    {
        label: 'Group 1',
        fields: ['text_field_1_group_1', 'text_field_2_group_1'],
    },
    {
        label: 'Group 2',
        fields: ['text_field_1_group_2', 'text_field_2_group_2'],
        options: {
            isExpandable: true,
            expand: true,
        },
    },
    {
        label: 'Group 3',
        fields: ['text_field_1_group_3', 'text_field_2_group_3'],
        options: {
            isExpandable: true,
            expand: false,
        },
    },
];

const globalConfigMockGroupsForConfigPage = {
    pages: {
        configuration: {
            tabs: [
                {
                    name: 'account',
                    table: {
                        actions: ['edit', 'delete', 'clone'],
                        header: [
                            {
                                label: 'Name',
                                field: 'name',
                            },
                        ],
                    },
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the account.',
                            required: true,
                        },
                        ...EXAMPLE_GROUPS_ENTITIES,
                    ],
                    groups: GROUPS_FOR_EXAMPLE_ENTITIES,
                    title: 'Accounts',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                ],
            },
        },
    },
    meta: {
        name: 'demo_addon_for_splunk',
        restRoot: 'demo_addon_for_splunk',
        version: '5.31.1R85f0e18e',
        displayName: 'Demo Add-on for Splunk',
        schemaVersion: '0.0.3',
        checkForUpdates: false,
        searchViewDefault: false,
    },
} satisfies z.input<typeof GlobalConfigSchema>;

export function getGlobalConfigMockGroupsForConfigPage(): GlobalConfig {
    return GlobalConfigSchema.parse(globalConfigMockGroupsForConfigPage);
}

const globalConfigMockGroupsForInputPage = {
    pages: {
        configuration: {
            tabs: [
                {
                    name: 'account',
                    table: {
                        actions: ['edit', 'delete', 'clone'],
                        header: [
                            {
                                label: 'Name',
                                field: 'name',
                            },
                        ],
                    },
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the account.',
                            required: true,
                        },
                    ],
                    title: 'Accounts',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'demo_input',
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                                {
                                    type: 'string',
                                    errorMsg: 'Length of input name should be between 1 and 100',
                                    minLength: 1,
                                    maxLength: 100,
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the data input.',
                            required: true,
                            encrypted: false,
                        },
                        ...EXAMPLE_GROUPS_ENTITIES,
                    ],
                    groups: GROUPS_FOR_EXAMPLE_ENTITIES,
                    title: 'demo_input',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                ],
            },
        },
    },
    meta: {
        name: 'demo_addon_for_splunk',
        restRoot: 'demo_addon_for_splunk',
        version: '5.31.1R85f0e18e',
        displayName: 'Demo Add-on for Splunk',
        schemaVersion: '0.0.3',
        checkForUpdates: false,
        searchViewDefault: false,
    },
} satisfies z.input<typeof GlobalConfigSchema>;

export function getGlobalConfigMockGroupsFoInputPage(): GlobalConfig {
    return GlobalConfigSchema.parse(globalConfigMockGroupsForInputPage);
}
