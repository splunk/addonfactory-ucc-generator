import { RefreshButton, ExportButton, OpenSearchButton } from '@splunk/dashboard-action-buttons';
import React from 'react';

export const waitForElementToDisplay = (
    selector: string,
    selector2: string,
    callback: { (): void; (): void },
    checkFrequencyInMs: number | undefined,
    timeoutInMs: number
) => {
    const startTimeInMs = Date.now();
    const loopSearch = () => {
        if (document.querySelector(selector) && document.querySelector(selector2)) {
            callback();
        } else {
            setTimeout(() => {
                if (Date.now() - startTimeInMs > timeoutInMs) {
                    return;
                }
                loopSearch();
            }, checkFrequencyInMs);
        }
    };
    loopSearch();
};

/**
 * @param {string} elemSelector
 * @param {string} containerSelector
 */
export const waitForElementToDisplayAndMoveThemToCanvas = (
    elemSelector: string,
    containerSelector: string,
    ifMoveAfter = false
) => {
    waitForElementToDisplay(
        elemSelector,
        containerSelector,
        () => {
            const element = document.querySelector(elemSelector);
            const container = document.querySelector(containerSelector);
            if (element && container) {
                if (ifMoveAfter) {
                    container?.after(element);
                } else {
                    container?.before(element);
                }
                element.classList.remove('invisible_before_moving');
            }
        },
        300,
        5000
    );
};

const queryMap: Record<string, string> = {
    'Source type': 'st',
    Source: 's',
    Host: 'h',
    Index: 'idx',
    Account: 'event_account',
    Input: 'event_input',
};

/**
 *
 * @param {string} searchValue value of search input
 * @param {boolean} hideToggleValue state of toggle input
 * @param {string} oldQuery current query
 * @param {string} selectedLabel current selected query type
 */
export const createNewQueryBasedOnSearchAndHideTraffic = (
    searchValue: string,
    hideToggleValue: unknown,
    oldQuery: string,
    selectedLabel: string
) => {
    const firstPipeIndex = oldQuery.indexOf('|');
    const part1 = oldQuery.substring(0, firstPipeIndex);
    const afterPart1 = oldQuery.substring(firstPipeIndex);

    // const gbCalculationIndex = afterPart1.indexOf('GB=round');
    // const beforeGbRoundPart = afterPart1.substring(0, gbCalculationIndex);

    // const gbRoundAndAfter = afterPart1.substring(gbCalculationIndex);
    // const firstPipeAfterGbRound = gbRoundAndAfter.indexOf('|');
    // const gbRoundPipe = gbRoundAndAfter.substring(0, firstPipeAfterGbRound);
    // const afterGbRoundipe = gbRoundAndAfter.substring(firstPipeAfterGbRound);

    const searchQuery = searchValue ? `${queryMap[selectedLabel] || 'st'}=*${searchValue}* ` : '';

    // const hideNoTrafficQuery = hideToggleValue ? '| where Bytes>0 ' : '';
    const newQuery = `${part1}${searchQuery}${afterPart1}`;
    // const newQuery = `${part1}${searchQuery}${beforeGbRoundPart}${gbRoundPipe}${hideNoTrafficQuery}${afterGbRoundipe}`;
    return newQuery;
};

export const openSearchInNewTabWithQuery = (query: string, queryParams: Record<string, string>) => {
    const dashabordUrl = window.location.origin + window.location.pathname;
    const lastIndex = dashabordUrl.lastIndexOf('/');
    const searchUrl = new URL(`${dashabordUrl.slice(0, lastIndex)}/search`);
    searchUrl.searchParams.append('q', query);
    Object.keys(queryParams).forEach((paramKey) => {
        searchUrl.searchParams.append(paramKey, queryParams[paramKey]);
    });
    window.open(searchUrl, '_blank')?.focus();
};

export const getActionButtons = (serviceName: string) => {
    const actionMenus = [
        <RefreshButton key={`${serviceName}_refresh`} />,
        <ExportButton key={`${serviceName}_export`} />,
        <OpenSearchButton
            key={`${serviceName}_opensearch`}
            onOpenSearchClick={(x) => {
                openSearchInNewTabWithQuery(x.options.query, x.options.queryParameters);
            }}
        />,
    ];
    return actionMenus;
};

export const makeVisualAdjustmentsOnDataIngestionPage = () => {
    waitForElementToDisplayAndMoveThemToCanvas(
        '[data-input-id="data_ingestion_input"]',
        '#data_ingestion_label_viz'
    );

    waitForElementToDisplayAndMoveThemToCanvas(
        '[data-input-id="data_ingestion_table_input"]',
        '#data_ingestion_table_viz'
    );

    waitForElementToDisplayAndMoveThemToCanvas(
        '#data_ingestion_search',
        '#data_ingestion_table_viz'
    );

    // waitForElementToDisplayAndMoveThemToCanvas(
    //     '#switch_hide_no_traffic_wrapper',
    //     '#data_ingestion_table_viz'
    // );

    waitForElementToDisplayAndMoveThemToCanvas(
        '#info_message_for_data_ingestion',
        '#data_ingestion_table_viz div'
    );
};

const VIEW_BY_EXTRA_LABEL_DESC: Record<string, string> = {
    Host: 'Event metrics are not available.',
    Input: 'Volume metrics are not available.',
    Account: 'Volume metrics are not available.',
};

export const addDescriptionToExpandedViewByOptions = (target: Element) => {
    const optionPopupId = target?.getAttribute('data-test-popover-id');

    if (!optionPopupId) {
        return;
    }

    const optionPopup = document.getElementById(optionPopupId);
    if (!optionPopup) {
        return;
    }

    // hiding filter element as it would require constant
    // addition of descritpions and we got only few elements
    const filterElem = optionPopup.querySelector('[data-test="filter"]') as HTMLElement;
    if (filterElem) {
        filterElem.style.display = 'none';
    }

    const allOptions = optionPopup.querySelectorAll('[role="option"]');
    allOptions.forEach((option) => {
        const title = option.getAttribute('title');
        if (
            title &&
            VIEW_BY_EXTRA_LABEL_DESC[title] &&
            !option.querySelector(`#${title}_additional_desc`)
        ) {
            const optionText = option.querySelector('[data-test="label"]');
            if (optionText) {
                const description = document.createElement('p');
                description.innerText = VIEW_BY_EXTRA_LABEL_DESC[title];
                description.id = `${title}_additional_desc`;
                description.style.color = '#6C7785';
                description.style.margin = '0';
                optionText.append(description);
            }
        }
    });
};
