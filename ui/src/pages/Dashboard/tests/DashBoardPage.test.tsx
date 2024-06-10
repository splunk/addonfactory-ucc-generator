import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse, RequestHandler } from 'msw';

import DashboardPage from '../DashboardPage';
import { server } from '../../../mocks/server';

import { DASHBOARD_JSON_MOCKS } from './mockJs';

it('dashboard page renders waiting spinner', async () => {
    server.use(http.get('/custom/panels_to_display.json', () => HttpResponse.json({})));

    render(<DashboardPage />);

    const waitingSpinner = await screen.findByTestId('wait-spinner');
    expect(waitingSpinner).toBeInTheDocument();
});

it('render with all default dashboards', async () => {
    DASHBOARD_JSON_MOCKS.forEach((mock: RequestHandler) => server.use(mock));
    render(<DashboardPage />);
    const timeLabels = await screen.findAllByText('Time');
    expect(timeLabels[0]).toBeInTheDocument();
    expect(timeLabels.length).toEqual(2);

    const dataIngestionHeader = screen.getByText('Data ingestion');
    expect(dataIngestionHeader).toBeInTheDocument();

    const idsToBeInDocument = [
        'dashboardTable',
        'data_ingestion_search',
        'data_ingestion_search_label',
        'info_message_for_data_ingestion',
    ];

    idsToBeInDocument.forEach((id) => {
        const elementWithId = document.querySelector(`#${id}`);
        expect(elementWithId).toBeInTheDocument();
    });

    const dataInputIdsToBeInDocument = [
        'overview_input',
        'data_ingestion_input',
        'data_ingestion_table_input',
    ];

    dataInputIdsToBeInDocument.forEach((dataId) => {
        const elementWithId = document.querySelector(`[data-input-id="${dataId}"]`);
        expect(elementWithId).toBeInTheDocument();
    });
});
