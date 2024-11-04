import { getDefaultFetchInit } from '@splunk/splunk-utils/fetch';
import { app } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { generateToast, getUnifiedConfigs } from './util';
import { parseErrorMsg } from './messageUtil';

export interface RequestParams {
    endpointUrl: string;
    params?: Record<string, string | number>;
    signal?: AbortSignal;
    body?: BodyInit;
    handleError: boolean;
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

const fetchWithErrorHandling = async <TData>(
    url: URL,
    options: RequestInit,
    handleError: boolean,
    callbackOnError?: (error: unknown) => void
): Promise<TData> => {
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

const getFetch = async <TData>({
    endpointUrl,
    params = {},
    signal,
    handleError,
}: RequestParams) => {
    const url = createUrl(endpointUrl, params);
    const options = {
        method: 'GET',
        signal,
    } satisfies RequestInit;

    return fetchWithErrorHandling<TData>(url, options, handleError);
};

const postFetch = async <TData>({
    endpointUrl,
    params = {},
    body,
    signal,
    handleError,
}: RequestParams) => {
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
        body,
    } satisfies RequestInit;

    return fetchWithErrorHandling<TData>(url, options, handleError);
};

const deleteFetch = async <TData>({
    endpointUrl,
    params = {},
    signal,
    handleError,
}: RequestParams) => {
    const url = createUrl(endpointUrl, params);
    const options = {
        method: 'DELETE',
        signal,
    } satisfies RequestInit;

    return fetchWithErrorHandling<TData>(url, options, handleError);
};

/* Public API */
export const getRequest = <TData>(params: RequestParams) => getFetch<TData>(params);

export const postRequest = <TData>(params: RequestParams) => postFetch<TData>(params);

export const deleteRequest = <TData>(params: RequestParams) => deleteFetch<TData>(params);
