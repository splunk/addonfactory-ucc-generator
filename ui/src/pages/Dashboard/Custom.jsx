import React from 'react';
import PropTypes from 'prop-types';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';

/**
 * @param {object} props
 * @param {object} props.dashboardDefinition custom dashboard definition
 */
export const CustomDashboard = ({ dashboardDefinition }) =>
    dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore width="100%" height="auto" />
        </DashboardContextProvider>
    ) : null;

CustomDashboard.propTypes = {
    dashboardDefinition: PropTypes.object,
};
