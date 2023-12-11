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
