import { GlobalConfig, GlobalConfigSchema } from '../../../types/globalConfig/globalConfig';

export const SIMPLE_NAME_TABLE_MOCK_DATA = {
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
                    restHandlerModule: 'splunk_ta_uccexample_validate_account_rh',
                    restHandlerClass: 'CustomAccountValidator',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'example_input_one',
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
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                            help: 'This is an example checkbox for the input one entity',
                            defaultValue: true,
                        },
                    ],
                    title: 'Example Input One',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'search', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Input Type',
                        field: 'serviceTitle',
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
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.41.0R9c5fbfe0',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
} satisfies GlobalConfig;

export const getSimpleConfig = () => {
    return GlobalConfigSchema.parse(SIMPLE_NAME_TABLE_MOCK_DATA);
};

export const TABLE_CONFIG_WITH_MAPPING = {
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
                            {
                                field: 'custom_text',
                                label: 'Custom Text',
                                mapping: {
                                    a: 'wxyz=a',
                                    ab: 'xyz=ab',
                                    abc: 'yz=abc',
                                    abcd: 'z=abcd',
                                },
                            },
                            {
                                field: 'disabled',
                                label: 'Field Status',
                                mapping: {
                                    false: 'Enabled Field',
                                    true: 'Disabled Field',
                                },
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
                        {
                            type: 'text',
                            label: 'Custom Text',
                            field: 'custom_text',
                            help: 'custom text.',
                        },
                    ],
                    title: 'Account',
                    restHandlerModule: 'splunk_ta_uccexample_validate_account_rh',
                    restHandlerClass: 'CustomAccountValidator',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'example_input_one',
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
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                            help: 'This is an example checkbox for the input one entity',
                            defaultValue: true,
                        },
                    ],
                    title: 'Example Input One',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'search', 'clone'],
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
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.41.0R9c5fbfe0',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
} satisfies GlobalConfig;

export const getSimpleConfigWithMapping = () => {
    return GlobalConfigSchema.parse(TABLE_CONFIG_WITH_MAPPING);
};

export const SIMPLE_TABLE_MOCK_DATA_STYLE_PAGE = {
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
                    restHandlerModule: 'splunk_ta_uccexample_validate_account_rh',
                    restHandlerClass: 'CustomAccountValidator',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'example_input_one',
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
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                            help: 'This is an example checkbox for the input one entity',
                            defaultValue: true,
                        },
                    ],
                    title: 'Example Input One',
                    style: 'page',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'search', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Input Status',
                        field: 'disabled',
                    },
                    {
                        label: 'Input Type',
                        field: 'serviceTitle',
                    },
                    {
                        label: 'Account radio',
                        field: 'account_radio',
                    },
                    {
                        label: 'Custom endpoint',
                        field: 'custom_endpoint',
                    },
                    {
                        label: 'Custom text',
                        field: 'custom_text',
                    },
                    {
                        label: 'Username',
                        field: 'username',
                    },
                    {
                        label: 'Account multiple select',
                        field: 'account_multiple_select',
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
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.41.0R9c5fbfe0',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
} satisfies GlobalConfig;

export const getSimpleConfigStylePage = () => {
    return GlobalConfigSchema.parse(SIMPLE_TABLE_MOCK_DATA_STYLE_PAGE);
};

export const SIMPLE_NAME_TABLE_MOCK_DATA_WITH_STATUS_TOGGLE_CONFIRMATION = {
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
                    restHandlerModule: 'splunk_ta_uccexample_validate_account_rh',
                    restHandlerClass: 'CustomAccountValidator',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'example_input_one',
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
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                            help: 'This is an example checkbox for the input one entity',
                            defaultValue: true,
                        },
                    ],
                    title: 'Example Input One',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            useInputToggleConfirmation: true,
            table: {
                actions: ['edit', 'delete', 'search', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
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
                ],
            },
        },
    },
    meta: {
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.41.0R9c5fbfe0',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
} satisfies GlobalConfig;

export const CUSTOM_HEADER_FOR_MODAL_MOCK_DATA = {
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
                    restHandlerModule: 'splunk_ta_uccexample_validate_account_rh',
                    restHandlerClass: 'CustomAccountValidator',
                    formTitle: 'this is custom header',
                },
            ],
            title: 'Configuration',
            description: 'Set up your add-on',
        },
        inputs: {
            services: [
                {
                    name: 'example_input_one',
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
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                            help: 'This is an example checkbox for the input one entity',
                            defaultValue: true,
                        },
                    ],
                    title: 'Example Input One',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'delete', 'search', 'clone'],
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
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.41.0R9c5fbfe0',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
} satisfies GlobalConfig;

export const getCustomModalHeaderData = () => {
    return GlobalConfigSchema.parse(CUSTOM_HEADER_FOR_MODAL_MOCK_DATA);
};

export const CONFIG_MANY_SERVICES = {
    pages: {
        configuration: SIMPLE_TABLE_MOCK_DATA_STYLE_PAGE.pages.configuration,
        inputs: {
            services: [
                {
                    name: 'example_input_one',
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            field: 'name',
                            help: 'A unique name for the data input.',
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                        },
                    ],
                    title: 'Example Input One',
                },
                {
                    name: 'example_input_two',
                    entity: [
                        {
                            type: 'text',
                            label: 'Name',
                            field: 'name',
                            help: 'A unique name for the data input.',
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                        },
                    ],
                    title: 'Example Input Two',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: SIMPLE_TABLE_MOCK_DATA_STYLE_PAGE.pages.inputs.table,
        },
    },
    meta: {
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.41.0R9c5fbfe0',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
} satisfies GlobalConfig;

export const getManyServicesConfig = () => {
    return GlobalConfigSchema.parse(CONFIG_MANY_SERVICES);
};
