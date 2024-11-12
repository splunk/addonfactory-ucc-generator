import React, { useEffect } from 'react';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { getActionButtons, waitForElementToDisplayAndMoveThemToCanvas } from './utils';

export const OverviewDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown> | null;
}) => {
    useEffect(() => {
        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="overview_input"]',
            '#overview_main_label_viz'
        );
        return () => {};
    }, []);

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore width="99%" height="auto" actionMenus={getActionButtons('overview')} />
        </DashboardContextProvider>
    ) : null;
};
