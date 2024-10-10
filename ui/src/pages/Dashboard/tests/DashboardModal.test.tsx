import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';

import { http, HttpResponse, RequestHandler } from 'msw';
import { consoleError } from '../../../../jest.setup';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';
import { server } from '../../../mocks/server';

import { DashboardModal } from '../DashboardModal';
import { DataIngestionModal } from '../DataIngestionModal';
import { MOCK_DS_MODAL_DEFINITION } from './mockData';
import { DASHBOARD_JSON_MOCKS } from './mockJs';

const handleClose = jest.fn();
const handleSelect = jest.fn();

describe('render data ingestion modal inputs', () => {
    it('renders with all default modal dashboard elements', async () => {
        consoleError.mockImplementation(() => {});
        server.use(
            http.get('/custom/data_ingestion_modal_definition.json', () =>
                HttpResponse.json(MOCK_DS_MODAL_DEFINITION)
            )
        );

        DASHBOARD_JSON_MOCKS.forEach((mock: RequestHandler) => server.use(mock));

        const mockConfig = getGlobalConfigMock();
        setUnifiedConfig(mockConfig);

        render(
            <DataIngestionModal
                handleRequestClose={handleClose}
                dataIngestionDropdownValues={[{ label: 'source', value: 'source' }]}
                selectValueForDropdownInModal="source"
                setSelectValueForDropdownInModal={handleSelect}
                open
                title="Source Type"
            >
                <DashboardModal
                    selectValueForDropdownInModal="source"
                    selectTitleForDropdownInModal="Source"
                    setDataIngestionDropdownValues={handleSelect}
                />
            </DataIngestionModal>
        );

        const modal = await screen.findByTestId('modal');
        expect(modal).toBeInTheDocument();

        // Wait for dropdown to be rendered
        await waitFor(() => {
            expect(document.querySelector('[data-test="input-title"]')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(document.querySelector('#data_ingestion_modal_dropdown')).toBeInTheDocument();
        });

        const idsToBeInDocument = [
            'data_ingestion_modal_dropdown',
            'data_ingestion_dropdown_label',
            'open_search_on_visualization',
            'done_button_footer',
        ];

        await waitFor(() => {
            idsToBeInDocument.forEach((id) => {
                const element = document.getElementById(id);
                expect(element).toBeInTheDocument();
            });
        });
    });
});
