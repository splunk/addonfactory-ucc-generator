import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { z } from 'zod';
import EntityModal, { EntityModalProps } from './EntityModal';
import { setUnifiedConfig } from '../../util/util';
import {
    DEFAULT_VALUE,
    WARNING_MESSAGES,
    getConfigAccessTokenMock,
    getConfigBasicOauthDisableonEdit,
    getConfigEnableFalseForOauth,
    getConfigFullyEnabledField,
    getConfigOauthOauthDisableonEdit,
    getConfigWithOauthDefaultValue,
    getConfigWarningMessage,
    getConfigWithSeparatedEndpointsOAuth,
    getConfigWarningMessageAlwaysDisplay,
    WARNING_MESSAGES_ALWAYS_DISPLAY,
    getConfigWithAllTypesOfOauth,
    getConfigWithManyTypesInOauth,
} from './TestConfig';
import {
    ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN,
    ERROR_STATE_MISSING_TRY_AGAIN,
} from '../../constants/oAuthErrorMessage';
import { Mode } from '../../constants/modes';
import { StandardPages } from '../../types/components/shareableTypes';
import { server } from '../../mocks/server';
import { invariant } from '../../util/invariant';
import { oAuthFieldSchema } from '../../types/globalConfig/oAuth';

vi.mock('../../util/api', async () => ({
    ...(await vi.importActual('../../util/api')),
    postRequest: (await vi.importActual('../../util/__mocks__/mockApi')).postRequest,
}));

const getDisabledField = (fieldName: string) => {
    const elements = screen.getAllByTestId('text');
    const extractedFieldName = elements.find((element) => element.classList.contains(fieldName));
    expect(extractedFieldName).toBeTruthy();
    return within(extractedFieldName!).getByRole('textbox');
};

