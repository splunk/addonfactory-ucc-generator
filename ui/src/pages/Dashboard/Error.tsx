import React, { useEffect, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import Button from '@splunk/react-ui/Button';
import { variables } from '@splunk/themes';
import styled from 'styled-components';
import QuestionCircle from '@splunk/react-icons/QuestionCircle';

import { getActionButtons, waitForElementToDisplayAndMoveThemToCanvas } from './utils';
import DashboardInfoModal from '../../components/DashboardInfoModal/DashboardInfoModal';
import {
    OPEN_SEARCH_LABEL,
    TROUBLESHOOTING_BTN_LABEL,
    TROUBLESHOOTING_CONFIG,
} from './ErrorPageConfig';

const OpenSearchStyledBtn = styled(Button)`
    max-width: fit-content;
    font-size: ${variables.fontSize};
    align-content: flex-end;
    place-self: end;
    grid-column: 5;
    grid-row: 6;
    top: 62px;
`;

const OpenTroubleshootingBtn = styled(OpenSearchStyledBtn)`
    margin-right: 145px;
`;

export const ErrorDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown>;
}) => {
    const [displayTroubleShootingModal, setDisplayTroubleShootingModal] = useState(false);

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
        waitForElementToDisplayAndMoveThemToCanvas(
            '#open_trouble_shooting_overlay',
            '#errors_tab_errors_list_viz'
        );

        // call to for error types
        // index=_internal source=*splunk_ta_uccexample* ERROR | dedup exc_l | table exc_l
    }, []);

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
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
                <OpenTroubleshootingBtn
                    id="open_trouble_shooting_overlay"
                    label={TROUBLESHOOTING_BTN_LABEL}
                    onClick={() => setDisplayTroubleShootingModal(true)}
                    icon={<QuestionCircle width={16} height={16} />}
                />
                <DashboardInfoModal
                    title={TROUBLESHOOTING_CONFIG.TITLE}
                    subtitle={TROUBLESHOOTING_CONFIG.DESCRIPTION}
                    open={displayTroubleShootingModal}
                    handleRequestClose={() => setDisplayTroubleShootingModal(false)}
                    closeBtnLabel={TROUBLESHOOTING_CONFIG.CLOSE_LABEL}
                    infoMessage={TROUBLESHOOTING_CONFIG.INFO_MESSAGE}
                    listIntroductionText={TROUBLESHOOTING_CONFIG.LIST_INTRODUCTION_TEXT}
                    errorTypesInfo={TROUBLESHOOTING_CONFIG.BASIC_ERROR_TYPES}
                />
                <DashboardCore width="100%" height="auto" actionMenus={getActionButtons('error')} />
            </>
        </DashboardContextProvider>
    ) : null;
};
