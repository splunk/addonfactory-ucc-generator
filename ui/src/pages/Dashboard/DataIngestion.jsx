import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import { waitForElementToDisplay, createNewQueryBasedOnSearchAndHideTraffic } from './utils';
import { debounce } from 'lodash';
import Switch from '@splunk/react-ui/Switch';

let apiReference = null;
export const DataIngestionDashboard = ({ dashboardDefinition }) => {
    useEffect(() => {
        waitForElementToDisplay(
            '[data-input-id="data_ingestion_input"]',
            '#data_ingestion_label_viz',
            () => {
                const overviewTimeInput = document.querySelector(
                    '[data-input-id="data_ingestion_input"]'
                );
                const overViewContainer = document.querySelector('#data_ingestion_label_viz');
                overViewContainer?.after(overviewTimeInput);
            },
            300,
            5000
        );
        waitForElementToDisplay(
            '[data-input-id="data_ingestion_table_input"]',
            '#data_ingestion_table_viz',
            () => {
                const overviewTimeInput = document.querySelector(
                    '[data-input-id="data_ingestion_table_input"]'
                );
                const overViewContainer = document.querySelector('#data_ingestion_table_viz');
                overViewContainer?.before(overviewTimeInput);
            },
            300,
            5000
        );
        waitForElementToDisplay(
            '#data_ingestion_table_viz',
            '#data_ingestion_search',
            () => {
                const overviewSearch = document.querySelector('#data_ingestion_search');
                const overViewContainer = document.querySelector('#data_ingestion_table_viz');
                overViewContainer?.before(overviewSearch);
            },
            300,
            5000
        );
        waitForElementToDisplay(
            '#data_ingestion_table_viz',
            '#switch_hide_no_traffic_wrapper',
            () => {
                const overviewSearch = document.querySelector('#switch_hide_no_traffic_wrapper');
                const overViewContainer = document.querySelector('#data_ingestion_table_viz');
                overViewContainer?.before(overviewSearch);
            },
            300,
            5000
        );

        // Select the node that will be observed for mutations
        const targetNode = document.querySelector(
            '[data-input-id="data_ingestion_table_input"] button'
        );

        // Options for the observer (which mutations to observe)
        const config = { attributes: true };

        // Callback function to execute when mutations are observed
        const callback = function (mutationsList) {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === 'data-test-value') {
                    tryToRevertDefinitionToNormal();
                }
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
        return () => {
            observer.disconnect();
        };
        // Later, you can stop observing
    }, []);

    const tryToRevertDefinitionToNormal = () => {
        apiReference.updateDefinition(dashboardDefinition);
        setSearchInput('');
        setToggleNoTraffic(false);
    };

    const [searchInput, setSearchInput] = useState('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(false);

    const setDashboardCoreApi = (api) => {
        apiReference = api;
    };

    const handleQueryChange = (searchValue, hideToggleValue) => {
        const copyJson = JSON.parse(JSON.stringify(dashboardDefinition));

        if (copyJson?.inputs?.data_ingestion_table_input?.options?.items?.length > 0) {
            const selectedLabel =
                document
                    ?.querySelector('[data-input-id="data_ingestion_table_input"] button')
                    ?.getAttribute('label') || 'Source type';

            const item = copyJson.inputs.data_ingestion_table_input.options.items.find(
                (it) => it.label === selectedLabel
            );

            const newQuery = createNewQueryBasedOnSearchAndHideTraffic(
                searchValue,
                hideToggleValue,
                item.value,
                selectedLabel
            );
            copyJson.dataSources.data_ingestion_table_ds.options.query = newQuery;
            apiReference.updateDefinition(copyJson);
        }
    };

    const debounceHandlerChangeData = useCallback(
        debounce((searchValue, hideToggleValue) => {
            handleQueryChange(searchValue, hideToggleValue);
        }, 1000),
        []
    );

    const handleChangeSearch = (e, { value }) => {
        setSearchInput(value);
        debounceHandlerChangeData(value, toggleNoTraffic);
    };

    const handleChangeSwitch = (e, { value }) => {
        setToggleNoTraffic(!value);
        debounceHandlerChangeData(searchInput, !value);
    };

    return (
        <>
            <DashboardContextProvider
                preset={EnterpriseViewOnlyPreset}
                initialDefinition={dashboardDefinition}
                onItemsSelect={(x) => console.log(x)}
                onDefinitionChange={(x, y) => console.log('definition was changed0', { x, y })}
            >
                <DashboardCore
                    width="100%"
                    height="auto"
                    dashboardCoreApiRef={setDashboardCoreApi}
                    onItemsSelect={(x) => console.log(x)}
                    onClick={(x) => console.log(x)}
                />
            </DashboardContextProvider>
            <div id="data_ingestion_search">
                <p id="data_ingestion_search_label">Search:</p>
                <Search
                    id="data_ingestion_search_input"
                    onChange={handleChangeSearch}
                    value={searchInput}
                    style={{ minWidth: '150px', gridRow: '6', gridColumn: '1' }}
                />
            </div>
            <div id="switch_hide_no_traffic_wrapper">
                <Switch
                    id="switch_hide_no_traffic"
                    key={toggleNoTraffic}
                    value={toggleNoTraffic}
                    onClick={handleChangeSwitch}
                    selected={!!toggleNoTraffic}
                    appearance="toggle"
                >
                    Hide items with no traffic
                </Switch>
            </div>
        </>
    );
};
