import React from 'react';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { getActionButtons } from './utils';

/**
 * @param {object} props
 * @param {object} props.dashboardDefinition custom dashboard definition
 */
export const CustomDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown> | null;
}) =>
    dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore
                width="100%"
                height="auto"
                actionMenus={getActionButtons('data_ingestion')}
            />
        </DashboardContextProvider>
    ) : null;
