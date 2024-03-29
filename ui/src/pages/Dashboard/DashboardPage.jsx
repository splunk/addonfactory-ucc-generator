import React, { useEffect, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import TabLayout from '@splunk/react-ui/TabLayout';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

function getBuildDirPath() {
    const scripts = document.getElementsByTagName('script');
    const scriptsCount = scripts.length;
    for (let i = 0; i < scriptsCount; i += 1) {
        const s = scripts[i];
        if (s.src && s.src.match(/js\/build/)) {
            const lastSlashIndex = s.src.lastIndexOf('/');
            return s.src.slice(0, lastSlashIndex);
        }
    }
    return '';
}

function loadJson(fileName, setData) {
    fetch(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${fileName}`)
        .then((res) => res.json())
        .then((external) => {
            setData(external);
        })
        .catch((e) => {
            console.error('Loading file failed: ', e);
        });
}

function DashboardPage() {
    const themeToVariant = {
        enterprise: { colorScheme: 'light', family: 'enterprise' },
        enterpriseDark: { colorScheme: 'dark', family: 'enterprise' },
        prisma: { colorScheme: 'dark', family: 'prisma' },
    };

    const [dashboardDefinition, setDashboardDefinition] = useState(null);
    const [dashboardDefinition2, setDashboardDefinition2] = useState(null);
    const [dashboardDefinition3, setDashboardDefinition3] = useState(null);
    const [dashboardDefinition4, setDashboardDefinition4] = useState(null);

    useEffect(() => {
        loadJson('overview_definition.json', setDashboardDefinition);
        loadJson('data_ingestion_tab_definition.json', setDashboardDefinition2);
        loadJson('errors_tab_definition.json', setDashboardDefinition3);
        loadJson('custom.json', setDashboardDefinition4);
        document.body.classList.add('grey_background');
        return () => {
            document.body.classList.remove('grey_background');
        };
    }, []);

    return (
        <ErrorBoundary>
            <div>
                {dashboardDefinition ? (
                    <DashboardContextProvider
                        preset={EnterpriseViewOnlyPreset}
                        initialDefinition={dashboardDefinition}
                    >
                        <DashboardCore width="100%" height="auto" />
                    </DashboardContextProvider>
                ) : null}
                {dashboardDefinition2 || dashboardDefinition4 ? (
                    <TabLayout
                        autoActivate
                        defaultActivePanelId={
                            dashboardDefinition2 ? 'dataIngestionTabPanel' : 'customTabPanel'
                        }
                    >
                        {dashboardDefinition2 ? (
                            <TabLayout.Panel label="Data ingestion" panelId="dataIngestionTabPanel">
                                <DashboardContextProvider
                                    preset={EnterpriseViewOnlyPreset}
                                    initialDefinition={dashboardDefinition2}
                                >
                                    <DashboardCore width="100%" height="auto" />
                                </DashboardContextProvider>
                            </TabLayout.Panel>
                        ) : null}
                        {dashboardDefinition3 ? (
                            <TabLayout.Panel label="Errors" panelId="errorsTabPanel">
                                <DashboardContextProvider
                                    preset={EnterpriseViewOnlyPreset}
                                    initialDefinition={dashboardDefinition3}
                                >
                                    <DashboardCore width="100%" height="auto" />
                                </DashboardContextProvider>
                            </TabLayout.Panel>
                        ) : null}
                        {dashboardDefinition4 ? (
                            <TabLayout.Panel label="Custom" panelId="customTabPanel">
                                <DashboardContextProvider
                                    preset={EnterpriseViewOnlyPreset}
                                    initialDefinition={dashboardDefinition4}
                                >
                                    <DashboardCore width="100%" height="auto" />
                                </DashboardContextProvider>
                            </TabLayout.Panel>
                        ) : null}
                    </TabLayout>
                ) : null}
            </div>
        </ErrorBoundary>
    );
}

export default DashboardPage;
