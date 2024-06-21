import { http, HttpResponse } from 'msw';
import {
    MOCK_OVERVIEW_DEFINITION_JSON,
    MOCK_DATA_INGESTION_TAB_TAB_DEFINITION,
    MOCK_ERROR_TAB_DEFINITION,
} from './mockData';

export const DASHBOARD_JSON_MOCKS = [
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
    http.get('/custom/resources_tab_definition.json', () =>
        HttpResponse.json(MOCK_ERROR_TAB_DEFINITION)
    ),
    http.post('/services/search/jobs', () => HttpResponse.error()),
    http.get('/services/authentication/current-context', () => HttpResponse.error()),
];
