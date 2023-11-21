export const EverythingConfig = {
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
                            type: 'singleSelect',
                            label: 'Example Environment',
                            options: {
                                disableSearch: true,
                                autoCompleteFields: [
                                    {
                                        value: 'login.example.com',
                                        label: 'Value1',
                                    },
                                    {
                                        value: 'test.example.com',
                                        label: 'Value2',
                                    },
                                    {
                                        value: 'other',
                                        label: 'Other',
                                    },
                                ],
                                display: true,
                            },
                            help: '',
                            field: 'custom_endpoint',
                            defaultValue: 'login.example.com',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Endpoint URL',
                            help: 'Enter the endpoint URL.',
                            field: 'endpoint',
                            options: {
                                display: false,
                            },
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'account_checkbox',
                            help: 'This is an example checkbox for the account entity',
                        },
                        {
                            type: 'radio',
                            label: 'Example Radio',
                            field: 'account_radio',
                            defaultValue: 'yes',
                            help: 'This is an example radio button for the account entity',
                            required: true,
                            options: {
                                items: [
                                    {
                                        value: 'yes',
                                        label: 'Yes',
                                    },
                                    {
                                        value: 'no',
                                        label: 'No',
                                    },
                                ],
                                display: true,
                            },
                        },
                        {
                            type: 'multipleSelect',
                            label: 'Example Multiple Select',
                            field: 'account_multiple_select',
                            help: 'This is an example multipleSelect for account entity',
                            required: true,
                            options: {
                                items: [
                                    {
                                        value: 'one',
                                        label: 'Option One',
                                    },
                                    {
                                        value: 'two',
                                        label: 'Option Two',
                                    },
                                ],
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
                                        oauth_field: 'username',
                                        label: 'Username',
                                        help: 'Enter the username for this account.',
                                        field: 'username',
                                    },
                                    {
                                        oauth_field: 'password',
                                        label: 'Password',
                                        encrypted: true,
                                        help: 'Enter the password for this account.',
                                        field: 'password',
                                    },
                                    {
                                        oauth_field: 'security_token',
                                        label: 'Security Token',
                                        encrypted: true,
                                        help: 'Enter the security token.',
                                        field: 'token',
                                    },
                                    {
                                        oauth_field: 'some_text',
                                        label: 'some_text Token',
                                        help: 'Enter some_text',
                                        field: 'basic_oauth_text',
                                        options: {
                                            disableonEdit: true,
                                        },
                                    },
                                ],
                                oauth: [
                                    {
                                        oauth_field: 'client_id',
                                        label: 'Client Id',
                                        field: 'client_id',
                                        help: 'Enter the Client Id for this account.',
                                    },
                                    {
                                        oauth_field: 'client_secret',
                                        label: 'Client Secret',
                                        field: 'client_secret',
                                        encrypted: true,
                                        help: 'Enter the Client Secret key for this account.',
                                    },
                                    {
                                        oauth_field: 'redirect_url',
                                        label: 'Redirect url',
                                        field: 'redirect_url',
                                        help: 'Copy and paste this URL into your app.',
                                    },
                                    {
                                        oauth_field: 'oauth_some_text',
                                        label: 'oauth some_text Token',
                                        help: 'Enter some_text',
                                        field: 'oauth_oauth_text',
                                        options: {
                                            placeholder: 'asd',
                                            disableonEdit: true,
                                        },
                                    },
                                ],
                                auth_code_endpoint: '/services/oauth2/authorize',
                                access_token_endpoint: '/services/oauth2/token',
                                oauth_timeout: 30,
                                oauth_state_enabled: false,
                            },
                        },
                        {
                            field: 'example_help_link',
                            label: '',
                            type: 'helpLink',
                            options: {
                                text: 'Help Link',
                                link: 'https://docs.splunk.com/Documentation',
                            },
                        },
                        {
                            field: 'config1_help_link',
                            type: 'helpLink',
                            options: {
                                text: 'Add-on configuration documentation',
                                link: 'https://docs.splunk.com/Documentation',
                            },
                        },
                        {
                            field: 'config2_help_link',
                            type: 'helpLink',
                            options: {
                                text: 'SSL configuration documentation',
                                link: 'https://docs.splunk.com/Documentation',
                            },
                        },
                    ],
                    title: 'Account',
                },
                {
                    name: 'proxy',
                    entity: [
                        {
                            type: 'checkbox',
                            label: 'Enable',
                            field: 'proxy_enabled',
                        },
                        {
                            type: 'singleSelect',
                            label: 'Proxy Type',
                            options: {
                                disableSearch: true,
                                autoCompleteFields: [
                                    {
                                        value: 'http',
                                        label: 'http',
                                    },
                                    {
                                        value: 'socks4',
                                        label: 'socks4',
                                    },
                                    {
                                        value: 'socks5',
                                        label: 'socks5',
                                    },
                                ],
                            },
                            defaultValue: 'http',
                            field: 'proxy_type',
                        },
                        {
                            type: 'text',
                            label: 'Host',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max host length is 4096',
                                    minLength: 0,
                                    maxLength: 4096,
                                },
                                {
                                    type: 'regex',
                                    errorMsg: 'Proxy Host should not have special characters',
                                    pattern: '^[a-zA-Z]\\w*$',
                                },
                            ],
                            field: 'proxy_url',
                        },
                        {
                            type: 'text',
                            label: 'Port',
                            validators: [
                                {
                                    type: 'number',
                                    range: [1, 65535],
                                },
                            ],
                            field: 'proxy_port',
                        },
                        {
                            type: 'text',
                            label: 'Username',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max length of username is 50',
                                    minLength: 0,
                                    maxLength: 50,
                                },
                            ],
                            field: 'proxy_username',
                        },
                        {
                            type: 'text',
                            label: 'Password',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max length of password is 8192',
                                    minLength: 0,
                                    maxLength: 8192,
                                },
                            ],
                            encrypted: true,
                            field: 'proxy_password',
                        },
                        {
                            type: 'checkbox',
                            label: 'Reverse DNS resolution',
                            field: 'proxy_rdns',
                        },
                    ],
                    options: {
                        saveValidator:
                            "function(formData) { if(!formData.proxy_enabled || formData.proxy_enabled === '0') {return true; } if(!formData.proxy_url) { return 'Proxy Host can not be empty'; } if(!formData.proxy_port) { return 'Proxy Port can not be empty'; } return true; }",
                    },
                    title: 'Proxy',
                },
                {
                    name: 'logging',
                    entity: [
                        {
                            type: 'singleSelect',
                            label: 'Log level',
                            options: {
                                disableSearch: true,
                                autoCompleteFields: [
                                    {
                                        value: 'DEBUG',
                                        label: 'DEBUG',
                                    },
                                    {
                                        value: 'INFO',
                                        label: 'INFO',
                                    },
                                    {
                                        value: 'WARNING',
                                        label: 'WARNING',
                                    },
                                    {
                                        value: 'ERROR',
                                        label: 'ERROR',
                                    },
                                    {
                                        value: 'CRITICAL',
                                        label: 'CRITICAL',
                                    },
                                ],
                            },
                            defaultValue: 'INFO',
                            field: 'loglevel',
                        },
                    ],
                    title: 'Logging',
                },
                {
                    name: 'custom_abc',
                    title: 'Customized tab',
                    entity: [
                        {
                            field: 'testString',
                            label: 'Test String',
                            type: 'text',
                            validators: [
                                {
                                    type: 'string',
                                    maxLength: 10,
                                    minLength: 5,
                                },
                            ],
                        },
                        {
                            field: 'testNumber',
                            label: 'Test Number',
                            type: 'text',
                            validators: [
                                {
                                    type: 'number',
                                    range: [1, 10],
                                },
                            ],
                        },
                        {
                            field: 'testRegex',
                            label: 'Test Regex',
                            type: 'text',
                            validators: [
                                {
                                    type: 'regex',
                                    pattern: '^\\w+$',
                                    errorMsg: 'Characters of Name should match regex ^\\w+$ .',
                                },
                            ],
                        },
                        {
                            field: 'testEmail',
                            label: 'Test Email',
                            type: 'text',
                            validators: [
                                {
                                    type: 'email',
                                },
                            ],
                        },
                        {
                            field: 'testIpv4',
                            label: 'Test Ipv4',
                            type: 'text',
                            validators: [
                                {
                                    type: 'ipv4',
                                },
                            ],
                        },
                        {
                            field: 'testDate',
                            label: 'Test Date',
                            type: 'text',
                            validators: [
                                {
                                    type: 'date',
                                },
                            ],
                        },
                        {
                            field: 'testUrl',
                            label: 'Test Url',
                            type: 'text',
                            validators: [
                                {
                                    type: 'url',
                                },
                            ],
                        },
                    ],
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
                        },
                        {
                            type: 'checkbox',
                            label: 'Example Checkbox',
                            field: 'input_one_checkbox',
                            help: 'This is an example checkbox for the input one entity',
                            defaultValue: true,
                        },
                        {
                            type: 'radio',
                            label: 'Example Radio',
                            field: 'input_one_radio',
                            defaultValue: 'yes',
                            help: 'This is an example radio button for the input one entity',
                            required: false,
                            options: {
                                items: [
                                    {
                                        value: 'yes',
                                        label: 'Yes',
                                    },
                                    {
                                        value: 'no',
                                        label: 'No',
                                    },
                                ],
                                display: true,
                            },
                        },
                        {
                            field: 'singleSelectTest',
                            label: 'Single Select Group Test',
                            type: 'singleSelect',
                            options: {
                                createSearchChoice: true,
                                autoCompleteFields: [
                                    {
                                        label: 'Group1',
                                        children: [
                                            {
                                                value: 'one',
                                                label: 'One',
                                            },
                                            {
                                                value: 'two',
                                                label: 'Two',
                                            },
                                        ],
                                    },
                                    {
                                        label: 'Group2',
                                        children: [
                                            {
                                                value: 'three',
                                                label: 'Three',
                                            },
                                            {
                                                value: 'four',
                                                label: 'Four',
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                        {
                            field: 'multipleSelectTest',
                            label: 'Multiple Select Test',
                            type: 'multipleSelect',
                            defaultValue: 'a|b',
                            options: {
                                delimiter: '|',
                                items: [
                                    {
                                        value: 'a',
                                        label: 'A',
                                    },
                                    {
                                        value: 'b',
                                        label: 'B',
                                    },
                                ],
                            },
                        },
                        {
                            type: 'text',
                            label: 'Interval',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg: 'Interval must be an integer.',
                                    pattern: '^\\-[1-9]\\d*$|^\\d*$',
                                },
                            ],
                            field: 'interval',
                            help: 'Time interval of the data input, in seconds.',
                            required: true,
                        },
                        {
                            type: 'singleSelect',
                            label: 'Index',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Length of index name should be between 1 and 80.',
                                    minLength: 1,
                                    maxLength: 80,
                                },
                            ],
                            defaultValue: 'default',
                            options: {
                                endpointUrl: 'data/indexes',
                                denyList: '^_.*$',
                                createSearchChoice: true,
                            },
                            field: 'index',
                            required: true,
                        },
                        {
                            type: 'singleSelect',
                            label: 'Example Account',
                            options: {
                                referenceName: 'account',
                            },
                            help: '',
                            field: 'account',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Object',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max length of text input is 8192',
                                    minLength: 0,
                                    maxLength: 8192,
                                },
                            ],
                            field: 'object',
                            help: 'The name of the object to query for.',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Object Fields',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max length of text input is 8192',
                                    minLength: 0,
                                    maxLength: 8192,
                                },
                            ],
                            field: 'object_fields',
                            help: 'Object fields from which to collect data. Delimit multiple fields using a comma.',
                            required: true,
                        },
                        {
                            type: 'text',
                            label: 'Order By',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max length of text input is 8192',
                                    minLength: 0,
                                    maxLength: 8192,
                                },
                            ],
                            defaultValue: 'LastModifiedDate',
                            field: 'order_by',
                            help: 'The datetime field by which to query results in ascending order for indexing.',
                            required: true,
                        },
                        {
                            type: 'radio',
                            label: 'Use existing data input?',
                            field: 'use_existing_checkpoint',
                            defaultValue: 'yes',
                            help: 'Data input already exists. Select `No` if you want to reset the data collection.',
                            required: false,
                            options: {
                                items: [
                                    {
                                        value: 'yes',
                                        label: 'Yes',
                                    },
                                    {
                                        value: 'no',
                                        label: 'No',
                                    },
                                ],
                                display: false,
                            },
                        },
                        {
                            type: 'text',
                            label: 'Query Start Date',
                            validators: [
                                {
                                    type: 'regex',
                                    errorMsg: 'Invalid date and time format',
                                    pattern:
                                        '^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}z)?$',
                                },
                            ],
                            field: 'start_date',
                            help: 'The datetime after which to query and index records, in this format: "YYYY-MM-DDThh:mm:ss.000z".\nDefaults to 90 days earlier from now.',
                            tooltip:
                                'Changing this parameter may result in gaps or duplication in data collection.',
                            required: false,
                        },
                        {
                            type: 'text',
                            label: 'Limit',
                            validators: [
                                {
                                    type: 'string',
                                    errorMsg: 'Max length of text input is 8192',
                                    minLength: 0,
                                    maxLength: 8192,
                                },
                            ],
                            defaultValue: '1000',
                            field: 'limit',
                            help: 'The maximum number of results returned by the query.',
                            required: false,
                        },
                        {
                            type: 'textarea',
                            label: 'Example Textarea Field',
                            field: 'example_textarea_field',
                            help: 'Help message',
                            options: {
                                rowsMin: 3,
                                rowsMax: 15,
                            },
                            required: true,
                        },
                        {
                            field: 'example_help_link',
                            label: '',
                            type: 'helpLink',
                            options: {
                                text: 'Help Link',
                                link: 'https://docs.splunk.com/Documentation',
                            },
                        },
                    ],
                    title: 'Example Input One',
                },
            ],
            title: 'Inputs',
            description: 'Manage your data inputs',
            table: {
                actions: ['edit', 'enable', 'delete', 'clone'],
                header: [
                    {
                        label: 'Name',
                        field: 'name',
                    },
                    {
                        label: 'Account',
                        field: 'account',
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
                    {
                        label: 'Example Account',
                        field: 'account',
                    },
                    {
                        label: 'Object',
                        field: 'object',
                    },
                    {
                        label: 'Object Fields',
                        field: 'object_fields',
                    },
                    {
                        label: 'Order By',
                        field: 'order_by',
                    },
                    {
                        label: 'Query Start Date',
                        field: 'start_date',
                    },
                    {
                        label: 'Limit',
                        field: 'limit',
                    },
                ],
            },
        },
        dashboard: {
            panels: [
                {
                    name: 'addon_version',
                },
                {
                    name: 'events_ingested_by_sourcetype',
                },
                {
                    name: 'errors_in_the_addon',
                },
            ],
        },
    },
    meta: {
        name: 'Splunk_TA_UCCExample',
        restRoot: 'splunk_ta_uccexample',
        version: '5.32.0R8a30a75d',
        displayName: 'Splunk UCC test Add-on',
        schemaVersion: '0.0.3',
    },
};

