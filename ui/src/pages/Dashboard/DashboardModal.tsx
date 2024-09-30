import React, { useEffect, useCallback, useRef } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import type { DashboardCoreApi } from '@splunk/dashboard-types';

import {
    createNewQueryForDataVolumeInModal,
    createNewQueryForNumberOfEventsInModal,
    getActionButtons,
} from './utils';

/**
 * @param {object} props
 * @param {object} props.dashboardDefinition custom dashboard definition
 * @param {string} props.selectValueForDropdownInModal state for value in the modal
 * @param {string} props.selectTitleForDropdownInModal state for title in the modal
 */
export const DashboardModal = ({
    dashboardDefinition,
    selectValueForDropdownInModal,
    selectTitleForDropdownInModal,
}: {
    dashboardDefinition: Record<string, unknown> | null;
    selectValueForDropdownInModal: string;
    selectTitleForDropdownInModal: string;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);
    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    const updateModalData = useCallback(() => {
        const copyDashboardDefinition = JSON.parse(JSON.stringify(dashboardDefinition));

        const eventsQuery = createNewQueryForNumberOfEventsInModal(
            selectTitleForDropdownInModal,
            selectValueForDropdownInModal,
            copyDashboardDefinition.dataSources.ds_search_1.options.query
        );
        const dataVolumeQuery = createNewQueryForDataVolumeInModal(
            selectTitleForDropdownInModal,
            selectValueForDropdownInModal,
            copyDashboardDefinition.dataSources.data_ingestion_modal_data_volume_ds.options.query
        );

        copyDashboardDefinition.dataSources.data_ingestion_modal_data_volume_ds.options.query =
            dataVolumeQuery;
        copyDashboardDefinition.dataSources.ds_search_1.options.query = eventsQuery;

        return copyDashboardDefinition;
    }, [dashboardDefinition, selectTitleForDropdownInModal, selectValueForDropdownInModal]);

    // Update the dashboard when the definition or selected input changes
    useEffect(() => {
        if (dashboardCoreApi.current && dashboardDefinition) {
            const updatedModalData = updateModalData();
            dashboardCoreApi.current.updateDefinition(updatedModalData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardDefinition, selectValueForDropdownInModal]);

    return dashboardDefinition ? (
        <DashboardContextProvider preset={EnterpriseViewOnlyPreset}>
            <DashboardCore
                width="100%"
                height="auto"
                dashboardCoreApiRef={setDashboardCoreApi}
                actionMenus={getActionButtons('data_ingestion')}
            />
        </DashboardContextProvider>
    ) : null;
};
