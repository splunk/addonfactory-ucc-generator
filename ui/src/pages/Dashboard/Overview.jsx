import React, { useEffect, useState } from 'react';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { waitForElementToDisplay } from './utils';

export const OverviewDashboard = ({ dashboardDefinition }) => {
    useEffect(() => {
        waitForElementToDisplay(
            '[data-input-id="overview_input"]',
            '#overview_main_label_viz',
            () => {
                const overviewTimeInput = document.querySelector(
                    '[data-input-id="overview_input"]'
                );
                const overViewContainer = document.querySelector('#overview_main_label_viz');
                overViewContainer.after(overviewTimeInput);
            },
            300,
            5000
        );

        return () => {};
    }, []);

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore width="100%" height="auto" />
        </DashboardContextProvider>
    ) : null;
};
