import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
} from './TestConfig';
import { ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN } from '../../constants/oAuthErrorMessage';

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

    const getDisabledOauthField = () =>
        document.getElementsByClassName('oauth_oauth_text_jest_test')[1];

    const getDisabledBasicField = () =>
        document.getElementsByClassName('basic_oauth_text_jest_test')[1];

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

    const getDisabledOauthField = () =>
        document.getElementsByClassName('oauth_oauth_text_jest_test')[1];

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

        const cliendIdField = document.querySelector('.client_id')?.querySelector('input');
        expect(cliendIdField).toBeInTheDocument();

        const secretField = document.querySelector('.client_secret')?.querySelector('input');
        expect(secretField).toBeInTheDocument();

        const redirectField = document.querySelector('.redirect_url');
        expect(redirectField).toBeInTheDocument();

        if (cliendIdField) {
            await userEvent.type(cliendIdField, 'aaa');
        }
        if (secretField) {
            await userEvent.type(secretField, 'aaa');
        }

        const addButton = await screen.getByText('Add');
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

    const setUpConfigWithWarningMessageForConfiguration = () => {
        const newConfig = getConfigWarningMessage();
        setUnifiedConfig(newConfig);
    };

    const setUpConfigWithWarningMessageForInputServices = () => {
        const newConfig = getConfigWarningMessage();
        setUnifiedConfig(newConfig);
    };

    const renderModal = (inputMode: string, page: string) => {
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
        ({ mode, page }: { mode: keyof typeof WARNING_MESSAGES; page: string }) => {
            if (page === 'configuration') {
                setUpConfigWithWarningMessageForConfiguration();
            } else {
                setUpConfigWithWarningMessageForInputServices();
            }
            renderModal(mode, page);

            const warningMessage = screen.getByText(WARNING_MESSAGES[mode]);
            expect(warningMessage).toBeInTheDocument();
        }
    );
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