describe('Oauth field disabled on edit - diableonEdit property', () => {
    const handleRequestClose = vi.fn();

    const setUpConfigWithDisabedOauth = () => {
        const newConfig = getConfigOauthOauthDisableonEdit();
        setUnifiedConfig(newConfig);
    };

    const setUpConfigWithDisabedBasicOauth = () => {
        setUnifiedConfig(getConfigBasicOauthDisableonEdit());
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    it('Oauth Oauth - disableonEdit = true, oauth field not disabled on create', async () => {
        setUpConfigWithDisabedOauth();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledField('oauth_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyEnabled();
    });

    it('Oauth Oauth - disableonEdit = true, oauth field disabled on edit', async () => {
        setUpConfigWithDisabedOauth();
        const props = {
            serviceName: 'account',
            mode: 'edit',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;

        renderModalWithProps(props);

        const oauthTextBox = getDisabledField('oauth_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyDisabled();
    });

    it('Oauth Basic - Enable field equal false, so field disabled', async () => {
        setUpConfigWithDisabedBasicOauth();
        const props = {
            serviceName: 'account',
            mode: 'edit',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;

        renderModalWithProps(props);

        const oauthTextBox = getDisabledField('basic_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyDisabled();
    });

    it('if oauth field not disabled with create after disableonEdit true', async () => {
        setUpConfigWithDisabedBasicOauth();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledField('basic_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyEnabled();
    });
});

describe('Options - Enable field property', () => {
    const handleRequestClose = vi.fn();

    const setUpConfigWithDisabledComplitelyOauthField = () => {
        const newConfig = getConfigEnableFalseForOauth();
        setUnifiedConfig(newConfig);
    };

    const setUpConfigWithFullyEnabledField = () => {
        const newConfig = getConfigFullyEnabledField();
        setUnifiedConfig(newConfig);
    };

    const setUpConfigWithDisabledComplitelyOauthBasicField = () => {
        const newConfig = getConfigEnableFalseForOauth();
        setUnifiedConfig(newConfig);
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    it('Oauth Oauth - Enable field equal false, so field disabled', async () => {
        setUpConfigWithDisabledComplitelyOauthField();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledField('oauth_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyDisabled();
    });

    it('Oauth Basic - Enable field equal false, so field disabled', async () => {
        setUpConfigWithDisabledComplitelyOauthBasicField();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledField('oauth_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyDisabled();
    });

    it('Oauth Basic - Fully enabled field, enabled: true, disableonEdit: false', async () => {
        setUpConfigWithFullyEnabledField();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledField('oauth_oauth_text_jest_test');
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toBeVisuallyEnabled();
    });
});

describe('EntityModal - auth_endpoint_token_access_type', () => {
    const handleRequestClose = vi.fn();

    const setUpConfigWithDisabedOauth = () => {
        const newConfig = getConfigAccessTokenMock();
        setUnifiedConfig(newConfig);
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    it('open correct verification url with token_access_type', async () => {
        setUpConfigWithDisabedOauth();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;

        renderModalWithProps(props);

        const clientIdField = getDisabledField('client_id');
        expect(clientIdField).toBeInTheDocument();

        const secretField = getDisabledField('client_secret');
        expect(secretField).toBeInTheDocument();

        const redirectField = getDisabledField('redirect_url');
        expect(redirectField).toBeInTheDocument();

        if (clientIdField) {
            await userEvent.type(clientIdField, 'aaa');
        }
        if (secretField) {
            await userEvent.type(secretField, 'aaa');
        }

        const addButton = screen.getByText('Add');
        expect(addButton).toBeInTheDocument();

        const windowOpenSpy = vi.spyOn(window, 'open') as Mock;

        // mock opening verification window
        windowOpenSpy.mockImplementation((url) => {
            expect(url).toContain('token_access_type=offline');
            return { closed: true };
        });

        await userEvent.click(addButton);
        windowOpenSpy.mockRestore();

        // we return only { closed: true } and do not trigger message on window obj
        const errorMessage = screen.getByText(ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN);
        expect(errorMessage).toBeInTheDocument();
    });
});

describe('EntityModal - custom warning', () => {
    const handleRequestClose = vi.fn();
    const DEFAULT_MODE = 'create';
    const DEFAULT_PAGE = 'configuration';

    const setUpConfigWithWarningMessageForConfiguration = () => {
        const newConfig = getConfigWarningMessage();
        setUnifiedConfig(newConfig);
    };

    const setUpConfigWithWarningMessageForInputServices = () => {
        const newConfig = getConfigWarningMessage();
        setUnifiedConfig(newConfig);
    };

    const renderModal = (inputMode: Mode, page: StandardPages) => {
        const props = {
            serviceName: 'account',
            mode: inputMode,
            stanzaName: undefined,
            formLabel: 'formLabel',
            page,
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    it.each`
        mode        | page
        ${'create'} | ${'configuration'}
        ${'edit'}   | ${'configuration'}
        ${'clone'}  | ${'configuration'}
        ${'config'} | ${'configuration'}
        ${'create'} | ${'input'}
        ${'edit'}   | ${'input'}
        ${'clone'}  | ${'input'}
        ${'config'} | ${'input'}
    `(
        'display custom warning for $mode mode - $page tab',
        ({ mode, page }: { mode: keyof typeof WARNING_MESSAGES; page: StandardPages }) => {
            if (page === 'configuration') {
                setUpConfigWithWarningMessageForConfiguration();
            } else {
                setUpConfigWithWarningMessageForInputServices();
            }
            renderModal(mode, page);

            const warningMessage = screen.getByText(WARNING_MESSAGES[mode]?.message);
            expect(warningMessage).toBeInTheDocument();
        }
    );

    it('warning disappears after input change', async () => {
        setUpConfigWithWarningMessageForConfiguration();
        renderModal(DEFAULT_MODE, DEFAULT_PAGE);
        const warningMessage = screen.getByText(WARNING_MESSAGES[DEFAULT_MODE]?.message);
        expect(warningMessage).toBeInTheDocument();
        const anyInput = screen.getAllByRole('textbox');
        expect(anyInput[0]).toBeInTheDocument();

        if (anyInput[0]) {
            await userEvent.type(anyInput[0], 'aaa');
        }

        expect(warningMessage).not.toBeInTheDocument();
    });

    const setUpConfigWithWarningMessageAlwaysDisplayed = () => {
        const newConfig = getConfigWarningMessageAlwaysDisplay();
        setUnifiedConfig(newConfig);
    };

    it('warning always displayed', async () => {
        setUpConfigWithWarningMessageAlwaysDisplayed();
        renderModal(DEFAULT_MODE, DEFAULT_PAGE);
        const warningMessage = screen.getByText(
            WARNING_MESSAGES_ALWAYS_DISPLAY[DEFAULT_MODE]?.message
        );
        expect(warningMessage).toBeInTheDocument();
        const anyInput = screen.getAllByRole('textbox');
        expect(anyInput[0]).toBeInTheDocument();

        if (anyInput[0]) {
            await userEvent.type(anyInput[0], 'aaa');
        }
        expect(warningMessage).toBeInTheDocument();
    });
});

describe('Default value', () => {
    const handleRequestClose = vi.fn();
    const setUpConfigWithDefaultValue = () => {
        const newConfig = getConfigWithOauthDefaultValue();
        setUnifiedConfig(newConfig);
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    it('render modal with correct default value', async () => {
        setUpConfigWithDefaultValue();
        const props = {
            serviceName: 'account',
            mode: 'create',
            stanzaName: undefined,
            formLabel: 'formLabel',
            page: 'configuration',
            groupName: '',
            open: true,
            handleRequestClose: () => {},
            returnFocus: () => {},
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const component = screen.getByRole('textbox');
        expect(component).toBeInTheDocument();
        expect(component).toHaveValue(DEFAULT_VALUE);
    });
});

describe('Oauth - separated endpoint authorization', () => {
    let handleRequestClose: Mock<() => void>;

    beforeEach(() => {
        handleRequestClose = vi.fn();
    });

    const setUpConfigWithSeparatedEndpoints = () => {
        const newConfig = getConfigWithSeparatedEndpointsOAuth();
        setUnifiedConfig(newConfig);
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    const getFilledOauthFields = async () => {
        const endpointAuth = getDisabledField('endpoint_authorize');
        const endpointToken = getDisabledField('endpoint_token');

        if (endpointAuth) {
            await userEvent.type(endpointAuth, 'authendpoint');
        }
        if (endpointToken) {
            await userEvent.type(endpointToken, 'tokenendpoint');
        }
        return [endpointAuth, endpointToken];
    };

    const spyOnWindowOpen = async (addButton: HTMLElement) => {
        const windowOpenSpy = vi.spyOn(window, 'open') as Mock;
        vi.mock('uuid', () => ({ v4: () => '123456789' }));

        // mock opening verification window
        windowOpenSpy.mockImplementation((url) => {
            expect(url).toContain(
                'https://authendpoint/services/oauth2/authorize?response_type=code&client_id=Client%20Id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F'
            );
            expect(url).toContain('state=123456789');
            return { closed: true };
        });

        await userEvent.click(addButton);

        return windowOpenSpy;
    };

    const props = {
        serviceName: 'account',
        mode: 'create',
        stanzaName: undefined,
        formLabel: 'formLabel',
        page: 'configuration',
        groupName: '',
        open: true,
        handleRequestClose: () => {},
        returnFocus: () => {},
    } satisfies EntityModalProps;

    it('render modal with separated oauth fields', async () => {
        setUpConfigWithSeparatedEndpoints();
        renderModalWithProps(props);

        const [endpointAuth, endpointToken] = await getFilledOauthFields();

        expect(endpointAuth).toBeInTheDocument();
        expect(endpointAuth).toHaveValue('authendpoint');
        expect(endpointToken).toBeInTheDocument();
        expect(endpointToken).toHaveValue('tokenendpoint');
    });

    it('check if correct authorization endpoint called', async () => {
        setUpConfigWithSeparatedEndpoints();
        renderModalWithProps(props);

        await getFilledOauthFields();

        const addButton = screen.getByRole('button', { name: /add/i });
        expect(addButton).toBeInTheDocument();

        await spyOnWindowOpen(addButton);
    });

    it('check if correct auth token endpoint created', async () => {
        const requestHandler = vi.fn();

        server.use(
            http.post('/servicesNS/nobody/-/demo_addon_for_splunk_oauth/oauth', ({ request }) => {
                requestHandler(request);
                return new HttpResponse(null, { status: 200 });
            })
        );
        setUpConfigWithSeparatedEndpoints();
        renderModalWithProps(props);

        await getFilledOauthFields();
        const addButton = screen.getByRole('button', { name: /add/i });

        const openFn = await spyOnWindowOpen(addButton);

        expect(openFn).toHaveBeenCalled();
        const url = new URL(openFn.mock.calls[0][0]);
        const stateCodeFromUrl = url.searchParams.get('state');
        invariant(stateCodeFromUrl, 'State code is not present in the url');

        // triggering manually external oauth window behaviour after success authorization
        const code = '200';
        await act(async () => {
            window.getMessage({ code, state: stateCodeFromUrl, error: undefined });
        });

        expect(requestHandler).toHaveBeenCalledTimes(1);

        const receivedRequest: Request = requestHandler.mock.calls[0][0];
        const receivedBody = await receivedRequest.text();

        const params = new URLSearchParams(receivedBody);
        const receivedParsedBodyParams: Record<string, string> = {};

        params.forEach((value, key) => {
            receivedParsedBodyParams[key] = value;
        });

        expect(receivedParsedBodyParams).toMatchObject({
            method: 'POST',
            url: 'https://tokenendpoint/services/oauth2/token',
            grant_type: 'authorization_code',
            client_id: 'Client Id',
            client_secret: 'Client Secret',
            code,
            redirect_uri: 'http://localhost:3000/',
        });
    });

    it('should throw error if state value mismatch', async () => {
        setUpConfigWithSeparatedEndpoints();
        renderModalWithProps(props);

        await getFilledOauthFields();
        const addButton = screen.getByRole('button', { name: /add/i });

        const openFn = await spyOnWindowOpen(addButton);

        expect(openFn).toHaveBeenCalled();
        const url = new URL(openFn.mock.calls[0][0]);
        const stateCodeFromUrl = url.searchParams.get('state');

        // triggering manually external oauth window behaviour after success authorization
        const code = '200';
        const passedState = `tests${stateCodeFromUrl}`;
        await act(async () => {
            window.getMessage({ code, state: passedState, error: undefined });
        });

        expect(screen.getByText(ERROR_STATE_MISSING_TRY_AGAIN)).toBeInTheDocument();
    });
});

describe('Oauth2 - client credentials', () => {
    const props = {
        serviceName: 'account',
        mode: 'create',
        stanzaName: undefined,
        formLabel: 'formLabel',
        page: 'configuration',
        groupName: '',
        open: true,
        handleRequestClose: () => {},
        returnFocus: () => {},
    } satisfies EntityModalProps;

    let handleRequestClose: Mock<() => void>;

    beforeEach(() => {
        handleRequestClose = vi.fn();
    });

    const getOauthFields = (oauthCredsFields: Array<z.infer<typeof oAuthFieldSchema>>) => {
        return oauthCredsFields.map((field) => {
            const oauthField = screen.getByRole('textbox', {
                name: field.label,
            });
            expect(oauthField).toBeInTheDocument();
            return { ...field, component: oauthField };
        });
    };

    const setUpConfigAllOauth = () => {
        const newConfig = getConfigWithAllTypesOfOauth();
        setUnifiedConfig(newConfig);
        return newConfig;
    };

    const setUpConfigManyTypesInOauth = () => {
        const newConfig = getConfigWithManyTypesInOauth();
        setUnifiedConfig(newConfig);
        return newConfig;
    };

    const renderModalWithProps = () => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    it('Oauth client credentials - check if correctly renders', async () => {
        const usedConfig = setUpConfigAllOauth();
        renderModalWithProps();

        const oauthEntity = usedConfig.pages.configuration.tabs[0].entity.find(
            (field) => field.type === 'oauth'
        );

        const oauthCredsFields = oauthEntity?.options.oauth_client_credentials;

        const oauthSelector = screen.getByRole('combobox', {
            name: 'Auth Type',
        });
        expect(oauthSelector).toBeInTheDocument();

        expect(oauthSelector).toHaveAttribute('data-test-value', 'basic');

        const user = userEvent.setup();

        await user.click(oauthSelector);

        const oauthClientCredentials = screen.getByRole('option', {
            name: 'OAuth 2.0 - Client Credentials Grant Type',
        });
        expect(oauthClientCredentials).toBeInTheDocument();

        await user.click(oauthClientCredentials);
        expect(oauthSelector).toHaveAttribute('data-test-value', 'oauth_client_credentials');

        invariant(oauthCredsFields, 'Oauth client credentials fields are not present');

        const oauthFields = getOauthFields(oauthCredsFields);

        const [oauthField1, oauthField2, oauthField3, oauthField4] = oauthFields;
        expect(oauthField1.component).toHaveValue(String(oauthField1.defaultValue));

        expect(oauthField2.component).toHaveValue(String(oauthField2.defaultValue));
        expect(oauthField3.component).toHaveValue('');

        expect(oauthField4.component).toHaveValue(String(oauthField4.defaultValue));
        expect(oauthField4.component).toHaveAttribute('readonly');
    });

    it('Oauth client credentials - check if correctly sends data', async () => {
        const requestHandler = vi.fn();
        server.use(
            http.post(
                '/servicesNS/nobody/-/demo_addon_for_splunk_account?output_mode=json',
                async ({ request }) => {
                    const info = await request.formData();
                    const accumulator: Record<string, string> = {};
                    info.forEach((value, key) => {
                        accumulator[key] = String(value);
                    });

                    requestHandler(accumulator);

                    const res = HttpResponse.json({ entry: [accumulator] }, { status: 200 });
                    return res;
                }
            )
        );

        const usedConfig = setUpConfigAllOauth();
        renderModalWithProps();

        const oauthEntity = usedConfig.pages.configuration.tabs[0].entity.find(
            (field) => field.type === 'oauth'
        );

        const oauthCredsFields = oauthEntity?.options.oauth_client_credentials;

        const oauthSelector = screen.getByRole('combobox', {
            name: 'Auth Type',
        });
        expect(oauthSelector).toBeInTheDocument();

        const user = userEvent.setup();

        await user.click(oauthSelector);

        const oauthClientCredentials = screen.getByRole('option', {
            name: 'OAuth 2.0 - Client Credentials Grant Type',
        });
        expect(oauthClientCredentials).toBeInTheDocument();

        await user.click(oauthClientCredentials);

        invariant(oauthCredsFields, 'Oauth client credentials fields are not present');
        const oauthFields = getOauthFields(oauthCredsFields);

        const [oauthField1, oauthField2, oauthField3, oauthField4] = oauthFields;

        await user.type(oauthField1.component, 'Client Id - filled');
        await user.type(oauthField2.component, 'Secret Client Secret - filled');
        await user.type(oauthField3.component, 'Client Token - filled');

        await user.type(oauthField4.component, 'Disabled - filled');
        // no effect executed as field is disabled
        expect(oauthField4.component).toHaveValue(String(oauthField4.defaultValue));

        const addButton = screen.getByRole('button', { name: /add/i });
        expect(addButton).toBeInTheDocument();

        await user.click(addButton);

        expect(requestHandler).toHaveBeenCalledTimes(1);

        expect(requestHandler).toHaveBeenCalledWith({
            auth_type: 'oauth_client_credentials',
            basic_oauth_text_jest_test: '',
            client_id: '',
            client_id_oauth_credentials: 'Secret credentials Client IdClient Id - filled',
            client_secret: '',
            client_secret_oauth_credentials: 'Secret Client SecretSecret Client Secret - filled',
            endpoint_authorize: '',
            endpoint_token: '',
            endpoint_token_oauth_credentials: 'Client Token - filled',
            oauth_credentials_some_disabled_field: 'Disabled field value',
        });

        await waitFor(() => {
            expect(handleRequestClose).toHaveBeenCalled();
        });
    });

    it('Ouath with many types of inputs - check if correctly renders', async () => {
        setUpConfigManyTypesInOauth();
        renderModalWithProps();
        const user = userEvent.setup();

        const oauthSelector = screen.getByRole('combobox', {
            name: 'Auth Type',
        });

        const selectOauthBasic = screen.getByRole('combobox', {
            name: 'Basic Oauth select',
        });

        const radioOauthBasic = screen.getByRole('radiogroup', {
            name: 'Basic Oauth radio',
        });

        const textAreaOauthBasic = screen.getByRole('textbox', {
            name: 'Basic Oauth text area',
        });

        expect(oauthSelector).toBeInTheDocument();
        expect(selectOauthBasic).toBeInTheDocument();
        expect(radioOauthBasic).toBeInTheDocument();
        expect(textAreaOauthBasic).toBeInTheDocument();

        const middleOptionRadio = within(radioOauthBasic).getByRole('radio', {
            name: 'Middle',
        });

        await user.click(middleOptionRadio);

        expect(radioOauthBasic).toHaveAttribute('data-test-value', 'middle');

        await user.click(selectOauthBasic);
        const basicOauthOption = screen.getByRole('option', {
            name: 'Option 2',
        });
        await user.click(basicOauthOption);
        expect(selectOauthBasic).toHaveAttribute('data-test-value', 'option2');

        await user.type(
            textAreaOauthBasic,
            `Text area value
multiplce lines
last line`
        );

        expect(textAreaOauthBasic).toHaveValue('Text area value\nmultiplce lines\nlast line');
    });

    it('Ouath with many types of inputs hiddes elements when Oauth 2.0 selected', async () => {
        setUpConfigManyTypesInOauth();
        renderModalWithProps();
        const user = userEvent.setup();

        const oauthSelector = screen.getByRole('combobox', {
            name: 'Auth Type',
        });

        expect(oauthSelector).toBeInTheDocument();
        expect(
            screen.getByRole('combobox', {
                name: 'Basic Oauth select',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radiogroup', {
                name: 'Basic Oauth radio',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', {
                name: 'Basic Oauth text area',
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('textbox', {
                name: 'Client Id',
            })
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole('textbox', {
                name: 'Client Secret',
            })
        ).not.toBeInTheDocument();

        await user.click(oauthSelector);

        const oauthClientCredentials = screen.getByRole('option', {
            name: 'OAuth 2.0 - Authorization Code Grant Type',
        });
        await user.click(oauthClientCredentials);

        expect(
            screen.getByRole('combobox', {
                name: 'Auth Type',
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('combobox', {
                name: 'Basic Oauth select',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('radiogroup', {
                name: 'Basic Oauth radio',
            })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('textbox', {
                name: 'Basic Oauth text area',
            })
        ).not.toBeInTheDocument();
    });
});
