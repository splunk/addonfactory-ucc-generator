import { vi } from 'vitest';

/* eslint-disable no-console */
import { getDefaultFetchInit } from '@splunk/splunk-utils/fetch';
import { createUrl, fetchWithErrorHandling, RequestParams } from '../api';

export async function mockPostRequest<TData>({
    endpointUrl,
    params = {},
    body,
    signal,
    handleError,
    callbackOnError,
}: RequestParams) {
    const url = createUrl(endpointUrl, params);
    const defaultInit = getDefaultFetchInit();
    const headers = {
        ...defaultInit.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
    } satisfies HeadersInit;

    console.log('body', body);
    console.log('body?.toString()', body?.toString());

    const options = {
        method: 'POST',
        headers,
        signal,
        body: body?.toString(),
    } satisfies RequestInit;
    return fetchWithErrorHandling<TData>(url, options, handleError, callbackOnError);
}

export const doMockPostRequestBodyToString = () => {
    vi.doMock('../../../util/api', async () => {
        const originalModule = await vi.importActual('../../../util/api');

        return {
            ...originalModule,
            postRequest: vi.fn(mockPostRequest), // Redirect `postRequest` to `mockPostRequest`
        };
    });
};
