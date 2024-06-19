import { render, screen } from '@testing-library/react';
import React from 'react';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';
import BaseFormView from './BaseFormView';
import { getBuildDirPath } from '../../util/script';
import mockCustomControlMockForTest from '../CustomControl/CustomControlMockForTest';
import { getGlobalConfigMockCustomControl } from './BaseFormConfigMock';

const handleFormSubmit = jest.fn();

const PAGE_CONF = 'configuration';
const SERVICE_NAME = 'account';
const STANZA_NAME = 'stanzaName';
const CUSTOM_MODULE = 'CustomControl';

it('should render base form correctly with name and File fields', async () => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);

    render(
        <BaseFormView
            page={PAGE_CONF}
            stanzaName={STANZA_NAME}
            serviceName={SERVICE_NAME}
            mode="create"
            currentServiceState={{}}
            handleFormSubmit={handleFormSubmit}
        />
    );

    const nameField = document.querySelector('[data-name="name"]');
    expect(nameField).toBeInTheDocument();

    const fileField = document.querySelector('[data-name="name"]');
    expect(fileField).toBeInTheDocument();
});

it('should pass default values to custom component correctly', async () => {
    const mockConfig = getGlobalConfigMockCustomControl();
    setUnifiedConfig(mockConfig);

    jest.mock(
        `${getBuildDirPath()}/custom/${CUSTOM_MODULE}.js`,
        () => mockCustomControlMockForTest,
        {
            virtual: true,
        }
    );

    render(
        <BaseFormView
            page={PAGE_CONF}
            stanzaName={STANZA_NAME}
            serviceName={SERVICE_NAME}
            mode="config"
            currentServiceState={{
                custom_control_field: 'input_three',
                name: 'some_unique_name',
            }}
            handleFormSubmit={handleFormSubmit}
        />
    );
    const customModal = await screen.findByTestId('customSelect');
    expect(customModal).toBeInTheDocument();

    expect((customModal as HTMLSelectElement)?.value).toEqual('input_three');
});
