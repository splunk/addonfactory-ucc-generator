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

/**
 *
 * @param {string} fileName name of json file in custom dir
 * @param {string} setData callback, called with data as params
 */
function loadJson(fileName, dataHandler) {
    fetch(/* webpackIgnore: true */ `${getBuildDirPath()}/custom/${fileName}`)
        .then((res) => res.json())
        .then((external) => {
            dataHandler(external);
        })
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.error('Loading file failed: ', e);
        });
}

function DashboardPage() {
    const [overviewDef, setOverviewDef] = useState(null);
    const [dataIngestionDef, setDataIngestionDef] = useState(null);
    const [errorDef, setErrorDef] = useState(null);
    const [customDef, setCustomDef] = useState(null);

    useEffect(() => {
        loadJson('panels_to_display.json', (data) => {
            if (data?.default) {
                loadJson('overview_definition.json', setOverviewDef);
                loadJson('data_ingestion_tab_definition.json', setDataIngestionDef);
                loadJson('errors_tab_definition.json', setErrorDef);
            }
            if (data?.custom) {
                loadJson('custom.json', setCustomDef);
            }
        });

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
