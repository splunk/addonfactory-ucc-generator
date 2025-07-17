import SearchJob from '@splunk/search-job';
import { EventType } from '@splunk/react-events-viewer/types/common-types';

export interface FieldValue {
    value: string;
    count: number;
}

export interface SearchMessage {
    type: string;
    text: string;
}

export interface SearchResponse<TResult = EventType> {
    sid?: string;
    fields: { name: string }[];
    highlighted?: unknown;
    init_offset: number;
    messages: SearchMessage[];
    preview: boolean;
    post_process_count: number;
    results: TResult[];
}

export const getSearchUrl = (searchParams?: Record<string, string>): URL => {
    const basicUrl = window.location.origin + window.location.pathname;
    const lastIndex = basicUrl.lastIndexOf('/');
    const searchUrl = new URL(`${basicUrl.slice(0, lastIndex)}/search`);

    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) {
                searchUrl.searchParams.append(key, value);
            }
        });
    }

    return searchUrl;
};

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
