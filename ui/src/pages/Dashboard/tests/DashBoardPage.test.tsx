import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import './mockJs';
import DashboardPage from '../DashboardPage';
import { server } from '../../../mocks/server';
import {
    MOCK_OVERVIEW_DEFINITION_JSON,
    MOCK_DATA_INGESTION_TAB_TAB_DEFINITION,
    MOCK_ERROR_TAB_DEFINITION,
} from './mockData';

it('dashboard page renders waiting spinner', async () => {
    server.use(http.get('/custom/panels_to_display.json', () => HttpResponse.json({})));

    render(<DashboardPage />);

    const waitingSpinner = await screen.findByTestId('wait-spinner');
    expect(waitingSpinner).toBeInTheDocument();
});

it('render with all default dashboards', async () => {
    server.use(
        http.get('/custom/panels_to_display.json', () =>
            HttpResponse.json({ default: true, custom: false })
        ),
        http.get('/custom/overview_definition.json', () =>
            HttpResponse.json(MOCK_OVERVIEW_DEFINITION_JSON)
        ),
        http.get('/custom/data_ingestion_tab_definition.json', () =>
            HttpResponse.json(MOCK_DATA_INGESTION_TAB_TAB_DEFINITION)
        ),
        http.get('/custom/errors_tab_definition.json', () =>
            HttpResponse.json(MOCK_ERROR_TAB_DEFINITION)
        ),
        http.post('/services/search/jobs', () => HttpResponse.error()),
        http.get('/services/authentication/current-context', () => HttpResponse.error())
    );

    render(<DashboardPage />);
    const timeLabels = await screen.findAllByText('Time');
    expect(timeLabels[0]).toBeInTheDocument();

    const dataIngestionHeader = screen.getByText('Data ingestion');
    expect(dataIngestionHeader).toBeInTheDocument();

    const overviewInput = document.querySelector('[data-input-id="overview_input"]');
    expect(overviewInput).toBeInTheDocument();

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
