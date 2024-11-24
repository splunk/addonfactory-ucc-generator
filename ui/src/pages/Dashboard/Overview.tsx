import React, { useCallback, useEffect, useRef } from 'react';
import { DashboardCoreApi } from '@splunk/dashboard-types';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { getActionButtons, waitForElementToDisplayAndMoveThemToCanvas } from './utils';
import { FEATURE_FLAGS } from './consts';

export const OverviewDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown> | null;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);

    useEffect(() => {
        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="overview_input"]',
            '#overview_main_label_viz'
        );
        return () => {};
    }, []);

    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
            featureFlags={FEATURE_FLAGS}
        >
            <DashboardCore
                dashboardCoreApiRef={setDashboardCoreApi}
                width="99%"
                height="auto"
                actionMenus={getActionButtons('overview')}
            />
        </DashboardContextProvider>
    ) : null;
};
