import React, { useEffect, useState } from 'react';
import TabLayout from '@splunk/react-ui/TabLayout';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { OverviewDashboard } from './Overview';
import { DataIngestionDashboard } from './DataIngestion';
import { ErrorDashboard } from './Error';
import { CustomDashboard } from './Custom';
import './dashboardStyle.css';

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

    const [overviewDef, setOverviewDef] = useState(null);
    const [dataIngestionDef, setDataIngestionDef] = useState(null);
    const [errorDef, setErrorDef] = useState(null);
    const [customDef, setCustomDef] = useState(null);

    useEffect(() => {
        loadJson('overview_definition.json', setOverviewDef);
        loadJson('data_ingestion_tab_definition.json', setDataIngestionDef);
        loadJson('errors_tab_definition.json', setErrorDef);
        loadJson('custom.json', setCustomDef);

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
                    <TabLayout
                        autoActivate
                        defaultActivePanelId={'dataIngestionTabPanel'}
                        onChange={(event, data) => {
                            console.log({ event, data });
                        }}
                    >
                        {dataIngestionDef && (
                            <TabLayout.Panel
                                label="Data ingestion"
                                panelId="dataIngestionTabPanel"
                                style={{ minWidth: '150px' }}
                            >
                                <DataIngestionDashboard dashboardDefinition={dataIngestionDef} />
                            </TabLayout.Panel>
                        )}

                        {errorDef && (
                            <TabLayout.Panel
                                label="Errors"
                                panelId="errorsTabPanel"
                                style={{ minWidth: '150px' }}
                            >
                                <ErrorDashboard dashboardDefinition={errorDef} />
                            </TabLayout.Panel>
                        )}
                        {customDef && (
                            <TabLayout.Panel
                                label="Custom"
                                panelId="customTabPanel"
                                style={{ minWidth: '150px' }}
                            >
                                <CustomDashboard dashboardDefinition={customDef} />
                            </TabLayout.Panel>
                        )}
                    </TabLayout>
                ) : (
                    <CustomDashboard dashboardDefinition={customDef} />
                )}
            </div>
        </ErrorBoundary>
    );
}

export default DashboardPage;
