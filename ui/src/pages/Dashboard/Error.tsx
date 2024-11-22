import React, { useEffect } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Button from '@splunk/react-ui/Button';
import { variables } from '@splunk/themes';
import styled from 'styled-components';
import SearchJob from '@splunk/search-job';
import type { DashboardCoreApi } from '@splunk/dashboard-types';

import { getActionButtons, waitForElementToDisplayAndMoveThemToCanvas } from './utils';
import { OPEN_SEARCH_LABEL } from './ErrorPageConfig';
import { getUnifiedConfigs } from '../../util/util';

const OpenSearchStyledBtn = styled(Button)`
    max-width: fit-content;
    font-size: ${variables.fontSize};
    align-content: flex-end;
    place-self: end;
    grid-column: 2;
    grid-row: 4;
    bottom: 8px;
`;

// const OpenTroubleshootingBtn = styled(OpenSearchStyledBtn)` // commented out for now but will be needed latter on
//     margin-right: 145px;
// `;

export const ErrorDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown>;
}) => {
    // const [displayTroubleShootingModal, setDisplayTroubleShootingModal] = useState(false); // commented out for now but will be needed latter on
    const dashboardCoreApi = React.useRef<DashboardCoreApi | null>();

    const globalConfig = getUnifiedConfigs();

    const setDashboardCoreApi = React.useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);

    useEffect(() => {
        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="errors_tab_input"][data-input-type="input.timerange"]',
            '#errors_tab_description_viz'
        );

        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="errors_type_input"][data-input-type="input.multiselect"]',
            '#errors_tab_errors_list_viz'
        );

        waitForElementToDisplayAndMoveThemToCanvas(
            '#open_search_error_events_tab_with_types',
            '#errors_tab_errors_list_viz'
        );
        // waitForElementToDisplayAndMoveThemToCanvas( // commented out for now but will be needed latter on
        //     '#open_trouble_shooting_overlay',
        //     '#errors_tab_errors_list_viz'
        // );
    }, []);

    useEffect(() => {
        // dashboardCoreApi?.current at beginning is null so ignore that iteration
        if (!dashboardCoreApi?.current) {
            return () => {};
        }

        // search call to for error types
        const mySearchJob = SearchJob.create(
            {
                search: `index=_internal source=*${globalConfig.meta.restRoot}* log_level=ERROR | dedup exc_l | table exc_l`,
                earliest_time: '0', // all time
                latest_time: 'now',
            },
            { cache: true, cancelOnUnload: true } // default cache 10min = 600 in seconds
        );

        const resultsSubscription = mySearchJob
            .getResults()
            .subscribe((results: { results?: Array<{ exc_l: string }> }) => {
                if (results?.results?.length) {
                    const copyJson = JSON.parse(JSON.stringify(dashboardDefinition));

                    copyJson.inputs.errors_type_input.options.items = [
                        {
                            label: 'All',
                            value: '*',
                        },
                    ];
                    results.results
                        .sort((a, b) => {
                            const nameA = a.exc_l.toUpperCase(); // ignore upper and lowercase
                            const nameB = b.exc_l.toUpperCase(); // ignore upper and lowercase
                            if (nameA < nameB) {
                                return -1;
                            }
                            if (nameA > nameB) {
                                return 1;
                            }

                            // names must be equal
                            return 0;
                        })
                        .forEach((result) =>
                            copyJson.inputs.errors_type_input.options.items.push({
                                label: result.exc_l,
                                value: `"${result.exc_l}"`,
                            })
                        );

                    dashboardCoreApi.current?.updateDefinition(copyJson);
                }
            });

        return () => {
            resultsSubscription.unsubscribe();
        };
    }, [dashboardDefinition, globalConfig.meta.restRoot, dashboardCoreApi]);

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
            featureFlags={{
                enableSmartSourceDS: true,
            }}
        >
            <>
                <OpenSearchStyledBtn
                    id="open_search_error_events_tab_with_types"
                    label={OPEN_SEARCH_LABEL}
                    openInNewContext
                    onClick={
                        () =>
                            (
                                document.querySelector(
                                    '#errors_tab_errors_list_viz [data-test="open-search-button"]'
                                ) as HTMLElement
                            )?.click() // todo: no better easy way to get events table query
                    }
                />
                {/* <OpenTroubleshootingBtn // commented out for now but will be needed latter on
                    id="open_trouble_shooting_overlay"
                    label={TROUBLESHOOTING_BTN_LABEL}
                    onClick={() => setDisplayTroubleShootingModal(true)}
                    icon={<QuestionCircle width={16} height={16} />}
                /> */}
                {/* <DashboardInfoModal  // commented out for now but will be needed latter on
                    title={TROUBLESHOOTING_CONFIG.TITLE}
                    subtitle={TROUBLESHOOTING_CONFIG.DESCRIPTION}
                    open={displayTroubleShootingModal}
                    handleRequestClose={() => setDisplayTroubleShootingModal(false)}
                    closeBtnLabel={TROUBLESHOOTING_CONFIG.CLOSE_LABEL}
                    infoMessage={TROUBLESHOOTING_CONFIG.INFO_MESSAGE}
                    listIntroductionText={TROUBLESHOOTING_CONFIG.LIST_INTRODUCTION_TEXT}
                    errorTypesInfo={TROUBLESHOOTING_CONFIG.BASIC_ERROR_TYPES}
                    troubleshootingButton={{
                        link: globalConfig.pages.dashboard?.troubleshooting_url,
                    }}
                /> */}
                <DashboardCore
                    width="100%"
                    height="auto"
                    actionMenus={getActionButtons('error')}
                    dashboardCoreApiRef={setDashboardCoreApi}
                />
            </>
        </DashboardContextProvider>
    ) : null;
};
