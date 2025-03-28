import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import Message from '@splunk/react-ui/Message';
import type { DashboardCoreApi, PluginEventHandler } from '@splunk/dashboard-types';
import { debounce } from 'lodash';
import TabLayout from '@splunk/react-ui/TabLayout';

import { z } from 'zod';
import {
    createNewQueryBasedOnSearchAndHideTraffic,
    getActionButtons,
    makeVisualAdjustmentsOnDataIngestionPage,
    addDescriptionToExpandedViewByOptions,
} from './utils';
import { DataIngestionModal } from './DataIngestionModal';
import { DashboardModal } from './DashboardModal';
import { FEATURE_FLAGS } from './consts';

const VIEW_BY_INFO_MAP: Record<string, string> = {
    Input: 'Volume metrics are not available when the Input view is selected.',
    Account: 'Volume metrics are not available when the Account view is selected.',
    Host: 'Event metrics are not available when the Host view is selected.',
};

const EventPayloadSchema = z.object({
    payload: z
        .object({
            data: z
                .object({
                    fields: z.array(
                        z.object({
                            name: z.string(),
                        })
                    ),
                })
                .optional(),
            cellIndex: z.number().optional(),
            value: z.string().optional(),
        })
        .optional(),
});

export const DataIngestionDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown>;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [viewByInput, setViewByInput] = useState<string>('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(false);
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

    const handleDashboardEvent: PluginEventHandler = useCallback(async (event) => {
        const result = EventPayloadSchema.safeParse(event);
        if (!result.success) {
            return;
        }
        const { payload } = result.data;
        if (
            event.type === 'datasource.done' &&
            event.targetId === 'data_ingestion_table_ds' &&
            payload?.data
        ) {
            const modalInputSelectorName = payload.data?.fields[0]?.name;
            setSelectTitleForDropdownInModal(modalInputSelectorName);
        }
        if (
            event.type === 'cell.click' &&
            event.targetId === 'data_ingestion_table_viz' &&
            payload?.cellIndex === 0 &&
            payload.value
        ) {
            setSelectValueForDropdownInModal(payload.value);
        }
    }, []);

    const dashboardPlugin = useMemo(
        () => ({ onEventTrigger: handleDashboardEvent }),
        [handleDashboardEvent]
    );
    return (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
            dashboardPlugin={dashboardPlugin}
            featureFlags={FEATURE_FLAGS}
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
                            selectValueForDropdownInModal={selectValueForDropdownInModal || ''}
                            selectTitleForDropdownInModal={selectTitleForDropdownInModal || ''}
                            setDataIngestionDropdownValues={setDataIngestionDropdownValues}
                        />
                    </TabLayout.Panel>
                </DataIngestionModal>

                <DashboardCore
                    width="100%"
                    height="auto"
                    dashboardCoreApiRef={setDashboardCoreApi}
                    actionMenus={getActionButtons('data_ingestion')}
                />

                <div
                    id="data_ingestion_search"
                    data-test="data_ingestion_search"
                    className="invisible_before_moving"
                >
                    <p id="data_ingestion_search_label" data-test="data_ingestion_search_label">
                        Search
                    </p>
                    <Search
                        id="data_ingestion_search_input"
                        onChange={handleChangeSearch}
                        value={searchInput}
                        style={{ minWidth: '150px', gridRow: '6', gridColumn: '1' }}
                    />
                </div>
                <div
                    id="info_message_for_data_ingestion"
                    data-test="info_message_for_data_ingestion"
                    className="invisible_before_moving"
                >
                    {infoMessage && (
                        <Message appearance="fill" type="info">
                            {infoMessage}
                        </Message>
                    )}
                </div>
            </>
        </DashboardContextProvider>
    );
};
