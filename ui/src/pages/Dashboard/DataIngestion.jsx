import React, { useCallback, useEffect, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Search from '@splunk/react-ui/Search';
import { waitForElementToDisplay } from './utils';
import { debounce } from 'lodash';

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
    }, []);

    const debounceHandler = useCallback(
        debounce((searchData) => console.log('debounce searchData', searchData), 1500),
        []
    );

    const [value, setValue] = useState('');

    const handleChange = (e, { value: searchValue }) => {
        setValue(searchValue);
        debounceHandler(searchValue);
    };

    return (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore width="100%" height="auto" />
            <Search
                id="data_ingestion_search"
                labelledBy={'data_ingestion_search2'}
                onChange={handleChange}
                value={value}
                style={{ minWidth: '150px', gridRow: '6', gridColumn: '1' }}
            />
        </DashboardContextProvider>
    );
};
