import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import Message from '@splunk/react-ui/Message';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import Button from '@splunk/react-ui/Button';
import { debounce } from 'lodash';
import TabLayout from '@splunk/react-ui/TabLayout';

import {
    createNewQueryBasedOnSearchAndHideTraffic,
    getActionButtons,
    makeVisualAdjustmentsOnDataIngestionPage,
    addDescriptionToExpandedViewByOptions,
    loadDashboardJsonDefinition,
} from './utils';
import { CustomDashboard } from './Custom';
import { SpikeModal } from './SpikeModal';
import { SideCardPanel } from './SideCardPanel';

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
    const [searchInput, setSearchInput] = useState('');
    const [viewByInput, setViewByInput] = useState<string>('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(false);

    const [spikeDef, setSpikeDef] = useState<Record<string, unknown> | null>(null);

    const [useSideModalModalVersion, setUseSideModalModalVersion] = useState<boolean>(true);
    const [displaySideMenuForInput, setDisplaySideMenuForInput] = useState<string | null>(null);

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

        loadDashboardJsonDefinition('spike_side_panel_definition.json', setSpikeDef);

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

    const handleDashboardEvent = useCallback((event) => {
        // eslint-disable-next-line no-console
        console.log('clicked', {
            ...event,
        });

        if (
            event.type === 'cell.click' &&
            event.targetId === 'data_ingestion_table_viz' &&
            event.payload.cellIndex === 0 &&
            event.payload.value
        ) {
            setDisplaySideMenuForInput(event.payload.value);
        }

        // setDisplaySideMenuForInput
    }, []);

    const dashboardPlugin = useMemo(
        () => ({
            onEventTrigger: handleDashboardEvent,
        }),
        [handleDashboardEvent]
    );
    return (
        <>
            <DashboardContextProvider
                preset={{
                    ...EnterpriseViewOnlyPreset,
                    // eventHandlers: {
                    //     'table.click.handler': TableClickHandler,
                    // },
                }}
                initialDefinition={dashboardDefinition}
                dashboardPlugin={dashboardPlugin}
            >
                <>
                    <Button
                        onClick={() => setUseSideModalModalVersion(!useSideModalModalVersion)}
                        label={`Should use Side Modal version => ${useSideModalModalVersion}`}
                    />
                    <SpikeModal
                        open={!useSideModalModalVersion && !!displaySideMenuForInput}
                        handleRequestClose={() => {
                            setDisplaySideMenuForInput(null);
                        }}
                        title={`Title for input - ${displaySideMenuForInput}`}
                        acceptBtnLabel="ok"
                    >
                        <TabLayout.Panel label="spike" panelId="spikeDefTabPanel">
                            <CustomDashboard dashboardDefinition={spikeDef} />
                        </TabLayout.Panel>
                    </SpikeModal>

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
                    {/* <Card
                        style={{
                            display:
                                !useSpikeModalVersion && !!displaySideMenuForInput
                                    ? 'block'
                                    : 'none',
                        }}
                        id="spikeCardSidePanel"
                    >
                        <Card.Header
                            title="Title"
                            subtitle="subtitlesubtitlesubtitle"
                            actionPrimary={
                                <Button
                                    label="X"
                                    onClick={() => setDisplaySideMenuForInput(null)}
                                />
                            }
                        />
                        <Card.Body>
                            <div id="SpikeSidePanel">
                                {!useSpikeModalVersion && !!displaySideMenuForInput && (
                                    <TabLayout.Panel label="spike" panelId="spikeDefTabPanel">
                                        <CustomDashboard dashboardDefinition={spikeDef} />
                                    </TabLayout.Panel>
                                )}
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <Button
                                appearance="secondary"
                                onClick={() => setDisplaySideMenuForInput(null)}
                            >
                                Close
                            </Button>
                        </Card.Footer>
                    </Card> */}
                    {/* {!useSpikeModalVersion && !!displaySideMenuForInput ? ( */}
                    <SideCardPanel
                        display={useSideModalModalVersion && !!displaySideMenuForInput}
                        displaySideMenuForInput={displaySideMenuForInput}
                        setDisplaySideMenuForInput={setDisplaySideMenuForInput}
                        spikeDef={spikeDef}
                    />
                    {/* ) : null} */}
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
