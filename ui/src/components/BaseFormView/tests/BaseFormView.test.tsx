import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { getBuildDirPath } from '../../../util/script';
import { setUnifiedConfig } from '../../../util/util';
import {
    getGlobalConfigMockCustomControl,
    getGlobalConfigMockGroupsForInputPage,
    getGlobalConfigMockGroupsForConfigPage,
} from '../BaseFormConfigMock';
import mockCustomControlMockForTest from '../../CustomControl/CustomControlMockForTest';
import BaseFormView from '../BaseFormView';

const handleFormSubmit = jest.fn();

const PAGE_CONF = 'configuration';
const SERVICE_NAME = 'account';
const STANZA_NAME = 'stanzaName';
const CUSTOM_MODULE = 'CustomControl';

const getElementsByGroup = (group: string) => {
    const firstField = screen.queryByText(`Text 1 Group ${group}`);
    const secondField = screen.queryByText(`Text 2 Group ${group}`);
    return { firstField, secondField };
};
const verifyDisplayedGroup = (group: string) => {
    const { firstField, secondField } = getElementsByGroup(group);
    expect(firstField).toBeInTheDocument();
    expect(secondField).toBeInTheDocument();
};
const verifyNotDisplayedElement = (group: string) => {
    const { firstField, secondField } = getElementsByGroup(group);
    expect(firstField).not.toBeInTheDocument();
    expect(secondField).not.toBeInTheDocument();
};

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

it.each([
    {
        page: 'configuration' as const,
        config: getGlobalConfigMockGroupsForConfigPage(),
        service: 'account',
    },
    {
        page: 'inputs' as const,
        config: getGlobalConfigMockGroupsForInputPage(),
        service: 'demo_input',
    },
])('entities grouping for page works properly %s', async ({ config, page, service }) => {
    setUnifiedConfig(config);

    render(
        <BaseFormView
            page={page}
            stanzaName={STANZA_NAME}
            serviceName={service}
            mode="create"
            currentServiceState={{}}
            handleFormSubmit={handleFormSubmit}
        />
    );
    const group1Header = await screen.findByText('Group 1', { exact: true });

    const group2Header = await screen.findByRole('button', { name: 'Group 2' });

    const group3Header = await screen.findByRole('button', { name: 'Group 3' });

    verifyDisplayedGroup('1');
    verifyDisplayedGroup('2');
    verifyNotDisplayedElement('3'); // group 3 is not expanded by default

    expect(group3Header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(group3Header);
    verifyDisplayedGroup('3');
    expect(group3Header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(group1Header); // does not change anything
    verifyDisplayedGroup('1');

    expect(group2Header).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(group2Header);
    expect(group2Header).toHaveAttribute('aria-expanded', 'false');

    /**
     * verifying aria-expanded attribute as in tests
     * child elements are not removed from the DOM
     * they are removed in browser
     * todo: verify behaviour
     */
    await userEvent.click(group2Header);
    verifyDisplayedGroup('1');
    verifyDisplayedGroup('2');
    verifyDisplayedGroup('3'); // after modifications all groups should be displayed
});
