import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
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
} from './TestConfig';
import {
    ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN,
    ERROR_STATE_MISSING_TRY_AGAIN,
} from '../../constants/oAuthErrorMessage';
import { Mode } from '../../constants/modes';
import { StandardPages } from '../../types/components/shareableTypes';
import { server } from '../../mocks/server';
import { invariant } from '../../util/invariant';

describe('Oauth field disabled on edit - diableonEdit property', () => {
    const handleRequestClose = jest.fn();

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

    const getDisabledOauthField = () => document.querySelector('.oauth_oauth_text_jest_test input');

    const getDisabledBasicField = () => document.querySelector('.basic_oauth_text_jest_test input');

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
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledOauthField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).not.toHaveAttribute('disabled');
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
        } satisfies EntityModalProps;

        renderModalWithProps(props);

        const oauthTextBox = getDisabledOauthField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toHaveAttribute('disabled');
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
        } satisfies EntityModalProps;

        renderModalWithProps(props);

        const oauthTextBox = getDisabledBasicField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toHaveAttribute('disabled');
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
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledBasicField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).not.toHaveAttribute('disabled');
    });
});

describe('Options - Enable field property', () => {
    const handleRequestClose = jest.fn();

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

    const getDisabledOauthField = () => document.querySelector('.oauth_oauth_text_jest_test input');

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
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledOauthField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toHaveAttribute('disabled');
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
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledOauthField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).toHaveAttribute('disabled');
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
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const oauthTextBox = getDisabledOauthField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox).not.toHaveAttribute('disabled');
    });
});

describe('EntityModal - auth_endpoint_token_access_type', () => {
    const handleRequestClose = jest.fn();

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
        } satisfies EntityModalProps;

        renderModalWithProps(props);

        const cliendIdField = document.querySelector('.client_id input');
        expect(cliendIdField).toBeInTheDocument();

        const secretField = document.querySelector('.client_secret input');
        expect(secretField).toBeInTheDocument();

        const redirectField = document.querySelector('.redirect_url');
        expect(redirectField).toBeInTheDocument();

        if (cliendIdField) {
            await userEvent.type(cliendIdField, 'aaa');
        }
        if (secretField) {
            await userEvent.type(secretField, 'aaa');
        }

        const addButton = screen.getByText('Add');
        expect(addButton).toBeInTheDocument();

        const windowOpenSpy = jest.spyOn(window, 'open') as jest.Mock;

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
    const handleRequestClose = jest.fn();
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
    const handleRequestClose = jest.fn();
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
        } satisfies EntityModalProps;
        renderModalWithProps(props);
        const component = screen.getByRole('textbox');
        expect(component).toBeInTheDocument();
        expect(component).toHaveValue(DEFAULT_VALUE);
    });
});

describe('Oauth - separated endpoint authorization', () => {
    let handleRequestClose: jest.Mock<() => void>;

    beforeEach(() => {
        handleRequestClose = jest.fn();
    });

    const setUpConfigWithSeparatedEndpoints = () => {
        const newConfig = getConfigWithSeparatedEndpointsOAuth();
        setUnifiedConfig(newConfig);
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    const getFilledOauthFields = async () => {
        const endpointAuth = document.querySelector('.endpoint_authorize input');
        const endpointToken = document.querySelector('.endpoint_token input');

        if (endpointAuth) {
            await userEvent.type(endpointAuth, 'authendpoint');
        }
        if (endpointToken) {
            await userEvent.type(endpointToken, 'tokenendpoint');
        }
        return [endpointAuth, endpointToken];
    };

    const spyOnWindowOpen = async (addButton: HTMLElement) => {
        const windowOpenSpy = jest.spyOn(window, 'open') as jest.Mock;

        // mock opening verification window
        windowOpenSpy.mockImplementation((url) => {
            expect(url).toContain(
                'https://authendpoint/services/oauth2/authorize?response_type=code&client_id=Client%20Id&redirect_uri=http%3A%2F%2Flocalhost%2F'
            );
            expect(url).toContain('state=');
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
        const requestHandler = jest.fn();
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
        window.getMessage({ code, state: stateCodeFromUrl, error: undefined });

        await waitFor(async () => {
            expect(requestHandler).toHaveBeenCalledTimes(1);
        });

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
            redirect_uri: 'http://localhost/',
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
        window.getMessage({ code, state: passedState, error: undefined });

        expect(screen.getByText(ERROR_STATE_MISSING_TRY_AGAIN)).toBeInTheDocument();
    });
});
