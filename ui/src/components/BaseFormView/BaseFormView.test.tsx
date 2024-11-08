import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';
import BaseFormView from './BaseFormView';
import { getBuildDirPath } from '../../util/script';
import mockCustomControlMockForTest from '../CustomControl/CustomControlMockForTest';
import {
    getGlobalConfigMockCustomControl,
    getGlobalConfigMockGroupsForConfigPage,
} from './BaseFormConfigMock';

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

it('entities grouping for config page works properly', async () => {
    const mockConfig = getGlobalConfigMockGroupsForConfigPage();
    setUnifiedConfig(mockConfig);

    const getElementsByGroup = (group: string) => {
        const firstField = screen.queryByText(`Text 1 Group ${group}`);
        const secondField = screen.queryByText(`Text 2 Group ${group}`);
        return { firstField, secondField };
    };

    const verfyDisplayedElement = (group: string) => {
        const { firstField, secondField } = getElementsByGroup(group);
        expect(firstField).toBeInTheDocument();
        expect(secondField).toBeInTheDocument();
    };

    const verifyNotDisplayedElement = (group: string) => {
        const { firstField, secondField } = getElementsByGroup(group);
        expect(firstField).not.toBeInTheDocument();
        expect(secondField).not.toBeInTheDocument();
    };

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

    const group1Header = await screen.findByText('Group 1', { exact: true });
    expect(group1Header).toBeInTheDocument();
    const group2Header = await screen.findByRole('button', { name: 'Group 2' });
    expect(group2Header).toBeInTheDocument();
    const group3Header = await screen.findByRole('button', { name: 'Group 3' });
    expect(group3Header).toBeInTheDocument();

    verfyDisplayedElement('1');
    verfyDisplayedElement('2');
    verifyNotDisplayedElement('3'); // group 3 is not expanded by default

    expect(group3Header.getAttribute('aria-expanded')).toEqual('false');
    await userEvent.click(group3Header);
    verfyDisplayedElement('3');
    expect(group3Header.getAttribute('aria-expanded')).toEqual('true');

    await userEvent.click(group1Header); // does not change anything
    verfyDisplayedElement('1');

    expect(group2Header.getAttribute('aria-expanded')).toEqual('true');
    await userEvent.click(group2Header);
    expect(group2Header.getAttribute('aria-expanded')).toEqual('false');
    /**
     * verifying aria-expanded attribute as in tests
     * child elements are not removed from the DOM
     * they are removed in browser
     * todo: verify behaviour
     */

    await userEvent.click(group2Header);

    verfyDisplayedElement('1');
    verfyDisplayedElement('2');
    verfyDisplayedElement('3'); // after modifications all groups should be displayed
});
