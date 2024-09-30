import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import Message from '@splunk/react-ui/Message';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import { debounce } from 'lodash';
import TabLayout from '@splunk/react-ui/TabLayout';

import {
    createNewQueryBasedOnSearchAndHideTraffic,
    getActionButtons,
    makeVisualAdjustmentsOnDataIngestionPage,
    addDescriptionToExpandedViewByOptions,
    loadDashboardJsonDefinition,
    queryMap,
    fetchParsedValues,
} from './utils';
import { DataIngestionModal } from './DataIngestionModal';
import { DashboardModal } from './DashboardModal';
import { FieldValue } from './DataIngestion.types';

const VIEW_BY_INFO_MAP: Record<string, string> = {
    Input: 'Volume metrics are not available when the Input view is selected.',
    Account: 'Volume metrics are not available when the Account view is selected.',
    Host: 'Event metrics are not available when the Host view is selected.',
};

export const DataIngestionDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown>;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [viewByInput, setViewByInput] = useState<string>('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(false);
    const [dataIngestionModalDef, setDataIngestionModalDef] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [copyDataIngestionModalDef, setCopyDataIngestionModalDef] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [selectValueForDropdownInModal, setSelectValueForDropdownInModal] = useState<
        string | null
    >(null);
    const [selectTitleForDropdownInModal, setSelectTitleForDropdownInModal] = useState<
        string | null
    >(null);
    const [dataIngestionDropdownValues, setDataIngestionDropdownValues] = useState([{}]);
    useEffect(() => {
        makeVisualAdjustmentsOnDataIngestionPage();

        // Select the target node for observing mutations
        const targetNode = document.querySelector(
            '[data-input-id="data_ingestion_table_input"] button'
        );
        const config = { attributes: true };
        const callback = (mutationsList: MutationRecord[]) => {
            mutationsList.forEach((mutation: MutationRecord) => {
                if (mutation.attributeName === 'data-test-value') {
                    // Update the dashboard definition
                    dashboardCoreApi.current?.updateDefinition(dashboardDefinition);
                    setSearchInput('');
                    setToggleNoTraffic(false);

                    // Get the view-by option from the mutated element
                    const viewByOption = (mutation.target as HTMLElement)?.getAttribute('label');
                    setViewByInput(viewByOption || '');
                }
                if (mutation.attributeName === 'aria-expanded') {
                    addDescriptionToExpandedViewByOptions(mutation.target as Element);
                }
            });
        };

        // Create a MutationObserver instance and start observing
        const observer = new MutationObserver(callback);
        if (targetNode) {
            observer.observe(targetNode, config);
        }

        // Set the current "view by" option when the component mounts
        const currentViewBy = document
            .querySelector('[data-input-id="data_ingestion_table_input"] button')
            ?.getAttribute('label');

        setViewByInput(currentViewBy || '');

        // Load the dashboard definition
        loadDashboardJsonDefinition(
            'data_ingestion_modal_definition.json',
            setDataIngestionModalDef
        );

        // Clean-up function to disconnect the observer when the component unmounts
        return () => {
            if (observer && targetNode) {
                observer.disconnect();
            }
        };
    }, [dashboardDefinition]);

    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    const debounceHandlerChangeData = useMemo(
        () =>
            debounce((searchValue, hideToggleValue) => {
                const copyJson = JSON.parse(JSON.stringify(dashboardDefinition));
                const selectedLabel =
                    document
                        ?.querySelector('[data-input-id="data_ingestion_table_input"] button')
                        ?.getAttribute('label') || 'Source type';

                const item = copyJson.inputs.data_ingestion_table_input.options.items.find(
                    (it: { label: string }) => it.label === selectedLabel
                );

                const newQuery = createNewQueryBasedOnSearchAndHideTraffic(
                    searchValue,
                    hideToggleValue,
                    item.value,
                    selectedLabel
                );
                copyJson.dataSources.data_ingestion_table_ds.options.query = newQuery;
                dashboardCoreApi.current?.updateDefinition(copyJson);
            }, 1000),
        [dashboardDefinition]
    );

    const handleChangeSearch = (e: unknown, { value }: { value: string }) => {
        setSearchInput(value);
        debounceHandlerChangeData(value, toggleNoTraffic);
    };

    const infoMessage = VIEW_BY_INFO_MAP[viewByInput];

    const handleDashboardEvent = useCallback(
        async (event) => {
            if (
                event.type === 'datasource.done' &&
                event.targetId === 'data_ingestion_table_ds' &&
                event.payload.data
            ) {
                // Create deep copy of dataIngestionModalDef for essential operations
                const copyDataIngestionModalJson = JSON.parse(
                    JSON.stringify(dataIngestionModalDef)
                );
                const modalInputSelectorName = event.payload.data.fields[0].name;
                const values = await fetchParsedValues();
                let extractColumnsValues: Record<string, string>[] = [];
                const processResults = (results: Record<string, string>[], fieldKey: string) => {
                    results.forEach((value) => {
                        if (queryMap[fieldKey] === value.field) {
                            const dropDownValues = JSON.parse(value.values);
                            extractColumnsValues = dropDownValues.map((item: FieldValue) => ({
                                label: item.value,
                                value: item.value,
                            }));
                        }
                    });
                };
                const mergeInputValues = (
                    activeValues?: string[],
                    inactiveValues?: string[] | string
                ): Record<string, string>[] => {
                    // Handle inactiveValues being either a string or an array of strings
                    let safeInactiveValues: Record<string, string>[] = [];
                    if (typeof inactiveValues === 'string') {
                        safeInactiveValues = [
                            { label: `${inactiveValues} (disabled)`, value: inactiveValues },
                        ]; // Convert single string to array
                    } else if (Array.isArray(inactiveValues)) {
                        safeInactiveValues = inactiveValues.map((item: string) => ({
                            label: `${item} (disabled)`,
                            value: item,
                        }));
                    }

                    // Handle activeValues being either a string or an array of strings
                    let safeActiveValues: Record<string, string>[] = [];
                    if (typeof activeValues === 'string') {
                        safeActiveValues = [{ label: activeValues, value: activeValues }]; // Convert single string to array
                    } else if (Array.isArray(activeValues)) {
                        safeActiveValues = activeValues.map((item: string) => ({
                            label: item,
                            value: item,
                        }));
                    }

                    // Merge active and inactive inputs (safe arrays)
                    const mergedValues = [...safeActiveValues, ...safeInactiveValues];
                    return mergedValues;
                };

                if (modalInputSelectorName === 'Input') {
                    const activeState = values[0]?.results[0]?.Active;
                    const activeInputs = values[0]?.results[0]?.event_input;
                    const inactiveInputs = values[0]?.results[1]?.event_input;

                    // Handle cases where only active or inactive inputs exist
                    if (activeState === 'yes') {
                        extractColumnsValues = mergeInputValues(activeInputs, inactiveInputs);
                    } else if (activeState === 'no') {
                        extractColumnsValues = mergeInputValues(inactiveInputs, activeInputs);
                    }
                } else if (modalInputSelectorName === 'Account') {
                    processResults(values[1].results, modalInputSelectorName);
                } else {
                    processResults(values[2].results, modalInputSelectorName);
                }
                setDataIngestionDropdownValues(extractColumnsValues);
                setSelectTitleForDropdownInModal(modalInputSelectorName);

                // Modify visualizations only for specific cases
                if (modalInputSelectorName === 'Input' || modalInputSelectorName === 'Account') {
                    // Remove data volume visualization for "Input" and "Account"
                    delete copyDataIngestionModalJson.visualizations
                        .data_ingestion_modal_data_volume_viz;
                    copyDataIngestionModalJson.layout.structure[3].position.y = 80;
                } else if (modalInputSelectorName === 'Host') {
                    // Remove event count visualization for "Host"
                    delete copyDataIngestionModalJson.visualizations
                        .data_ingestion_modal_events_count_viz;
                }
                setCopyDataIngestionModalDef({ ...copyDataIngestionModalJson }); // Update state with modified copy
            }
            if (
                event.type === 'cell.click' &&
                event.targetId === 'data_ingestion_table_viz' &&
                event.payload.cellIndex === 0 &&
                event.payload.value
            ) {
                setSelectValueForDropdownInModal(event.payload.value);
            }
        },
        [dataIngestionModalDef]
    );

    const dashboardPlugin = useMemo(
        () => ({ onEventTrigger: handleDashboardEvent }),
        [handleDashboardEvent]
    );
    return (
        <>
            <DashboardContextProvider
                preset={EnterpriseViewOnlyPreset}
                initialDefinition={dashboardDefinition}
                dashboardPlugin={dashboardPlugin}
            >
                <>
                    <DataIngestionModal
                        open={!!selectValueForDropdownInModal}
                        handleRequestClose={() => setSelectValueForDropdownInModal(null)}
                        title={selectTitleForDropdownInModal || ''}
                        acceptBtnLabel="Done"
                        dataIngestionDropdownValues={dataIngestionDropdownValues}
                        selectValueForDropdownInModal={selectValueForDropdownInModal || ''}
                        setSelectValueForDropdownInModal={setSelectValueForDropdownInModal}
                    >
                        <TabLayout.Panel
                            label="data_ingestion_modal"
                            panelId="dataIngestionModalDefTabPanel"
                        >
                            <DashboardModal
                                dashboardDefinition={copyDataIngestionModalDef}
                                selectValueForDropdownInModal={selectValueForDropdownInModal || ''}
                                selectTitleForDropdownInModal={selectTitleForDropdownInModal || ''}
                            />
                        </TabLayout.Panel>
                    </DataIngestionModal>

                    <DashboardCore
                        width="100%"
                        height="auto"
                        dashboardCoreApiRef={setDashboardCoreApi}
                        actionMenus={getActionButtons('data_ingestion')}
                    />

                    <div id="data_ingestion_search" className="invisible_before_moving">
                        <p id="data_ingestion_search_label">Search</p>
                        <Search
                            id="data_ingestion_search_input"
                            onChange={handleChangeSearch}
                            value={searchInput}
                            style={{ minWidth: '150px', gridRow: '6', gridColumn: '1' }}
                        />
                    </div>
                    <div id="info_message_for_data_ingestion" className="invisible_before_moving">
                        {infoMessage && (
                            <Message appearance="fill" type="info">
                                {infoMessage}
                            </Message>
                        )}
                    </div>
                </>
            </DashboardContextProvider>
        </>
    );
};
