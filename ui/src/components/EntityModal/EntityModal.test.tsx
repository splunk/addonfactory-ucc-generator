import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntityModal, { EntityModalProps } from './EntityModal';
import { setUnifiedConfig } from '../../util/util';
import {
    getConfigAccerssTokenMock,
    getConfigBasicOauthDisableonEdit,
    getConfigOauthOauthDisableonEdit,
} from './TestConfig';
import { ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN } from '../../constants/oAuthErrorMessage';

describe('EntityModal - Basic oauth', () => {
    const handleRequestClose = jest.fn();

    const setUpConfigWithDisabedBasicOauth = () => {
        setUnifiedConfig(getConfigBasicOauthDisableonEdit());
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    const getDisabledBasicField = () =>
        document.getElementsByClassName('basic_oauth_text_jest_test')[1];

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
        expect(oauthTextBox?.getAttribute('disabled')).toBeNull();
    });

    it('test if oauth field disabled on edit after disableonEdit true', async () => {
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
        expect(oauthTextBox?.getAttribute('disabled')).toBe('');
    });
});

describe('EntityModal - Oauth oauth', () => {
    const handleRequestClose = jest.fn();

    const setUpConfigWithDisabedOauth = () => {
        const newConfig = getConfigOauthOauthDisableonEdit();
        setUnifiedConfig(newConfig);
    };

    const renderModalWithProps = (props: EntityModalProps) => {
        render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
    };

    const getDisabledOauthField = () =>
        document.getElementsByClassName('oauth_oauth_text_jest_test')[1];

    it('Oauth Oauth - test if oauth field not disabled on create after disableonEdit', async () => {
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
        expect(oauthTextBox?.getAttribute('disabled')).toBeNull();
    });

    it('Oauth Oauth - test if oauth field disabled on edit after disableonEdit', async () => {
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
        expect(oauthTextBox?.getAttribute('disabled')).toBe('');
    });
});

describe('EntityModal - auth_endpoint_token_access_type', () => {
    const handleRequestClose = jest.fn();

    const setUpConfigWithDisabedOauth = () => {
        const newConfig = getConfigAccerssTokenMock();
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
