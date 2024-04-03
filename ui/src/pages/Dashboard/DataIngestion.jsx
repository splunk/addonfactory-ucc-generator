import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import { waitForElementToDisplay } from './utils';
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
            console.log('mutationsList', mutationsList);
            for (var mutation of mutationsList) {
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
    };

    const [searchInput, setSearchInput] = useState('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(0);

    const setDashboardCoreApi = (api) => {
        apiReference = api;
        window.apiReference = api;
    };

    const handleCha = (searchValue) => {
        const copyJson = JSON.parse(JSON.stringify(dashboardDefinition));

        const queryMap = {
            'Source type': 'st',
            Source: 's',
            Host: 'h',
            Index: 'i',
            Account: 'event_account',
        };

        const selectedLabel =
            document
                .querySelector('[data-input-id="data_ingestion_table_input"] button')
                ?.getAttribute('label') || 'Source type';

        if (copyJson?.inputs?.data_ingestion_table_input?.options?.items?.length > 0) {
            const item = copyJson.inputs.data_ingestion_table_input.options.items.find(
                (it) => it.label === selectedLabel
            );

            const firstPipeIndex = item.value.indexOf('|');
            const part1 = item.value.substring(0, firstPipeIndex);
            const part2 = item.value.substring(firstPipeIndex);
            const newQuery = `${part1}${queryMap[selectedLabel] || 'st'}=*${searchValue}* ${part2}`;

            copyJson.dataSources.data_ingestion_table_ds.options.query = newQuery;
            apiReference.updateDefinition(copyJson);
        }
    };

    const debounceHandlerToggleNoTraffic = useCallback(
        debounce((toggleValue) => {
            console.log('debounce toggle 2', toggleValue);
            console.log('we should edit dashboard definition', dashboardDefinition, definitionJson);
        }, 1000),
        []
    );

    const debounceHandlerSearchData = useCallback(
        debounce((searchValue) => {
            handleCha(searchValue);
        }, 1000),
        []
    );

    const handleChangeSearch = (e, { value: searchValue }) => {
        setSearchInput(searchValue);
        // handleCha(searchValue);
        debounceHandlerSearchData(searchValue);
    };

    const handleChangeSwitch = (e, { value }) => {
        setToggleNoTraffic(!value);
        debounceHandlerToggleNoTraffic(value);
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
