import { getDefaultFetchInit } from '@splunk/splunk-utils/fetch';
import { app } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { generateToast, getUnifiedConfigs } from './util';
import { parseErrorMsg } from './messageUtil';

export interface AxiosCallType {
    endpointUrl: string;
    params?: Record<string, string | number>;
    signal?: AbortSignal;
    customHeaders?: Record<string, string>;
    method?: 'get' | 'post' | 'delete';
    body?: URLSearchParams;
    handleError?: boolean;
    callbackOnError?: (error: unknown) => void;
}

export function generateEndPointUrl(name: string) {
    const unifiedConfigs = getUnifiedConfigs();
    return `${unifiedConfigs.meta.restRoot}_${name}`;
}

const DEFAULT_PARAMS = { output_mode: 'json' };

const createUrl = (endpointUrl: string, params: Record<string, string | number>): URL => {
    const url = new URL(
        createRESTURL(endpointUrl, { app, owner: 'nobody' }),
        window.location.origin
    );
    Object.entries({ ...DEFAULT_PARAMS, ...params }).forEach(([key, value]) =>
        url.searchParams.append(key, value.toString())
    );
    return url;
};

const handleErrorResponse = async (response: Response): Promise<never> => {
    const errorData = await response.json();
    const message = parseErrorMsg(errorData);
    throw new Error(message);
};

const fetchWithErrorHandling = async (
    url: URL,
    options: RequestInit,
    handleError: boolean,
    callbackOnError?: (error: unknown) => void
) => {
    try {
        const response = await fetch(url.toString(), options);
        if (!response.ok) {
            await handleErrorResponse(response);
        }
        return await response.json();
    } catch (error) {
        if (handleError) {
            const errorMsg = parseErrorMsg(error);
            generateToast(errorMsg, 'error');
            if (callbackOnError) {
                callbackOnError(error);
            }
        }
        throw error;
    }
};

const getFetch = async ({ endpointUrl, params = {}, signal }: AxiosCallType) => {
    const url = createUrl(endpointUrl, params);
    const options = {
        method: 'GET',
        signal,
    } satisfies RequestInit;

    return fetchWithErrorHandling(url, options, false);
};

const postFetch = async ({ endpointUrl, params = {}, body, signal }: AxiosCallType) => {
    const url = createUrl(endpointUrl, params);
    const defaultInit = getDefaultFetchInit();
    const headers = {
        ...defaultInit.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
    } satisfies HeadersInit;

    const options = {
        method: 'POST',
        headers,
        signal,
        body: body?.toString(),
    } satisfies RequestInit;

    return fetchWithErrorHandling(url, options, false);
};

const deleteFetch = async ({ endpointUrl, params = {}, signal }: AxiosCallType) => {
    const url = createUrl(endpointUrl, params);
    const options = {
        method: 'DELETE',
        signal,
    } satisfies RequestInit;

    return fetchWithErrorHandling(url, options, false);
};

/* Public API */
export const getRequest = ({ endpointUrl, params = {}, signal }: AxiosCallType) =>
    getFetch({ endpointUrl, params, signal });

export const postRequest = ({ endpointUrl, params = {}, body, signal }: AxiosCallType) =>
    postFetch({ endpointUrl, params, body, signal });

export const deleteRequest = ({ endpointUrl, params = {}, signal }: AxiosCallType) =>
    deleteFetch({ endpointUrl, params, signal });
