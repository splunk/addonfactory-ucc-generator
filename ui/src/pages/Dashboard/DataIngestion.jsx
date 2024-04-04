import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import Switch from '@splunk/react-ui/Switch';
import { debounce } from 'lodash';
import {
    waitForElementToDisplayAndMoveThemToCanvas,
    createNewQueryBasedOnSearchAndHideTraffic,
} from './utils';

let apiReference = null;
export const DataIngestionDashboard = ({ dashboardDefinition }) => {
    const [searchInput, setSearchInput] = useState('');
    const [toggleNoTraffic, setToggleNoTraffic] = useState(false);

    useEffect(() => {
        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="data_ingestion_input"]',
            '#data_ingestion_label_viz'
        );

        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="data_ingestion_table_input"]',
            '#data_ingestion_table_viz'
        );

        waitForElementToDisplayAndMoveThemToCanvas(
            '#data_ingestion_search',
            '#data_ingestion_table_viz'
        );

        waitForElementToDisplayAndMoveThemToCanvas(
            '#switch_hide_no_traffic_wrapper',
            '#data_ingestion_table_viz'
        );
        const targetNode = document.querySelector(
            '[data-input-id="data_ingestion_table_input"] button'
        );
        const config = { attributes: true };
        const callback = (mutationsList) => {
            mutationsList.forEach((mutation) => {
                if (mutation.attributeName === 'data-test-value') {
                    apiReference?.updateDefinition(dashboardDefinition);
                    setSearchInput('');
                    setToggleNoTraffic(false);
                }
            });
        };
        // mutation is used to detect if dropdown value is changed
        // todo: do a better solution
        const observer = new MutationObserver(callback);

        observer.observe(targetNode, config);
        return () => {
            observer.disconnect();
        };
    }, [dashboardDefinition]);

    const setDashboardCoreApi = (api) => {
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
            }, 1000),
        [dashboardDefinition]
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
            >
                <DashboardCore
                    width="100%"
                    height="auto"
                    dashboardCoreApiRef={setDashboardCoreApi}
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

DataIngestionDashboard.propTypes = {
    dashboardDefinition: PropTypes.object,
};
