import { z } from 'zod';
import { TabSchema } from '../../types/globalConfig/pages';
import { OAuthEntity } from '../../types/globalConfig/entities';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { GlobalConfigSchema } from '../../types/globalConfig/globalConfig';

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
    } satisfies z.infer<typeof OAuthEntity>,
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
    } satisfies z.infer<typeof OAuthEntity>,
];

export const getConfigBasicOauthDisableonEdit = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
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
    } satisfies z.infer<typeof OAuthEntity>,
];

export const getConfigAccerssTokenMock = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
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
    } satisfies z.infer<typeof OAuthEntity>,
];

export const getConfigEnableFalseForOauth = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                tabs: [{ entity: entityEnableFalseForOauthField, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

export const getConfigEnableFalseForOauthBasic = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                tabs: [{ entity: entityEnableFalseForOauthField, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};

const entityEnableFalseForBasicOauthField = [
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
    } satisfies z.infer<typeof OAuthEntity>,
];

export const getConfigEnableTrueForOauthBasic = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                tabs: [{ entity: entityEnableFalseForBasicOauthField, ...defaultTableProps }],
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
    } satisfies z.infer<typeof OAuthEntity>,
];

export const getConfigFullyEnabledField = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
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
    } satisfies z.infer<typeof OAuthEntity>,
];

export const getConfigWithOauthDefaultValue = () => {
    const globalConfig = getGlobalConfigMock();
    const newConfig = {
        ...globalConfig,
        pages: {
            ...globalConfig.pages,
            configuration: {
                ...globalConfig.pages.configuration,
                tabs: [{ entity: entityBasicOauthDefaultValue, ...defaultTableProps }],
            },
        },
    };
    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};
