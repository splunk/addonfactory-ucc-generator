import React, { useEffect, useMemo, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import Switch from '@splunk/react-ui/Switch';
import Message from '@splunk/react-ui/Message';
import Tooltip from '@splunk/react-ui/Tooltip';

import { debounce } from 'lodash';
import {
    createNewQueryBasedOnSearchAndHideTraffic,
    getActionButtons,
    makeVisualAdjustmentsOnDataIngestionPage,
    addDescriptionToExpandedViewByOptions,
} from './utils';

let apiReference: { updateDefinition: (arg0: Record<string, unknown>) => void } | null = null;

const VIEW_BY_INFO_MAP: Record<string, string> = {
    Input: 'Volume metrics are not available when viewing by inputs.',
    Account: 'Volume metrics are not available when viewing by account.',
    Host: 'Event metrics are not available when the Host view is selected.',
};

export const DataIngestionDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown>;
}) => {
    const [searchInput, setSearchInput] = useState('');
    const [viewByInput, setViewByInput] = useState<string>('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(false);

    useEffect(() => {
        makeVisualAdjustmentsOnDataIngestionPage();

        const targetNode = document.querySelector(
            '[data-input-id="data_ingestion_table_input"] button'
        );
        const config = { attributes: true };
        const callback = (mutationsList: MutationRecord[]) => {
            mutationsList.forEach((mutation: MutationRecord) => {
                if (mutation.attributeName === 'data-test-value') {
                    apiReference?.updateDefinition(dashboardDefinition);
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
            .querySelector('[data-input-id="data_ingestion_table_input"]')
            ?.getAttribute('label');

        setViewByInput(currentViewBy || '');
        return () => {
            observer.disconnect();
        };
    }, [dashboardDefinition]);

    const setDashboardCoreApi = (api: {
        updateDefinition: (arg0: Record<string, unknown>) => void;
    }) => {
        apiReference = api;
    };

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
                    apiReference?.updateDefinition(copyJson);
                }
            }, 1000),
        [dashboardDefinition]
    );

    const handleChangeSearch = (e: unknown, { value }: { value: string }) => {
        setSearchInput(value);
        debounceHandlerChangeData(value, toggleNoTraffic);
    };

    const handleChangeSwitch = (e: unknown, { value }: { value?: unknown }) => {
        setToggleNoTraffic(!value);
        debounceHandlerChangeData(searchInput, !value);
    };

    const infoMessage = VIEW_BY_INFO_MAP[viewByInput];

    return (
        <>
            <DashboardContextProvider
                preset={EnterpriseViewOnlyPreset}
                initialDefinition={dashboardDefinition}
            >
                <>
                    <DashboardCore
                        width="100%"
                        height="auto"
                        dashboardCoreApiRef={setDashboardCoreApi}
                        actionMenus={getActionButtons('data_ingestion')}
                    />

                    <div id="data_ingestion_search" className="invisible_before_Moving">
                        <p id="data_ingestion_search_label">Search:</p>
                        <Search
                            id="data_ingestion_search_input"
                            onChange={handleChangeSearch}
                            value={searchInput}
                            style={{ minWidth: '150px', gridRow: '6', gridColumn: '1' }}
                        />
                    </div>
                    <div id="switch_hide_no_traffic_wrapper" className="invisible_before_Moving">
                        <Switch
                            id="switch_hide_no_traffic"
                            value={toggleNoTraffic}
                            onClick={handleChangeSwitch}
                            selected={!!toggleNoTraffic}
                            appearance="toggle"
                        >
                            Hide items with no traffic
                        </Switch>
                    </div>
                    <div id="info_message_for_data_ingestion" className="invisible_before_Moving">
                        {infoMessage ? (
                            <Message appearance="fill" type="info">
                                {infoMessage}
                            </Message>
                        ) : null}
                    </div>
                    <div id="data_ingestion_last_seen_tooltip" className="invisible_before_Moving">
                        <Tooltip content="Last event within selected timeframe" />
                    </div>
                </>
            </DashboardContextProvider>
        </>
    );
};
