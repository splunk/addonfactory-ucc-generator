import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import { EventType } from '@splunk/react-events-viewer/common-types';
import { getUnifiedConfigs } from '../../util/util';

import {
    createNewQueryForDataVolumeInModal,
    createNewQueryForNumberOfEventsInModal,
    fetchDropdownValuesFromQuery,
    getActionButtons,
    loadDashboardJsonDefinition,
    queryMap,
} from './utils';
import { FieldValue, SearchResponse } from './DataIngestion.types';

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
    const [dropdownFetchedValues, setDropdownFetchedValues] = useState<SearchResponse<EventType>[]>(
        []
    );

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

    const processResults = (results: Record<string, string>[], fieldKey: string) =>
        results.reduce((extractColumnsValues: Record<string, string>[], value) => {
            if (queryMap[fieldKey] === value.field) {
                const dropDownValues = JSON.parse(value.values);
                return dropDownValues.map((item: FieldValue) => ({
                    label: item.value,
                    value: item.value,
                }));
            }
            return extractColumnsValues;
        }, []);

    const updateModalData = useCallback(() => {
        if (!dataIngestionModalDef) {
            return null;
        }

        const copyDataIngestionModalJson = JSON.parse(JSON.stringify(dataIngestionModalDef));
        let extractColumnsValues: Record<string, string>[] = [];

        if (selectTitleForDropdownInModal === 'Input') {
            const activeState = dropdownFetchedValues[0]?.results[0]?.Active;
            const activeInputs = dropdownFetchedValues[0]?.results[0]?.event_input;
            const inactiveInputs = dropdownFetchedValues[0]?.results[1]?.event_input;

            // Handle cases where only active or inactive inputs exist
            if (activeState === 'yes') {
                extractColumnsValues = mergeInputValues(activeInputs, inactiveInputs);
            } else if (activeState === 'no') {
                extractColumnsValues = mergeInputValues(inactiveInputs, activeInputs);
            }
        } else if (selectTitleForDropdownInModal === 'Account') {
            extractColumnsValues = processResults(
                dropdownFetchedValues[1]?.results || [],
                selectTitleForDropdownInModal
            );
        } else {
            extractColumnsValues = processResults(
                dropdownFetchedValues[2]?.results || [],
                selectTitleForDropdownInModal
            );
        }

        setDataIngestionDropdownValues(extractColumnsValues);

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

        // Modify visualizations only for specific cases
        if (
            selectTitleForDropdownInModal === 'Input' ||
            selectTitleForDropdownInModal === 'Account'
        ) {
            // Remove data volume visualization for "Input" and "Account"
            delete copyDataIngestionModalJson.visualizations.data_ingestion_modal_data_volume_viz;
            delete copyDataIngestionModalJson.dataSources.data_ingestion_modal_data_volume_ds;
            delete copyDataIngestionModalJson.layout.structure[2];
            copyDataIngestionModalJson.layout.structure =
                copyDataIngestionModalJson.layout.structure.filter(
                    (item: Record<string, unknown>) => item !== null
                );
            copyDataIngestionModalJson.layout.structure[2].position.y = 80;
        } else if (selectTitleForDropdownInModal === 'Host') {
            // Remove event count visualization for "Host"
            delete copyDataIngestionModalJson.visualizations.data_ingestion_modal_events_count_viz;
            delete copyDataIngestionModalJson.dataSources.ds_search_1;
            delete copyDataIngestionModalJson.layout.structure[3];
            copyDataIngestionModalJson.layout.structure =
                copyDataIngestionModalJson.layout.structure.filter(
                    (item: Record<string, unknown>) => item !== null
                );
        }

        return copyDataIngestionModalJson;
    }, [
        dataIngestionModalDef,
        dropdownFetchedValues,
        selectTitleForDropdownInModal,
        selectValueForDropdownInModal,
        setDataIngestionDropdownValues,
    ]);

    useEffect(() => {
        const fetchDropdownValues = async () => {
            const values = await fetchDropdownValuesFromQuery(globalConfig);
            setDropdownFetchedValues(values);
        };

        fetchDropdownValues();
    }, [globalConfig]);

    // Update the dashboard when the modal data changes
    useEffect(() => {
        const updateDefinitionForDashboardModal = async () => {
            if (dashboardCoreApi.current && dataIngestionModalDef) {
                const updatedModalData = await updateModalData();
                if (updatedModalData) {
                    dashboardCoreApi.current?.updateDefinition(updatedModalData);
                }
            }
        };

        updateDefinitionForDashboardModal();
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
