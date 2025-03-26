import { expect, it } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse, RequestHandler } from 'msw';

import DashboardPage from '../DashboardPage';
import { server } from '../../../mocks/server';

import { DASHBOARD_JSON_MOCKS } from './mockJs';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';
// import { consoleError } from '../../../../test.setup.ts';

it('dashboard page renders waiting spinner', async () => {
    server.use(http.get('/custom/panels_to_display.json', () => HttpResponse.json({})));
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);

    render(<DashboardPage />);

    const waitingSpinner = await screen.findByTestId('wait-spinner');
    expect(waitingSpinner).toBeInTheDocument();
});

it('render with all default dashboards', async () => {
    // consoleError.mockImplementation(() => {});
    DASHBOARD_JSON_MOCKS.forEach((mock: RequestHandler) => server.use(mock));

    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);
    render(<DashboardPage />);

    const timeLabels = await screen.findAllByText('Time');
    expect(timeLabels[0]).toBeInTheDocument();
    expect(timeLabels.length).toEqual(2);

    const dataIngestionHeader = screen.getByRole('heading', { name: /data ingestion/i });
    expect(dataIngestionHeader).toBeInTheDocument();

    const idsToBeInDocument = [
        'dashboardTable',
        'data_ingestion_search',
        'data_ingestion_search_label',
        'info_message_for_data_ingestion',
    ];

    idsToBeInDocument.forEach((id) => {
        const elementWithId = screen.getByTestId(id);
        expect(elementWithId).toBeInTheDocument();
    });

    const dataInputIdsToBeInDocument = [
        'overview_input',
        'data_ingestion_input',
        'data_ingestion_table_input',
    ];

    dataInputIdsToBeInDocument.forEach((dataId) => {
        const elementWithId = screen
            .getAllByTestId('input-item')
            .find((el) => el.getAttribute('data-input-id') === dataId);

        expect(elementWithId).toBeInTheDocument();
    });
});
