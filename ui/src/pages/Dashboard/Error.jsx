import React, { useEffect, useState } from 'react';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { waitForElementToDisplay } from './utils';

export const ErrorDashboard = ({ dashboardDefinition }) => {

    useEffect(()=>{
        waitForElementToDisplay(
            '[data-input-id="errors_tab_input"]',
            '#errors_tab_description_viz',
            () => {
                const overviewTimeInput = document.querySelector(
                    '[data-input-id="errors_tab_input"]'
                );
                const overViewContainer = document.querySelector('#errors_tab_description_viz');
                overViewContainer?.after(overviewTimeInput);
            },
            300,
            5000
        );
    },[])

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore width="100%" height="auto" />
        </DashboardContextProvider>
    ) : null;
};
