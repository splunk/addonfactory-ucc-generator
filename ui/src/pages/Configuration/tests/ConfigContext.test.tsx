import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { mockServerResponseWithContent } from '../../../mocks/server-response';
import { setUnifiedConfig } from '../../../util/util';
import ConfigurationPage from '../ConfigurationPage';
import { type meta as metaType } from '../../../types/globalConfig/meta';
import { CONFIG_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM } from './mockConfigs';

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

beforeEach(() => {
    server.use(
        http.get(`/servicesNS/nobody/-/:endpointUrl`, () =>
            HttpResponse.json(mockServerResponseWithContent)
        )
    );
});

function setup(meta: Partial<metaType>) {
    const globalConfigMock = CONFIG_PAGE_CONFIG_WITH_HIDDEN_ELEMENTS_FOR_PLATFORM;

    const newGlobalConfig = {
        ...globalConfigMock,
        meta: {
            ...globalConfigMock.meta,
            ...meta,
        },
    };

    setUnifiedConfig(newGlobalConfig);
    return render(<ConfigurationPage />, { wrapper: BrowserRouter });
}

it('should not display tabs on cloud', async () => {
    setup({ _uccVersion: undefined });

    const cloudTab = screen.queryByTestId('tab_hidden_for_cloud');
    expect(cloudTab).toBeNull();

    const enterprisetab = screen.queryByTestId('tab_hidden_for_enterprise');
    expect(enterprisetab).toBeNull();

    const cloudText = screen.queryByText('Tab hidden for cloud');
    expect(cloudText).toBeNull();

    await screen.findByText('Tab hidden for enterprise');
});

it('should not display fields in configuration form', async () => {
    setup({ _uccVersion: undefined });

    const addBtn = await screen.findByRole('button', { name: 'Add' });
    expect(addBtn).toBeInTheDocument();

    await userEvent.click(addBtn);

    const enterpriseInput = screen.queryByTestId('input_two_text_hidden_for_enterprise');
    expect(enterpriseInput).toBeNull();

    const cloudInput = screen.queryByTestId('input_two_text_hidden_for_cloud');
    expect(cloudInput).toBeNull();

    const cloudText = screen.queryByText('Text input hidden for cloud');
    expect(cloudText).toBeNull();

    await screen.findByText('Text input hidden for enterprise');
});
