import React, { useEffect, useMemo, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import Message from '@splunk/react-ui/Message';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import Card from '@splunk/react-ui/Card';
import Button from '@splunk/react-ui/Button';
import { debounce } from 'lodash';

import {
    createNewQueryBasedOnSearchAndHideTraffic,
    getActionButtons,
    makeVisualAdjustmentsOnDataIngestionPage,
    addDescriptionToExpandedViewByOptions,
} from './utils';
import TableClickHandler from './EventHandlers';

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
    const dashboardCoreApi = React.useRef<DashboardCoreApi | null>();
    const [showCard, setShowCard] = useState<boolean>(false);
    const [selectedInput, setSelectedInput] = useState<string>('');
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

        return () => {
            observer.disconnect();
        };
    }, [dashboardDefinition]);

    const setDashboardCoreApi = React.useCallback((api: DashboardCoreApi | null) => {
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

    return (
        <>
            <DashboardContextProvider
                preset={{
                    ...EnterpriseViewOnlyPreset,
                    eventHandlers: {
                        'table.click.handler': TableClickHandler,
                    },
                }}
                initialDefinition={dashboardDefinition}
            >
                <>
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
                    {/* <div id="switch_hide_no_traffic_wrapper" className="invisible_before_moving">
                        <Switch
                            id="switch_hide_no_traffic"
                            value={toggleNoTraffic}
                            onClick={handleChangeSwitch}
                            selected={!!toggleNoTraffic}
                            appearance="toggle"
                        >
                            Hide items with no traffic
                        </Switch>
                    </div> */}
                    {showCard ? (
                        <Card>
                            <Card.Header
                                title="Title"
                                subtitle="subtitlesubtitlesubtitle"
                                actionPrimary={<Button />}
                            />

                            <Card.Body>{selectedInput}</Card.Body>
                            <Card.Footer>
                                <Button appearance="secondary">Label</Button>
                                <Button appearance="primary">Label</Button>
                            </Card.Footer>
                        </Card>
                    ) : null}
                    <div id="info_message_for_data_ingestion" className="invisible_before_moving">
                        {infoMessage ? (
                            <Message appearance="fill" type="info">
                                {infoMessage}
                            </Message>
                        ) : null}
                    </div>
                </>
            </DashboardContextProvider>
        </>
    );
};
