import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import { getUnifiedConfigs } from '../../util/util';

import {
    createNewQueryForDataVolumeInModal,
    createNewQueryForNumberOfEventsInModal,
    fetchDropdownValuesFromQuery,
    getActionButtons,
    loadDashboardJsonDefinition,
    queryMap,
} from './utils';
import { FieldValue } from './DataIngestion.types';

/**
 * @param {object} props
 * @param {string} props.selectValueForDropdownInModal state for value in the modal
 * @param {string} props.selectTitleForDropdownInModal state for title in the modal
 * @param {string} props.setDataIngestionDropdownValues set state for dropdown values in modal
 */
export const DashboardModal = ({
    selectValueForDropdownInModal,
    selectTitleForDropdownInModal,
    setDataIngestionDropdownValues,
}: {
    selectValueForDropdownInModal: string;
    selectTitleForDropdownInModal: string;
    setDataIngestionDropdownValues: React.Dispatch<React.SetStateAction<object[]>>;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);
    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);
    const [dataIngestionModalDef, setDataIngestionModalDef] = useState<Record<
        string,
        unknown
    > | null>(null);

    const globalConfig = useMemo(() => getUnifiedConfigs(), []);

    const mergeInputValues = (
        activeValues?: string[],
        inactiveValues?: string[] | string
    ): Record<string, string>[] => {
        let safeInactiveValues: Record<string, string>[] = [];
        if (typeof inactiveValues === 'string') {
            safeInactiveValues = [{ label: `${inactiveValues} (disabled)`, value: inactiveValues }];
        } else if (Array.isArray(inactiveValues)) {
            safeInactiveValues = inactiveValues.map((item: string) => ({
                label: `${item} (disabled)`,
                value: item,
            }));
        }

        let safeActiveValues: Record<string, string>[] = [];
        if (typeof activeValues === 'string') {
            safeActiveValues = [{ label: activeValues, value: activeValues }];
        } else if (Array.isArray(activeValues)) {
            safeActiveValues = activeValues.map((item: string) => ({
                label: item,
                value: item,
            }));
        }
        return [...safeActiveValues, ...safeInactiveValues];
    };

    const processResults = (results: Record<string, string>[], fieldKey: string) => {
        let extractColumnsValues: Record<string, string>[] = [];
        results.forEach((value) => {
            if (queryMap[fieldKey] === value.field) {
                const dropDownValues = JSON.parse(value.values);
                extractColumnsValues = dropDownValues.map((item: FieldValue) => ({
                    label: item.value,
                    value: item.value,
                }));
            }
        });
        return extractColumnsValues;
    };

    const updateModalData = useCallback(async () => {
        if (!dataIngestionModalDef) {
            return null;
        }

        const copyDataIngestionModalJson = JSON.parse(JSON.stringify(dataIngestionModalDef));
        const values = await fetchDropdownValuesFromQuery(globalConfig);
        let extractColumnsValues: Record<string, string>[] = [];

        if (selectTitleForDropdownInModal === 'Input') {
            const activeState = values[0]?.results[0]?.Active;
            const activeInputs = values[0]?.results[0]?.event_input;
            const inactiveInputs = values[0]?.results[1]?.event_input;

            // Handle cases where only active or inactive inputs exist
            if (activeState === 'yes') {
                extractColumnsValues = mergeInputValues(activeInputs, inactiveInputs);
            } else if (activeState === 'no') {
                extractColumnsValues = mergeInputValues(inactiveInputs, activeInputs);
            }
        } else if (selectTitleForDropdownInModal === 'Account') {
            extractColumnsValues = processResults(values[1].results, selectTitleForDropdownInModal);
        } else {
            extractColumnsValues = processResults(values[2].results, selectTitleForDropdownInModal);
        }

        setDataIngestionDropdownValues(extractColumnsValues);

        // Modify visualizations only for specific cases
        if (
            selectTitleForDropdownInModal === 'Input' ||
            selectTitleForDropdownInModal === 'Account'
        ) {
            // Remove data volume visualization for "Input" and "Account"
            delete copyDataIngestionModalJson.visualizations.data_ingestion_modal_data_volume_viz;
            copyDataIngestionModalJson.layout.structure[3].position.y = 80;
        } else if (selectTitleForDropdownInModal === 'Host') {
            // Remove event count visualization for "Host"
            delete copyDataIngestionModalJson.visualizations.data_ingestion_modal_events_count_viz;
        }

        const eventsQuery = createNewQueryForNumberOfEventsInModal(
            selectTitleForDropdownInModal,
            selectValueForDropdownInModal,
            copyDataIngestionModalJson.dataSources.ds_search_1.options.query
        );
        const dataVolumeQuery = createNewQueryForDataVolumeInModal(
            selectTitleForDropdownInModal,
            selectValueForDropdownInModal,
            copyDataIngestionModalJson.dataSources.data_ingestion_modal_data_volume_ds.options.query
        );

        copyDataIngestionModalJson.dataSources.data_ingestion_modal_data_volume_ds.options.query =
            dataVolumeQuery;
        copyDataIngestionModalJson.dataSources.ds_search_1.options.query = eventsQuery;

        return copyDataIngestionModalJson;
    }, [
        dataIngestionModalDef,
        globalConfig,
        selectTitleForDropdownInModal,
        selectValueForDropdownInModal,
        setDataIngestionDropdownValues,
    ]);

    // Update the dashboard when the definition or selected input changes
    useEffect(() => {
        const updateDefinition = async () => {
            if (dashboardCoreApi.current && dataIngestionModalDef) {
                const updatedModalData = await updateModalData();
                if (updatedModalData) {
                    dashboardCoreApi.current?.updateDefinition(updatedModalData);
                }
            }
        };

        updateDefinition();
    }, [dataIngestionModalDef, selectValueForDropdownInModal, updateModalData]);

    useEffect(() => {
        loadDashboardJsonDefinition(
            'data_ingestion_modal_definition.json',
            setDataIngestionModalDef
        );
    }, []);

    return dataIngestionModalDef ? (
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
