import { RefreshButton, ExportButton, OpenSearchButton } from '@splunk/dashboard-action-buttons';
import React from 'react';
import SearchJob from '@splunk/search-job';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { getBuildDirPath } from '../../util/script';
import { SearchResponse } from './DataIngestion.types';
import { getSearchUrl } from '../../util/searchUtil';

/**
 *
 * @param {string} fileName name of json file in custom dir
 * @param {string} setData callback, called with data as params
 */
export function loadDashboardJsonDefinition(
    fileName: string,
    dataHandler: (data: Record<string, unknown>) => void
) {
    fetch(/* @vite-ignore */ `${getBuildDirPath()}/custom/${fileName}`)
        .then((res) => res.json())
        .then((external) => {
            dataHandler(external);
        })
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.error('Loading file failed: ', e);
        });
}

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

export const queryMapForEvents: Record<string, string> = {
    'Source type': 'sourcetype_ingested',
    Source: 'modular_input_name',
    Host: 'event_host',
    Index: 'event_index',
    Account: 'event_account',
    Input: 'event_input',
};

export const queryMap: Record<string, string> = {
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

export const openSearchInNewTabWithQuery = (query: string | null, queryParams: object | null) => {
    if (!query) {
        // eslint-disable-next-line no-console
        console.error('No search query provided - openSearchInNewTabWithQuery');
        return;
    }

    const searchUrl = getSearchUrl({ q: query, ...queryParams });

    window.open(searchUrl, '_blank')?.focus();
};

export const getActionButtons = (serviceName: string) => {
    const actionMenus = [
        <RefreshButton key={`${serviceName}_refresh`} />,
        <ExportButton key={`${serviceName}_export`} />,
        <OpenSearchButton
            key={`${serviceName}_opensearch`}
            onOpenSearchClick={(x) => {
                if (
                    typeof x?.options?.query === 'string' &&
                    typeof x?.options?.queryParameters === 'object'
                ) {
                    openSearchInNewTabWithQuery(x.options.query, x.options.queryParameters);
                }
            }}
        />,
    ];
    return actionMenus;
};

export const makeVisualAdjustmentsOnDataIngestionModal = () => {
    waitForElementToDisplayAndMoveThemToCanvas(
        '#data_ingestion_modal_dropdown',
        '[data-input-id="data_ingestion_modal_time_window"]'
    );
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

export const createNewQueryForDataVolumeInModal = (
    selectedInput: string,
    selectedValue: string,
    query: string
) => {
    const selectedLabel = queryMap[selectedInput];
    const updatedQuery = query.replace('|', `${selectedLabel} = "${selectedValue}" |`);

    return updatedQuery;
};

export const createNewQueryForNumberOfEventsInModal = (
    selectedInput: string,
    selectedValue: string,
    query: string
) => {
    const selectedLabel = queryMapForEvents[selectedInput];
    const updatedQuery = query.replace('|', `${selectedLabel} = "${selectedValue}" |`);

    return updatedQuery;
};

function getLicenseUsageSearchParams(globalConfig: GlobalConfig) {
    const dashboard = globalConfig?.pages.dashboard as {
        settings: {
            custom_license_usage?: {
                determine_by?: string;
                search_condition?: string[];
            };
        };
    };
    const inputNames = globalConfig?.pages.inputs?.services;
    let licUsgCondition = inputNames?.map((item) => `${item.name}*`).join(',');

    try {
        const licUsgType = dashboard?.settings?.custom_license_usage?.determine_by || 'Source';
        const licUsgSearchItems = dashboard?.settings?.custom_license_usage?.search_condition;
        const determineBy = queryMap[licUsgType] || 's';

        const combinedItems = [
            licUsgCondition || [],
            ...(licUsgSearchItems?.map((el) => `"${el}"`) || []),
        ];

        licUsgCondition = combinedItems.join(',');
        return [determineBy, licUsgCondition];
    } catch (error) {
        // eslint-disable-next-line no-console
        console.info(
            'No custom license usage search condition found. Proceeding with default parameters.'
        );
        return null;
    }
}

// Function to run a search job for a given query
export const runSearchJob = (searchQuery: string): Promise<SearchResponse> =>
    new Promise((resolve, reject) => {
        const searchJob = SearchJob.create({ search: searchQuery });

        const resultsSubscription = searchJob.getResults({ count: 0 }).subscribe({
            next: (response: SearchResponse) => {
                try {
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error: (error: unknown) => {
                reject(error);
            },
            complete: () => {
                resultsSubscription.unsubscribe();
            },
        });
    });

export async function fetchDropdownValuesFromQuery(
    globalConfig: GlobalConfig
): Promise<SearchResponse[]> {
    const licenseUsageParams = getLicenseUsageSearchParams(globalConfig);

    const timeForDataIngestionTableStart = document
        ?.querySelector('[data-input-id="data_ingestion_input"] button')
        ?.getAttribute('data-test-earliest');
    const timeForDataIngestionTableEnd = document
        ?.querySelector('[data-input-id="data_ingestion_input"] button')
        ?.getAttribute('data-test-latest');
    // Construct the three queries
    const eventInputQuery = `| rest splunk_server=local /services/data/inputs/all | where $eai:acl.app$ = "${globalConfig.meta.name}" | eval Active=if(lower(disabled) IN ("1", "true", "t"), "no", "yes") | table title, Active | stats values(title) as event_input by Active`;
    const eventAccountQuery = `index=_internal source=*${globalConfig.meta.name}* action=events_ingested earliest=${timeForDataIngestionTableStart} latest=${timeForDataIngestionTableEnd} | fieldsummary | fields field values | where field IN ("event_account")`;

    let eventQuery = '';
    if (licenseUsageParams) {
        const [determineBy, licUsgCondition] = licenseUsageParams;
        if (determineBy && licUsgCondition) {
            eventQuery = `index=_internal source=*license_usage.log type=Usage earliest=${timeForDataIngestionTableStart} latest=${timeForDataIngestionTableEnd} ${determineBy} IN (${licUsgCondition}) | fieldsummary | fields field values | where field IN ("s", "st", "idx", "h")`;
        }
    }

    if (!eventQuery) {
        eventQuery = `index=_internal source=*license_usage.log type=Usage earliest=${timeForDataIngestionTableStart} latest=${timeForDataIngestionTableEnd} | fieldsummary | fields field values | where field IN ("s", "st", "idx", "h")`;
    }

    // Execute all queries concurrently
    const queryPromises = [
        runSearchJob(eventInputQuery),
        runSearchJob(eventAccountQuery),
        runSearchJob(eventQuery),
    ];

    // Return the combined results from all queries
    return Promise.all(queryPromises)
        .then(
            (results) => results // Combined response of all queries
        )
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Error in fetching queries data:', error);
            return [];
        });
}