export const configBasicOauthDisableonEdit = {
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
            type: 'oauth',
            field: 'oauth_jest_test',
            label: 'Not used',
            options: {
                auth_type: ['basic', 'oauth'],
                basic: [
                    {
                        oauth_field: 'username_jest_test',
                        label: 'Username_jest_test',
                        help: 'Enter the username for this account.',
                        field: 'username_jest_test',
                    },
                    {
                        oauth_field: 'password_jest_test',
                        label: 'Password',
                        encrypted: true,
                        help: 'Enter the password for this account.',
                        field: 'password_jest_test',
                    },
                    {
                        oauth_field: 'security_token_jest_test',
                        label: 'Security Token',
                        encrypted: true,
                        help: 'Enter the security token.',
                        field: 'token_jest_test',
                    },
                    {
                        oauth_field: 'some_text_jest_test',
                        label: 'some_text Token',
                        help: 'Enter some_text',
                        field: 'basic_oauth_text_jest_test',
                        options: {
                            disableonEdit: true,
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
    title: 'Account jest test',
};

export const configOauthOauthDisableonEdit = {
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
            type: 'oauth',
            field: 'oauth_jest_test',
            label: 'Not used',
            options: {
                auth_type: ['oauth'],
                oauth: [
                    {
                        oauth_field: 'client_id_jest_test',
                        label: 'Client Id',
                        field: 'client_id_jest_test',
                        help: 'Enter the Client Id for this account.',
                    },
                    {
                        oauth_field: 'client_secret_jest_test',
                        label: 'Client Secret',
                        field: 'client_secret_jest_test',
                        encrypted: true,
                        help: 'Enter the Client Secret key for this account.',
                    },
                    {
                        oauth_field: 'redirect_url_jest_test',
                        label: 'Redirect url',
                        field: 'redirect_url_jest_test',
                        help: 'Copy and paste this URL into your app.',
                    },
                    {
                        oauth_field: 'oauth_some_text_jest_test',
                        label: 'oauth some_text Token',
                        help: 'Enter some_text',
                        field: 'oauth_oauth_text_jest_test',
                        options: {
                            disableonEdit: true,
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
    title: 'Account jest test',
};
