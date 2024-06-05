import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import DashboardPage from '../DashboardPage';
import {
    MOCK_OVERVIEW_DEFINITION_JSON,
    MOCK_DATA_INGESTION_TAB_TAB_DEFINITION,
    MOCK_ERROR_TAB_DEFINITION,
} from '../tests/mockData';

const meta = {
    component: DashboardPage,
    title: 'DashboardPage',
    render: () => <DashboardPage />,
    parameters: {
        msw: {
            handlers: [
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
                http.get('/services/authentication/current-context', () => HttpResponse.error()),
            ],
        },
        snapshots: {
            width: 1200,
            height: 1200,
        },
    },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardPageView: Story = {};
