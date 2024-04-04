import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { waitForElementToDisplayAndMoveThemToCanvas } from './utils';

export const OverviewDashboard = ({ dashboardDefinition }) => {
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
            <DashboardCore width="100%" height="auto" />
        </DashboardContextProvider>
    ) : null;
};

OverviewDashboard.propTypes = {
    dashboardDefinition: PropTypes.object,
};
