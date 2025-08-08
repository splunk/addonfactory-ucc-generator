import { GlobalConfig } from '../../../../types/globalConfig/globalConfig';

export const PAGE_CONFIG_BOTH_OAUTH = {
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
                        {
                            type: 'text',
                            label: 'Endpoint URL',
                            help: 'Enter the endpoint URL.',
                            field: 'endpoint',
                            options: {
                                display: false,
                                requiredWhenVisible: true,
                            },
                        },
                        {
                            type: 'oauth',
                            field: 'oauth',
                            label: 'Not used',
                            options: {
                                auth_type: ['basic', 'oauth'],
                                basic: [
                                    {
                                        label: 'Username',
                                        help: 'Enter the username for this account.',
                                        field: 'username',
                                    },
                                    {
                                        label: 'Password',
                                        encrypted: true,
                                        help: 'Enter the password for this account.',
                                        field: 'password',
                                    },
                                    {
                                        label: 'Security Token',
                                        encrypted: true,
                                        help: 'Enter the security token.',
                                        field: 'token',
                                    },
                                    {
                                        label: 'Disabled on edit for oauth',
                                        help: 'Enter text for field disabled on edit',
                                        field: 'basic_oauth_text',
                                        required: false,
                                        options: {
                                            disableonEdit: true,
                                        },
                                    },
                                ],
                                oauth: [
                                    {
                                        label: 'Client Id',
                                        field: 'client_id',
                                        help: 'Enter the Client Id for this account.',
                                    },
                                    {
                                        label: 'Client Secret',
                                        field: 'client_secret',
                                        encrypted: true,
                                        help: 'Enter the Client Secret key for this account.',
                                    },
                                    {
                                        label: 'Redirect url',
                                        field: 'redirect_url',
                                        help: 'Copy and paste this URL into your app.',
                                    },
                                    {
                                        label: 'Token endpoint',
                                        field: 'endpoint_token',
                                        help: 'Put here endpoint used for token acqusition ie. login.salesforce.com',
                                    },
                                    {
                                        label: 'Authorize endpoint',
                                        field: 'endpoint_authorize',
                                        help: 'Put here endpoint used for authorization ie. login.salesforce.com',
                                    },
                                    {
                                        label: 'Disabled on edit for oauth',
                                        help: 'Enter text for field disabled on edit',
                                        field: 'oauth_oauth_text',
                                        required: false,
                                        options: {
                                            disableonEdit: true,
                                            enable: false,
                                        },
                                    },
                                ],
                                auth_code_endpoint: '/services/oauth2/authorize',
                                access_token_endpoint: '/services/oauth2/token',
                                oauth_timeout: 30,
                                oauth_state_enabled: false,
                            },
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
            subDescription: {
                text: "Input page - Ingesting data from to Splunk Cloud? Have you tried the new Splunk Data Manager yet?\nData Manager makes AWS data ingestion simpler, more automated and centrally managed for you, while co-existing with AWS and/or Kinesis TAs.\nRead our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.",
                links: [
                    {
                        slug: 'blogPost',
                        link: 'https://splk.it/31oy2b2',
                        linkText: 'blog post',
                    },
                ],
            },
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
        _uccVersion: '5.41.0',
    },
};

export const getConfigOauthBasic = () => {
    const configCp = JSON.parse(JSON.stringify(PAGE_CONFIG_BOTH_OAUTH));
    if (configCp.pages.configuration.tabs[0].entity[2].options?.auth_type) {
        configCp.pages.configuration.tabs[0].entity[2].options.auth_type = ['basic'];
    }
    return configCp;
};

export const getConfigOauthOauth = () => {
    const configCp = JSON.parse(JSON.stringify(PAGE_CONFIG_BOTH_OAUTH));
    if (configCp.pages.configuration.tabs[0].entity[2].options?.auth_type) {
        configCp.pages.configuration.tabs[0].entity[2].options.auth_type = ['oauth'];
    }
    return configCp;
};

export const getConfigOauthBasicWithAdditionalFieldTypes = (): GlobalConfig => {
    const configCp = JSON.parse(JSON.stringify(PAGE_CONFIG_BOTH_OAUTH));
    if (configCp.pages.configuration.tabs[0].entity[2].options?.auth_type) {
        configCp.pages.configuration.tabs[0].entity[2].options.auth_type = ['basic'];
        configCp.pages.configuration.tabs[0].entity[2].options.basic.push(
            {
                label: 'Additional Text Field',
                field: 'additional_text',
                type: 'text',
                help: 'This is an additional text field for basic auth.',
            },
            {
                label: 'Security Token certificate',
                encrypted: true,
                help: 'Enter the security certificate token.',
                field: 'token_cert_2',
            },
            {
                label: 'Text Area Token',
                help: 'Enter Text Area Token',
                field: 'text_area_test_basic_oauth',
                type: 'textarea',
                options: {
                    rowsMin: 3,
                    rowsMax: 5,
                },
                required: false,
            },
            {
                label: 'Basic Oauth select',
                help: 'additiona oauth select',
                field: 'select_test_basic_oauth',
                type: 'singleSelect',
                options: {
                    items: [
                        {
                            label: 'Option 1',
                            value: 'option1',
                        },
                        {
                            label: 'Option 2',
                            value: 'option2',
                        },
                        {
                            label: 'Option 3',
                            value: 'option3',
                        },
                    ],
                },
            },
            {
                label: 'Basic Oauth radio',
                help: 'Additiona oauth radio',
                field: 'radio_test_basic_oauth',
                type: 'radio',
                options: {
                    items: [
                        {
                            label: 'Left',
                            value: 'left',
                        },
                        {
                            label: 'Middle',
                            value: 'middle',
                        },
                        {
                            label: 'Right',
                            value: 'right',
                        },
                    ],
                },
            }
        );
    }
    return configCp;
};
