import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import {
    createNewQueryForDataVolumeInModal,
    createNewQueryForNumberOfEventsInModal,
    getActionButtons,
} from './utils';

const updateModalData = (dashboardDefinition: Record<string, unknown>, selectedValue: string) => {
    const copyDashboardDefinition = JSON.parse(JSON.stringify(dashboardDefinition));

    const selectedInput = copyDashboardDefinition.inputs?.input1?.options?.title || '';
    const dataVolumeQuery = createNewQueryForDataVolumeInModal(selectedInput, selectedValue);
    const eventsQuery = createNewQueryForNumberOfEventsInModal(selectedInput, selectedValue);

    copyDashboardDefinition.dataSources.data_ingestion_modal_data_volume_ds.options.query =
        dataVolumeQuery;
    copyDashboardDefinition.dataSources.ds_search_1.options.query = eventsQuery;
    copyDashboardDefinition.inputs.input1.options.defaultValue = selectedValue;
    return copyDashboardDefinition;
};

/**
 * @param {object} props
 * @param {object} props.dashboardDefinition custom dashboard definition
 */
export const DashboardModal = ({
    dashboardDefinition,
    selectedLabelForInput,
}: {
    dashboardDefinition: Record<string, unknown> | null;
    selectedLabelForInput: string;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);
    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    // Update the dashboard when the definition or selected input changes
    useEffect(() => {
        if (dashboardCoreApi.current && dashboardDefinition) {
            const updatedModalData = updateModalData(dashboardDefinition, selectedLabelForInput);
            dashboardCoreApi.current.updateDefinition(updatedModalData);
        }
    }, [dashboardDefinition, selectedLabelForInput]);

    // Event handler for input changes
    const handleDashboardEvent = useCallback(
        (event) => {
            if (
                event.targetId === 'input1' &&
                event.type === 'input.change' &&
                dashboardCoreApi.current
            ) {
                const updatedModalData = updateModalData(dashboardDefinition!, event.payload.value);
                dashboardCoreApi.current.updateDefinition(updatedModalData);
            }
        },
        [dashboardDefinition]
    );

    const dashboardPlugin = useMemo(
        () => ({ onEventTrigger: handleDashboardEvent }),
        [handleDashboardEvent]
    );

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            dashboardPlugin={dashboardPlugin}
        >
            <DashboardCore
                width="100%"
                height="auto"
                dashboardCoreApiRef={setDashboardCoreApi}
                actionMenus={getActionButtons('data_ingestion')}
            />
        </DashboardContextProvider>
    ) : null;
};
