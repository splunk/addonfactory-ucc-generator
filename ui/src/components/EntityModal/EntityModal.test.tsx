import React from 'react';
import { render } from '@testing-library/react';
import EntityModal, { EntityModalProps } from './EntityModal';
import { setUnifiedConfig } from '../../util/util';
import {
    EverythingConfig,
    configBasicOauthDisableonEdit,
    configOauthOauthDisableonEdit,
} from './TestConfig';

describe('EntityModal - Basic oauth', () => {
    const handleRequestClose = jest.fn();

    const setUpConfigWithDisabedBasicOauth = () => {
        const newConfig = {
            ...EverythingConfig,
            pages: {
                ...EverythingConfig.pages,
                configuration: {
                    ...EverythingConfig.pages.configuration,
                    tabs: [configBasicOauthDisableonEdit],
                },
            },
        };
        setUnifiedConfig(newConfig);
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
        };
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
        };

        renderModalWithProps(props);

        const oauthTextBox = getDisabledBasicField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox?.getAttribute('disabled')).toBe('');
    });
});

describe('EntityModal - Oauth oauth', () => {
    const handleRequestClose = jest.fn();

    const setUpConfigWithDisabedOauth = () => {
        const newConfig = {
            ...EverythingConfig,
            pages: {
                ...EverythingConfig.pages,
                configuration: {
                    ...EverythingConfig.pages.configuration,
                    tabs: [configOauthOauthDisableonEdit],
                },
            },
        };
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
        };
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
        };

        renderModalWithProps(props);

        const oauthTextBox = getDisabledOauthField();
        expect(oauthTextBox).toBeInTheDocument();
        expect(oauthTextBox?.getAttribute('disabled')).toBe('');
    });
});
