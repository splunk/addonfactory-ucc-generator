import React, { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { DashboardCore } from '@splunk/dashboard-core';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import EnterpriseViewOnlyPreset from '@splunk/dashboard-presets/EnterpriseViewOnlyPreset';
import type { DashboardCoreApi } from '@splunk/dashboard-types';

import {
    createNewQueryForDataVolumeInModal,
    createNewQueryForNumberOfEventsInModal,
    getActionButtons,
    setandRemoveOptionsFromDropdown,
} from './utils';

/**
 * @param {object} props
 * @param {object} props.dashboardDefinition custom dashboard definition
 * @param {string} props.selectedLabelForInput state for display title in the modal
 * @param {object} props.setDisplayModalForInput setstate for header value of modal
 */
export const DashboardModal = ({
    dashboardDefinition,
    selectedLabelForInput,
    setDisplayModalForInput,
}: {
    dashboardDefinition: Record<string, unknown> | null;
    selectedLabelForInput: string;
    setDisplayModalForInput: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const dashboardCoreApi = useRef<DashboardCoreApi | null>(null);
    const setDashboardCoreApi = useCallback((api: DashboardCoreApi | null) => {
        dashboardCoreApi.current = api;
    }, []);
    const [inputSelectorValue, setInputSelectorValue] = useState('');

    const updateModalData = useCallback(
        (selectedValue: string) => {
            const copyDashboardDefinition = JSON.parse(JSON.stringify(dashboardDefinition));
            const selectedInput =
                copyDashboardDefinition.inputs?.data_ingestion_modal_dynamic_input?.title || '';
            const dataVolumeQuery = createNewQueryForDataVolumeInModal(
                selectedInput,
                selectedValue
            );
            copyDashboardDefinition.inputs.data_ingestion_modal_dynamic_input.options.defaultValue =
                selectedValue;
            const eventsQuery = createNewQueryForNumberOfEventsInModal(
                selectedInput,
                selectedValue
            );

            copyDashboardDefinition.dataSources.data_ingestion_modal_data_volume_ds.options.query =
                dataVolumeQuery;
            copyDashboardDefinition.dataSources.ds_search_1.options.query = eventsQuery;
            copyDashboardDefinition.inputs.data_ingestion_modal_dynamic_input.options.selectFirstSearchResult =
                false;
            return copyDashboardDefinition;
        },
        [dashboardDefinition]
    );

    useEffect(() => {
        let observer: MutationObserver | null = null;

        const setupObserver = (targetNode: Element) => {
            const config = { attributes: true };

            const callback = (mutationsList: MutationRecord[]) => {
                mutationsList.forEach((mutation: MutationRecord) => {
                    if (mutation.attributeName === 'aria-expanded') {
                        setandRemoveOptionsFromDropdown(
                            mutation.target as Element,
                            selectedLabelForInput
                        );
                    }
                });
            };

            observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
        };

        const findTargetNode = () => {
            const targetNode = document.querySelector(
                '[data-input-id="data_ingestion_modal_dynamic_input"] button'
            );

            if (targetNode) {
                setupObserver(targetNode);
                const innerSpan = targetNode.querySelector('span > span');
                if (innerSpan) {
                    innerSpan.textContent = inputSelectorValue || selectedLabelForInput;
                }
            } else {
                // Retry if the targetNode is not yet available
                requestAnimationFrame(findTargetNode);
            }
        };

        // Start finding the node after the component mounts
        requestAnimationFrame(findTargetNode);

        // Cleanup observer on component unmount
        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputSelectorValue]);

    // Update the dashboard when the definition or selected input changes
    useEffect(() => {
        if (dashboardCoreApi.current && dashboardDefinition) {
            const updatedModalData = updateModalData(selectedLabelForInput);
            dashboardCoreApi.current.updateDefinition(updatedModalData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardDefinition]);

    // Event handler for input changes in the modal
    const handleDashboardEvent = useCallback(
        (event) => {
            if (
                event.targetId === 'data_ingestion_modal_dynamic_input' &&
                event.type === 'input.change' &&
                dashboardCoreApi.current
            ) {
                setInputSelectorValue(event.payload.value);
                setDisplayModalForInput(event.payload.value);
                const updatedModalData = updateModalData(event.payload.value);
                dashboardCoreApi.current.updateDefinition(updatedModalData);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dashboardDefinition]
    );

    const dashboardPlugin = useMemo(
        () => ({ onEventTrigger: handleDashboardEvent }),
        [handleDashboardEvent]
    );

    return dashboardDefinition ? (
        <DashboardContextProvider
            preset={EnterpriseViewOnlyPreset}
            dashboardPlugin={dashboardPlugin}
        >
            <DashboardCore
                width="100%"
                height="auto"
                dashboardCoreApiRef={setDashboardCoreApi}
                actionMenus={getActionButtons('data_ingestion')}
            />
        </DashboardContextProvider>
    ) : null;
};
