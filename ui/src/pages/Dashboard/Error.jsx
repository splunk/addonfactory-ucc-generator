import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import { waitForElementToDisplayAndMoveThemToCanvas } from './utils';

export const ErrorDashboard = ({ dashboardDefinition }) => {
    useEffect(() => {
        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="errors_tab_input"]',
            '#errors_tab_description_viz'
        );
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

ErrorDashboard.propTypes = {
    dashboardDefinition: PropTypes.object,
};
