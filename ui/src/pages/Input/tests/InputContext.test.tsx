import { vi } from 'vitest';
import * as React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import InputPage from '../InputPage';
import { setUnifiedConfig } from '../../../util/util';
import { INPUT_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM } from './mockConfigs';

vi.mock('@splunk/search-job', () => ({
    default: {
        create: () => ({
            getResults: () => ({
                subscribe: (
                    callbackFunction: (params: { results: { instance_type: string }[] }) => void
                ) => {
                    callbackFunction({ results: [{ instance_type: 'cloud' }] });
                    return { unsubscribe: () => {} };
                },
            }),
        }),
    },
}));
const componentsRegistry = {
    'DatePickerInput': {
        'component': MyCustomReactComponent
    },
    'RowExpansion': {
        'component': MyCustomRowExpantionReactComponent
    }
}

function MyCustomReactComponent() {
    const { field, value, setValue } = useUCCInput();

    return <input type="date" value={value} onChange={setvalue} />
}


it('Tabs not displayed on platform', async () => {
    setUnifiedConfig(INPUT_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM);

    render(<InputPage />, { wrapper: BrowserRouter });
    await waitForElementToBeRemoved(() => document.querySelector('[data-test="wait-spinner"]'));

    const cloudTab = document.querySelector('[data-test-tab-id="example_input_three"]');
    expect(cloudTab).toBeNull();

    const enterprisetab = document.querySelector('[data-test-tab-id="example_input_four"]');
    expect(enterprisetab).toBeInTheDocument();

    const cloudText = await screen.queryByText('Example Input Three Hidden Cloud');
    expect(cloudText).toBeNull();

    const enterpriseText = await screen.findByText('Example Input Four Hidden Enterprise');
    expect(enterpriseText).toBeInTheDocument();
});

it('Fields not displayed on inputs form', async () => {
    setUnifiedConfig(INPUT_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM);

    render(<InputPage />, { wrapper: BrowserRouter });
    await waitForElementToBeRemoved(() => document.querySelector('[data-test="wait-spinner"]'));

    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toBeInTheDocument();

    await userEvent.click(addBtn);

    const enterpriseInput = document.querySelector(
        '[data-name="input_two_text_hidden_for_enterprise"]'
    );
    expect(enterpriseInput).toBeInTheDocument();

    const cloudInput = document.querySelector('[data-name="input_two_text_hidden_for_cloud"]');
    expect(cloudInput).toBeNull();

    const cloudText = await screen.queryByText('Text input hidden for cloud');
    expect(cloudText).toBeNull();

    const enterprisetext = await screen.findByText('Text input hidden for enterprise');
    expect(enterprisetext).toBeInTheDocument();
});
