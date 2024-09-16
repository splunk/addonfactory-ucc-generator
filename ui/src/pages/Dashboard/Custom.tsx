import React, { useEffect, useCallback, useRef } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import type { DashboardCoreApi } from '@splunk/dashboard-types';
import { getActionButtons } from './utils';

/**
 * @param {object} props
 * @param {object} props.dashboardDefinition custom dashboard definition
 */
export const CustomDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown> | null;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);

    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    useEffect(() => {
        if (dashboardCoreApi.current && dashboardDefinition) {
            dashboardCoreApi.current.updateDefinition(dashboardDefinition);
        }
    }, [dashboardDefinition]);

    return dashboardDefinition ? (
        <DashboardContextProvider preset={EnterpriseViewOnlyPreset}>
            <DashboardCore
                width="100%"
                height="auto"
                dashboardCoreApiRef={setDashboardCoreApi}
                actionMenus={getActionButtons('data_ingestion')}
            />
        </DashboardContextProvider>
    ) : null;
};
