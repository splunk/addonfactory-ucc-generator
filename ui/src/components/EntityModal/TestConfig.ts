import { z } from 'zod';
import { TabSchema } from '../../types/globalConfig/pages';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { GlobalConfigSchema } from '../../types/globalConfig/globalConfig';
import { oAuthEntitySchema } from '../../types/globalConfig/oAuth';

const defaultTableProps = {
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
    title: 'Account jest test',
} satisfies z.infer<typeof TabSchema>;

const entityBasicOauthDisableonEdit = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['basic'],
            basic: [
                {
                    oauth_field: 'some_text_jest_test',
                    label: 'some_text Token',
                    help: 'Enter some_text',
                    field: 'basic_oauth_text_jest_test',
                    options: {
                        disableonEdit: true,
                        enable: true,
                    },
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 30,
            oauth_state_enabled: false,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

const entityOauthOauthDisableonEdit = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['oauth'],
            oauth: [
                {
                    oauth_field: 'oauth_some_text_jest_test',
                    label: 'oauth some_text Token',
                    help: 'Enter some_text',
                    field: 'oauth_oauth_text_jest_test',
                    options: {
                        disableonEdit: true,
                        enable: true,
                    },
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 30,
            oauth_state_enabled: false,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigBasicOauthDisableonEdit = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: entityBasicOauthDisableonEdit, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

export const getConfigOauthOauthDisableonEdit = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: entityOauthOauthDisableonEdit, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

const accessTokenMock = [
    {
        field: 'oauth',
        label: 'Not used',
        type: 'oauth',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['oauth'],
            oauth: [
                {
                    oauth_field: 'client_id',
                    label: 'App Id',
                    field: 'client_id',
                    help: 'Enter Client Id.',
                },
                {
                    oauth_field: 'client_secret',
                    label: 'App Secret',
                    field: 'client_secret',
                    encrypted: true,
                    help: 'Enter Client Secret.',
                },
                {
                    oauth_field: 'redirect_url',
                    label: 'Redirect url',
                    field: 'redirect_url',
                    help: 'Please add this redirect URL in your app.',
                },
            ],
            auth_label: 'Auth Type',
            oauth_popup_width: 600,
            oauth_popup_height: 600,
            oauth_timeout: 180,
            auth_code_endpoint: '/oauth2/authorize',
            access_token_endpoint: '/oauth2/token',
            auth_endpoint_token_access_type: 'offline',
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigAccessTokenMock = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: accessTokenMock, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

const entityEnableFalseForOauthField = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['oauth'],
            oauth: [
                {
                    oauth_field: 'oauth_some_text_jest_test',
                    label: 'oauth some_text Token',
                    help: 'Enter some_text',
                    field: 'oauth_oauth_text_jest_test',
                    options: {
                        disableonEdit: false,
                        enable: false,
                    },
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 30,
            oauth_state_enabled: false,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigEnableFalseForOauth = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: entityEnableFalseForOauthField, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

export const WARNING_MESSAGES = {
    create: { message: 'Some warning text create' },
    edit: { message: 'Some warning text edit' },
    clone: { message: 'Some warning text clone' },
    config: { message: 'Some warning text config' },
};

export const WARNING_MESSAGES_ALWAYS_DISPLAY = {
    create: { message: 'Some warning text create', alwaysDisplay: true },
    edit: { message: 'Some warning text edit', alwaysDisplay: true },
    clone: { message: 'Some warning text clone', alwaysDisplay: true },
    config: { message: 'Some warning text config', alwaysDisplay: true },
};

export const getConfigWarningMessage = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [
                    { entity: accessTokenMock, ...defaultTableProps, warning: WARNING_MESSAGES },
                ],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

export const getConfigWarningMessageAlwaysDisplay = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [
                    {
                        entity: accessTokenMock,
                        ...defaultTableProps,
                        warning: WARNING_MESSAGES_ALWAYS_DISPLAY,
                    },
                ],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

const entityBasicOauthFullyEnabledField = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['oauth'],
            oauth: [
                {
                    oauth_field: 'some_text_jest_test',
                    label: 'some_text Token',
                    help: 'Enter some_text',
                    field: 'oauth_oauth_text_jest_test',
                    options: {
                        disableonEdit: false,
                        enable: true,
                    },
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 30,
            oauth_state_enabled: false,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigFullyEnabledField = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: entityBasicOauthFullyEnabledField, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

export const DEFAULT_VALUE = 'some default value';

const entityBasicOauthDefaultValue = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['oauth'],
            oauth: [
                {
                    oauth_field: 'some_text_jest_test',
                    label: 'some_text Token',
                    help: 'Enter some_text',
                    field: 'oauth_oauth_text_jest_test',
                    defaultValue: DEFAULT_VALUE,
                    options: {
                        disableonEdit: false,
                        enable: true,
                    },
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 30,
            oauth_state_enabled: false,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigWithOauthDefaultValue = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: entityBasicOauthDefaultValue, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

const entityOauthOauthSeparatedEndpoints = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['oauth'],
            oauth: [
                {
                    oauth_field: 'client_id',
                    label: 'Client Id',
                    field: 'client_id',
                    help: 'Enter the Client Id for this account.',
                    defaultValue: 'Client Id',
                },
                {
                    oauth_field: 'client_secret',
                    label: 'Client Secret',
                    field: 'client_secret',
                    encrypted: true,
                    help: 'Enter the Client Secret key for this account.',
                    defaultValue: 'Client Secret',
                },
                {
                    oauth_field: 'redirect_url',
                    label: 'Redirect url',
                    field: 'redirect_url',
                    help: 'Copy and paste this URL into your app.',
                    defaultValue: 'Redirect url',
                },
                {
                    oauth_field: 'endpoint_token',
                    label: 'Token endpoint',
                    field: 'endpoint_token',
                    help: 'Put here endpoint used for token acqusition ie. login.salesforce.com',
                },
                {
                    oauth_field: 'endpoint_authorize',
                    label: 'Authorize endpoint',
                    field: 'endpoint_authorize',
                    help: 'Put here endpoint used for authorization ie. login.salesforce.com',
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 3000,
            oauth_state_enabled: true,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigWithSeparatedEndpointsOAuth = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: entityOauthOauthSeparatedEndpoints, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

const allEntityTypesConfig = [
    {
        type: 'oauth',
        field: 'oauth_jest_test',
        label: 'Not used',
        required: true,
        encrypted: false,
        options: {
            auth_type: ['basic', 'oauth', 'oauth_client_credentials'],
            oauth: [
                {
                    oauth_field: 'client_id',
                    label: 'Client Id',
                    field: 'client_id',
                    help: 'Enter the Client Id for this account.',
                    defaultValue: 'Client Id',
                },
                {
                    oauth_field: 'client_secret',
                    label: 'Client Secret',
                    field: 'client_secret',
                    encrypted: true,
                    help: 'Enter the Client Secret key for this account.',
                    defaultValue: 'Client Secret',
                },
                {
                    oauth_field: 'redirect_url',
                    label: 'Redirect url',
                    field: 'redirect_url',
                    help: 'Copy and paste this URL into your app.',
                    defaultValue: 'Redirect url',
                },
                {
                    oauth_field: 'endpoint_token',
                    label: 'Token endpoint',
                    field: 'endpoint_token',
                    help: 'Put here endpoint used for token acqusition ie. login.salesforce.com',
                },
                {
                    oauth_field: 'endpoint_authorize',
                    label: 'Authorize endpoint',
                    field: 'endpoint_authorize',
                    help: 'Put here endpoint used for authorization ie. login.salesforce.com',
                },
            ],
            basic: [
                {
                    oauth_field: 'some_text_jest_test',
                    label: 'some_text Token',
                    help: 'Enter some_text',
                    field: 'basic_oauth_text_jest_test',
                    options: {
                        disableonEdit: true,
                        enable: true,
                    },
                },
            ],
            oauth_client_credentials: [
                {
                    oauth_field: 'client_id_oauth_credentials',
                    defaultValue: 'Secret credentials Client Id',
                    label: 'Client Id',
                    field: 'client_id_oauth_credentials',
                    help: 'Enter the Client Id for this account.',
                },
                {
                    oauth_field: 'client_secret_oauth_credentials',
                    label: 'Client Secret',
                    field: 'client_secret_oauth_credentials',
                    defaultValue: 'Secret Client Secret',
                    encrypted: true,
                    help: 'Enter the Client Secret key for this account.',
                },
                {
                    oauth_field: 'endpoint_token_oauth_credentials',
                    label: 'Token endpoint',
                    field: 'endpoint_token_oauth_credentials',
                    help: 'Put here endpoint used for token acqusition ie. login.salesforce.com',
                },
                {
                    oauth_field: 'oauth_credentials_some_disabled_field',
                    label: 'Disabled field',
                    defaultValue: 'Disabled field value',
                    field: 'oauth_credentials_some_disabled_field',
                    help: 'Disabled field',
                    options: {
                        enable: false,
                    },
                },
            ],
            auth_code_endpoint: '/services/oauth2/authorize',
            access_token_endpoint: '/services/oauth2/token',
            oauth_timeout: 3000,
            oauth_state_enabled: true,
            display: true,
            disableonEdit: false,
            enable: true,
        },
    } satisfies z.infer<typeof oAuthEntitySchema>,
];

export const getConfigWithAllTypesOfOauth = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                title: globalConfig.pages.configuration?.title ?? '',
                tabs: [{ entity: allEntityTypesConfig, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};
