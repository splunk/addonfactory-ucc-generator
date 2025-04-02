import * as React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import InputPage from '../InputPage';
import { setUnifiedConfig } from '../../../util/util';
import { INPUT_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM } from './mockConfigs';

jest.mock('@splunk/search-job', () => ({
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
}));

function setup() {
    setUnifiedConfig(INPUT_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM);
    return render(<InputPage />, { wrapper: BrowserRouter });
}

it('Tabs not displayed on platform', async () => {
    setup();

    // there are more than 1 wait-spinner
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('wait-spinner').length > 0);

    const cloudTab = screen.queryByTestId('example_input_three');
    expect(cloudTab).toBeNull();
    const enterprisetab = screen.getByRole('tab', {
        name: /example input four hidden enterprise/i,
    });

    expect(enterprisetab).toBeInTheDocument();

    const cloudText = screen.queryByText('Example Input Three Hidden Cloud');
    expect(cloudText).toBeNull();

    const enterpriseText = await screen.findByText('Example Input Four Hidden Enterprise');
    expect(enterpriseText).toBeInTheDocument();
});

it('Fields not displayed on inputs form', async () => {
    setup();

    // there are more than 1 wait-spinner
    await waitForElementToBeRemoved(() => screen.queryAllByTestId('wait-spinner').length > 0);

    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toBeInTheDocument();

    await userEvent.click(addBtn);

    const enterpriseInput = screen
        .getAllByTestId('control-group')
        .find((el) => el.getAttribute('data-name') === 'input_two_text_hidden_for_enterprise');
    expect(enterpriseInput).toBeInTheDocument();

    const cloudInput = screen.queryByTestId('input_two_text_hidden_for_cloud');
    expect(cloudInput).toBeNull();

    const cloudText = screen.queryByText('Text input hidden for cloud');
    expect(cloudText).toBeNull();

    await screen.findByText('Text input hidden for enterprise');
});
