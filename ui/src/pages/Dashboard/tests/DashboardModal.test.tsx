import './mockMatchMediaForDashboardPage.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';

import { http, HttpResponse, RequestHandler } from 'msw';
import { consoleError } from '../../../../test.setup.ts';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';
import { server } from '../../../mocks/server';

import { DashboardModal } from '../DashboardModal';
import { DataIngestionModal } from '../DataIngestionModal';
import { MOCK_DS_MODAL_DEFINITION } from './mockData';
import { DASHBOARD_JSON_MOCKS } from './mockJs';

const handleClose = vi.fn();
const handleSelect = vi.fn();
describe('render data ingestion modal inputs', () => {
    beforeEach(() => {
        // not needed as for now there is onlt one test
        // but adding it for future tests

        // needed for dashabord greater than 28.1.0
        // type error is thrown if that one is not defined
        // it can be done via test.setup.ts but then it is applied to all tests
        // and it is causing issues with other tests
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

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
            expect(screen.getByTestId('input-title')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId('data_ingestion_modal_dropdown')).toBeInTheDocument();
        });

        const idsToBeInDocument = [
            'data_ingestion_modal_dropdown',
            'data_ingestion_dropdown_label',
            'open_search_on_visualization',
            'done_button_footer',
        ];

        await waitFor(() => {
            idsToBeInDocument.forEach((id) => {
                expect(screen.getByTestId(id)).toBeInTheDocument();
            });
        });
    });
});
