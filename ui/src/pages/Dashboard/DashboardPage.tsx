import React, { useEffect, useState } from 'react';
import TabLayout from '@splunk/react-ui/TabLayout';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { OverviewDashboard } from './Overview';
import { DataIngestionDashboard } from './DataIngestion';
import { ErrorDashboard } from './Error';
import { ResourceDashboard } from './Resource';
import { CustomDashboard } from './Custom';
import './dashboardStyle.css';
import { loadDashboardJsonDefinition } from './utils';

function DashboardPage() {
    const [overviewDef, setOverviewDef] = useState<Record<string, unknown> | null>(null);
    const [dataIngestionDef, setDataIngestionDef] = useState<Record<string, unknown> | null>(null);
    const [errorDef, setErrorDef] = useState<Record<string, unknown> | null>(null);
    const [resourceDef, setResourceDef] = useState<Record<string, unknown> | null>(null);
    const [customDef, setCustomDef] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        loadDashboardJsonDefinition(
            'panels_to_display.json',
            (data: { default?: boolean; custom?: boolean }) => {
                if (data?.default) {
                    loadDashboardJsonDefinition('overview_definition.json', setOverviewDef);
                    loadDashboardJsonDefinition(
                        'data_ingestion_tab_definition.json',
                        setDataIngestionDef
                    );
                    loadDashboardJsonDefinition('errors_tab_definition.json', setErrorDef);
                    loadDashboardJsonDefinition('resources_tab_definition.json', setResourceDef);
                }
                if (data?.custom) {
                    loadDashboardJsonDefinition('custom.json', setCustomDef);
                }
            }
        );

        document.body.classList.add('grey_background');
        return () => {
            document.body.classList.remove('grey_background');
        };
    }, []);

    return (
        <ErrorBoundary>
            <div>
                <OverviewDashboard dashboardDefinition={overviewDef} />
                {overviewDef ? (
                    // if overview is loaded then all default tabs should be present so table is injected
                    <TabLayout
                        autoActivate
                        defaultActivePanelId="dataIngestionTabPanel"
                        id="dashboardTable"
                        style={{ minHeight: '98vh' }}
                    >
                        {dataIngestionDef && (
                            <TabLayout.Panel label="Data ingestion" panelId="dataIngestionTabPanel">
                                <DataIngestionDashboard dashboardDefinition={dataIngestionDef} />
                            </TabLayout.Panel>
                        )}

                        {errorDef && (
                            <TabLayout.Panel label="Errors" panelId="errorsTabPanel">
                                <ErrorDashboard dashboardDefinition={errorDef} />
                            </TabLayout.Panel>
                        )}
                        {resourceDef && (
                            <TabLayout.Panel
                                label="Resource consumption"
                                panelId="resourceTabPanel"
                            >
                                <ResourceDashboard dashboardDefinition={resourceDef} />
                            </TabLayout.Panel>
                        )}
                        {customDef && (
                            <TabLayout.Panel label="Custom" panelId="customTabPanel">
                                <CustomDashboard dashboardDefinition={customDef} />
                            </TabLayout.Panel>
                        )}
                    </TabLayout>
                ) : (
                    // if overview is null then custom tab is the only displayed component
                    // so no need to show table
                    <CustomDashboard dashboardDefinition={customDef} />
                )}
            </div>
        </ErrorBoundary>
    );
}

export default DashboardPage;
