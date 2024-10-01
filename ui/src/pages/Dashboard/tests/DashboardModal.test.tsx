import * as React from 'react';
import { render, waitFor } from '@testing-library/react';

import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';

import { DashboardModal } from '../DashboardModal';
import { DataIngestionModal } from '../DataIngestionModal';
import { MOCK_DS_MODAL_DEFINITION } from './mockData';

const handleClose = jest.fn();
const handleSelect = jest.fn();

describe('render data ingestion modal inputs', () => {
    it('render with all default modal dashboards element', async () => {
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
                    dashboardDefinition={MOCK_DS_MODAL_DEFINITION}
                    selectValueForDropdownInModal="source"
                    selectTitleForDropdownInModal="Source"
                />
            </DataIngestionModal>
        );

        await waitFor(() => {
            expect(
                document.querySelector('[data-input-id="data_ingestion_modal_time_window"]')
            ).toBeInTheDocument();
        });

        const idsToBeInDocument = [
            'data_ingestion_modal_dropdown',
            'data_ingestion_dropdown_label',
            'open_search_on_visualization',
            'done_button_footer',
        ];

        await waitFor(() => {
            idsToBeInDocument.forEach((id) => {
                const elementWithId = document.getElementById(id);
                expect(elementWithId).toBeInTheDocument();
            });
        });
    });
});
