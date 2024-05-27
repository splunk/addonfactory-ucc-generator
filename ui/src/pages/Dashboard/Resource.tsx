import React, { useEffect } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import {
    getActionButtons,
    waitForElementToDisplay,
    waitForElementToDisplayAndMoveThemToCanvas,
} from './utils';

export const ResourceDashboard = ({
    dashboardDefinition,
}: {
    dashboardDefinition: Record<string, unknown>;
}) => {
    useEffect(() => {
        waitForElementToDisplayAndMoveThemToCanvas(
            '[data-input-id="resource_tab_input"]',
            '#resource_tab_description_viz'
        );
    }, []);

    useEffect(() => {
        const modifyNoSearchData = (parentElement: HTMLElement) => {
            const messageContainer = parentElement.querySelector(
                '[data-test="viz-waiting-for-input-message"]'
            );

            if (messageContainer?.textContent === 'No search results returned') {
                messageContainer.textContent =
                    'No results found. Resource consumption may not be supported for your operating system.';
            }
        };

        const config = { childList: true, subtree: true };
        const callback = (mutationsList: MutationRecord[]) => {
            mutationsList.forEach((mutation: MutationRecord) => {
                if (
                    mutation.type === 'childList' &&
                    mutation.addedNodes.length > 0 &&
                    (mutation.target as HTMLElement).dataset.test === 'viz-size-wrapper'
                ) {
                    modifyNoSearchData(mutation.target as HTMLElement);
                }
            });
        };
        // mutation is used to detect if dropdown value is changed
        // todo: do a better solution
        const observer = new MutationObserver(callback);

        waitForElementToDisplay(
            '#resource_tab_cpu_consumption_viz',
            '#resource_tab_memory_consumption_viz',
            () => {
                const cpuConsumption = document.querySelector('#resource_tab_cpu_consumption_viz');
                const memoryConsumption = document.querySelector(
                    '#resource_tab_memory_consumption_viz'
                );
                if (cpuConsumption) {
                    modifyNoSearchData(cpuConsumption as HTMLElement);
                    observer.observe(cpuConsumption, config);
                }

                if (memoryConsumption) {
                    modifyNoSearchData(memoryConsumption as HTMLElement);
                    observer.observe(memoryConsumption, config);
                }
            },
            400,
            4000
        );

        return () => {
            observer.disconnect();
        };
    }, [dashboardDefinition]);

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            initialDefinition={dashboardDefinition}
        >
            <DashboardCore width="100%" height="auto" actionMenus={getActionButtons('error')} />
        </DashboardContextProvider>
    ) : null;
};
