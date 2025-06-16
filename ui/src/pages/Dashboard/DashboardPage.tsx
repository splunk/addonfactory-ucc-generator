import React, { ReactChild, Suspense, useEffect, useRef, useState } from 'react';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import TabLayout from '@splunk/react-ui/TabLayout';
import styled from 'styled-components';
import variables from '@splunk/themes/variables';
import pick from '@splunk/themes/pick';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import { getBuildDirPath } from '../../util/script';
import { getUnifiedConfigs } from '../../util/util';
import { GlobalDashboardStyle } from './dashboardStyle';
import { WaitSpinnerWrapper } from '../../components/table/CustomTableStyle';

const CustomDashboard = React.lazy(() => import('./Custom'));
const DataIngestionDashboard = React.lazy(() => import('./DataIngestion'));
const OverviewDashboard = React.lazy(() => import('./Overview'));
const ErrorDashboard = React.lazy(() => import('./Error'));
const ResourceDashboard = React.lazy(() => import('./Resource'));

/**
 *
 * @param {string} fileName name of json file in custom dir
 * @param {boolean} isComponentMounted used to remove component data leakage, determines if component is still mounted and dataHandler referes to setState
 * @param {string} dataHandler callback, called with data as params
 */
export function loadJson(
    fileName: string,
    isComponentMounted: boolean,
    dataHandler: (data: Record<string, unknown>) => void
) {
    fetch(/* @vite-ignore */ `${getBuildDirPath()}/custom/${fileName}`)
        .then((res) => res.json())
        .then((external) => {
            if (isComponentMounted) {
                dataHandler(external);
            }
        })
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.error('Loading file failed: ', e);
        });
}

const DashboardStyles = styled.div`
    --muted-text-color: ${pick({
        enterprise: {
            light: variables.gray45,
            dark: variables.gray80,
        },
    })};
`;

const LazyPanel = ({
    label,
    panelId,
    children,
}: {
    label: string;
    panelId: string;
    children: ReactChild;
}) => (
    <TabLayout.Panel label={label} panelId={panelId}>
        <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>{children}</Suspense>
    </TabLayout.Panel>
);

function DashboardPage() {
    const [overviewDef, setOverviewDef] = useState<Record<string, unknown> | null>(null);
    const [dataIngestionDef, setDataIngestionDef] = useState<Record<string, unknown> | null>(null);
    const [errorDef, setErrorDef] = useState<Record<string, unknown> | null>(null);
    const [resourceDef, setResourceDef] = useState<Record<string, unknown> | null>(null);
    const [customDef, setCustomDef] = useState<Record<string, unknown> | null>(null);
    const isComponentMounted = useRef<boolean>(true);

    useEffect(() => {
        loadJson(
            'panels_to_display.json',
            isComponentMounted.current,
            (data: { default?: boolean; custom?: boolean }) => {
                if (data?.default) {
                    loadJson(
                        'overview_definition.json',
                        isComponentMounted.current,
                        setOverviewDef
                    );
                    loadJson(
                        'data_ingestion_tab_definition.json',
                        isComponentMounted.current,
                        setDataIngestionDef
                    );
                    loadJson('errors_tab_definition.json', isComponentMounted.current, setErrorDef);
                    loadJson(
                        'resources_tab_definition.json',
                        isComponentMounted.current,
                        setResourceDef
                    );
                }
                if (data?.custom) {
                    loadJson('custom.json', isComponentMounted.current, setCustomDef);
                }
            }
        );

        return () => {
            isComponentMounted.current = false;
        };
    }, []);

    const globalConfig = getUnifiedConfigs();

    return (
        <ErrorBoundary>
            <GlobalDashboardStyle />
            <DashboardStyles>
                <OverviewDashboard dashboardDefinition={overviewDef} />
                {overviewDef ? ( // if overview is loaded then all default tabs should be present so table is injected
                    <TabLayout
                        autoActivate
                        defaultActivePanelId="dataIngestionTabPanel"
                        id="dashboardTable"
                        data-test="dashboardTable"
                        style={{ minHeight: '98vh' }}
                    >
                        {dataIngestionDef && (
                            <LazyPanel label="Data ingestion" panelId="dataIngestionTabPanel">
                                <DataIngestionDashboard dashboardDefinition={dataIngestionDef} />
                            </LazyPanel>
                        )}
                        {errorDef && (
                            <LazyPanel label="Errors" panelId="errorsTabPanel">
                                <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                                    <ErrorDashboard dashboardDefinition={errorDef} />
                                </Suspense>
                            </LazyPanel>
                        )}
                        {resourceDef && (
                            <LazyPanel label="Resource consumption" panelId="resourceTabPanel">
                                <ResourceDashboard dashboardDefinition={resourceDef} />
                            </LazyPanel>
                        )}
                        {customDef && (
                            <LazyPanel
                                label={
                                    globalConfig.pages.dashboard?.settings?.custom_tab_name ||
                                    'Custom'
                                }
                                panelId="customTabPanel"
                            >
                                <CustomDashboard dashboardDefinition={customDef} />
                            </LazyPanel>
                        )}
                    </TabLayout>
                ) : (
                    // if overview is null then custom tab is the only displayed component
                    // so no need to show table
                    <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                        <CustomDashboard dashboardDefinition={customDef} />
                    </Suspense>
                )}
                {!overviewDef && !customDef ? (
                    <WaitSpinner size="medium" data-testid="wait-spinner" />
                ) : null}
            </DashboardStyles>
        </ErrorBoundary>
    );
}

export default DashboardPage;
