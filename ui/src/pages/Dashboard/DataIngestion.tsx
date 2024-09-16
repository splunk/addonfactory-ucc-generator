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
} from './utils';
import { DataIngestionModal } from './DataIngestionModal';
import { DashboardModal } from './DashboardModal';

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
    const [displayModalForInput, setDisplayModalForInput] = useState<string | null>(null);
    useEffect(() => {
        makeVisualAdjustmentsOnDataIngestionPage();

        const targetNode = document.querySelector(
            '[data-input-id="data_ingestion_table_input"] button'
        );
        const config = { attributes: true };
        const callback = (mutationsList: MutationRecord[]) => {
            mutationsList.forEach((mutation: MutationRecord) => {
                if (mutation.attributeName === 'data-test-value') {
                    dashboardCoreApi.current?.updateDefinition(dashboardDefinition);
                    setSearchInput('');
                    setToggleNoTraffic(false);
                    const viewByOption = (mutation.target as HTMLElement)?.getAttribute('label');
                    setViewByInput(viewByOption || '');
                }
                if (mutation.attributeName === 'aria-expanded') {
                    addDescriptionToExpandedViewByOptions(mutation.target as Element);
                }
            });
        };
        // mutation is used to detect if dropdown value is changed
        // todo: do a better solution
        const observer = new MutationObserver(callback);
        if (targetNode) {
            observer.observe(targetNode, config);
        }

        const currentViewBy = document
            .querySelector('[data-input-id="data_ingestion_table_input"] button')
            ?.getAttribute('label');

        setViewByInput(currentViewBy || '');

        loadDashboardJsonDefinition(
            'data_ingestion_modal_definition.json',
            setDataIngestionModalDef
        );

        return () => {
            observer.disconnect();
        };
    }, [dashboardDefinition]);

    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    const debounceHandlerChangeData = useMemo(
        () =>
            debounce((searchValue, hideToggleValue) => {
                const copyJson = JSON.parse(JSON.stringify(dashboardDefinition));

                if (copyJson?.inputs?.data_ingestion_table_input?.options?.items?.length > 0) {
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
                }
            }, 1000),
        [dashboardDefinition]
    );

    const handleChangeSearch = (e: unknown, { value }: { value: string }) => {
        setSearchInput(value);
        debounceHandlerChangeData(value, toggleNoTraffic);
    };

    const infoMessage = VIEW_BY_INFO_MAP[viewByInput];

    const handleDashboardEvent = useCallback(
        (event) => {
            if (
                event.type === 'datasource.done' &&
                event.targetId === 'data_ingestion_table_ds' &&
                event.payload.data
            ) {
                // Create deep copy of dataIngestionModalDef for essential operations
                const copyDataIngestionModalJson = JSON.parse(
                    JSON.stringify(dataIngestionModalDef)
                );
                setDisplayModalForInput(event.payload.value);
                const columnsArray: { key: string; value: string }[] =
                    event.payload.data.columns[0].map((item: string) => ({
                        key: item,
                        value: item,
                    }));

                const modalInputSelectorName = event.payload.data.fields[0].name;

                // update the input selector name and value in the modal
                copyDataIngestionModalJson.inputs.input1.options.title = modalInputSelectorName;
                copyDataIngestionModalJson.inputs.input1.title = modalInputSelectorName;
                copyDataIngestionModalJson.inputs.input1.options.items = columnsArray;

                // Modify visualizations only for specific cases
                if (modalInputSelectorName === 'Input') {
                    // Remove data volume visualization for "Input"
                    delete copyDataIngestionModalJson.visualizations
                        .data_ingestion_modal_data_volume_viz;
                } else if (modalInputSelectorName === 'Host') {
                    // Remove event count visualization for "Host"
                    delete copyDataIngestionModalJson.visualizations
                        .data_ingestion_modal_events_count_viz;
                }
                setCopyDataIngestionModalDef(copyDataIngestionModalJson); // Update state with modified copy
            }

            if (
                event.type === 'cell.click' &&
                event.targetId === 'data_ingestion_table_viz' &&
                event.payload.cellIndex === 0 &&
                event.payload.value
            ) {
                setDisplayModalForInput(event.payload.value);
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
                        open={!!displayModalForInput}
                        handleRequestClose={() => setDisplayModalForInput(null)}
                        title={displayModalForInput || ''}
                        acceptBtnLabel="Done"
                    >
                        <TabLayout.Panel
                            label="data_ingestion_modal"
                            panelId="dataIngestionModalDefTabPanel"
                        >
                            <DashboardModal
                                dashboardDefinition={copyDataIngestionModalDef}
                                selectedLabelForInput={displayModalForInput || ''}
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
