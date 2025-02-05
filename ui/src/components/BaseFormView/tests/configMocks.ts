import { z } from 'zod';
import { GlobalConfigSchema } from '../../../types/globalConfig/globalConfig';

const CONFIG_MOCK_MODIFICATION_ON_VALUE_CHANGE_CONFIG = {
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
                                {
                                    type: 'string',
                                    errorMsg: 'Length of input name should be between 1 and 100',
                                    minLength: 1,
                                    maxLength: 100,
                                },
                            ],
                            field: 'name',
                            help: 'A unique name for the account.',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Example text field',
                            field: 'text_field_with_modifications',
                            help: 'Example text field with modification',
                            required: false,
                            defaultValue: 'default value',
                            modifyFieldsOnValue: [
                                {
                                    fieldValue: 'default value',
                                    fieldsToModify: [
                                        {
                                            fieldId: 'text_field_with_modifications',
                                            disabled: false,
                                            required: false,
                                            help: 'default help',
                                            label: 'default label',
                                            markdownMessage: {
                                                text: 'default markdown message',
                                            },
                                        },
                                    ],
                                },
                                {
                                    fieldValue: 'modify itself',
                                    fieldsToModify: [
                                        {
                                            fieldId: 'text_field_with_modifications',
                                            disabled: false,
                                            required: true,
                                            help: 'help after modification',
                                            label: 'label after modification',
                                            markdownMessage: {
                                                text: 'markdown message after modification',
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: 'text',
                            label: 'Example text field to be modified',
                            field: 'text_field_to_be_modified',
                            help: 'Example text field to be modified',
                            required: false,
                            modifyFieldsOnValue: [
                                {
                                    fieldValue: '[[any_other_value]]',
                                    fieldsToModify: [
                                        {
                                            fieldId: 'text_field_to_be_modified',
                                            required: true,
                                        },
                                    ],
                                },
                            ],
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
                    ],
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
                moreInfo: [
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

export function getGlobalConfigMockModificationToFieldItself() {
    return GlobalConfigSchema.parse(CONFIG_MOCK_MODIFICATION_ON_VALUE_CHANGE_CONFIG);
}
