import { z } from 'zod';
import { GlobalConfigSchema } from '../../../types/globalConfig/globalConfig';

export const INPUT_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM = {
    pages: {
        configuration: {
            tabs: [
                {
                    name: 'account',
                    table: {
                        actions: [
                            {
                                action: 'add',
                            },
                            {
                                action: 'edit',
                            },
                            {
                                action: 'delete',
                            },
                            {
                                action: 'clone',
                            },
                        ],
                        header: [
                            {
                                label: 'Name',
                                field: 'name',
                            },
                            {
                                label: 'Auth Type',
                                field: 'auth_type',
                            },
                        ],
                    },
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Length of ID should be between 1 and 50',
                                    minLength: 1,
                                    maxLength: 50,
                                },
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                            ],
                            field: 'name',
                            help: 'Enter a unique name for this account.',
                            required: true,
                        },
                    ],
                    title: 'Account',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            title: 'Inputs',
            services: [
                {
                    name: 'example_input_one',
                    description: 'This is a description for Input One',
                    title: 'Example Input',
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Length of ID should be between 1 and 50',
                                    minLength: 1,
                                    maxLength: 50,
                                },
                                {
                                    type: 'regex',
                                    errorMsg:
                                        'Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                            ],
                            field: 'name',
                            help: 'Enter a unique name for this account.',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Text input hidden for cloud',
                            field: 'input_two_text_hidden_for_cloud',
                            help: 'Should be hidden for cloud',
                            tooltip: 'Should be hidden for cloud',
                            required: false,
                            options: {
                                hideForPlatform: 'cloud',
                            },
                        },
                        {
                            type: 'text',
                            label: 'Text input hidden for enterprise',
                            field: 'input_two_text_hidden_for_enterprise',
                            help: 'Should be hidden for enterprise',
                            tooltip: 'Should be hidden for enterprise',
                            required: false,
                            options: {
                                hideForPlatform: 'enterprise',
                            },
                        },
                    ],
                    table: {
                        actions: [
                            {
                                action: 'add',
                            },
                            {
                                action: 'edit',
                            },
                            {
                                action: 'delete',
                            },
                            {
                                action: 'clone',
                            },
                        ],
                        header: [],
                        moreInfo: [],
                    },
                },
                {
                    name: 'example_input_two',
                    description: 'This is a description for Input Two',
                    title: 'Example Input Two',
                    entity: [],
                    table: {
                        actions: [
                            {
                                action: 'add',
                            },
                            {
                                action: 'edit',
                            },
                            {
                                action: 'delete',
                            },
                            {
                                action: 'clone',
                            },
                        ],
                        header: [],
                        moreInfo: [],
                        customRow: {
                            type: 'external',
                            src: 'custom_row',
                        },
                    },
                },
                {
                    name: 'example_input_three',
                    description: 'Input hidden for cloud',
                    title: 'Example Input Three Hidden Cloud',
                    entity: [],
                    table: {
                        actions: [
                            {
                                action: 'add',
                            },
                            {
                                action: 'edit',
                            },
                            {
                                action: 'delete',
                            },
                            {
                                action: 'clone',
                            },
                        ],
                        header: [],
                        moreInfo: [],
                        customRow: {
                            type: 'external',
                            src: 'custom_row',
                        },
                    },
                    hideForPlatform: 'cloud',
                },
                {
                    name: 'example_input_four',
                    description: 'Input hidden for enterprise',
                    title: 'Example Input Four Hidden Enterprise',
                    entity: [],
                    table: {
                        actions: [
                            {
                                action: 'add',
                            },
                            {
                                action: 'edit',
                            },
                            {
                                action: 'delete',
                            },
                            {
                                action: 'clone',
                            },
                        ],
                        header: [],
                        moreInfo: [],
                        customRow: {
                            type: 'external',
                            src: 'custom_row',
                        },
                    },
                    hideForPlatform: 'enterprise',
                },
            ],
        },
    },
    meta: {
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.50.1+4a1bb166c',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.8',
        _uccVersion: '5.50.1',
    },
} satisfies z.infer<typeof GlobalConfigSchema>;
