import { getDefaultFetchInit } from '@splunk/splunk-utils/fetch';
import { app } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { generateToast, getUnifiedConfigs } from './util';
import { parseErrorMsg } from './messageUtil';
import { ResponseError } from './ResponseError';

type ParamsRecord = Record<string, string | number | undefined>;

export interface RequestParams {
    endpointUrl: string;
    params?: ParamsRecord;
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

function createUrl(endpointUrl: string, params: ParamsRecord): URL {
    const url = new URL(
        createRESTURL(endpointUrl, { app, owner: 'nobody' }),
        window.location.origin
    );
    Object.entries({ ...DEFAULT_PARAMS, ...params })
        .filter(([, value]) => value !== undefined && value !== null)
        .forEach(([key, value]) => url.searchParams.append(key, value.toString()));
    return url;
}

async function handleErrorResponse(response: Response): Promise<never> {
    const errorData = await response.json();
    const message = parseErrorMsg(errorData);
    throw new ResponseError({ response, message });
}

async function fetchWithErrorHandling<TData>(
    url: URL,
    options: RequestInit,
    handleError: boolean,
    callbackOnError?: (error: unknown) => void
): Promise<TData> {
    const defaultInit = getDefaultFetchInit();

    try {
        const response = await fetch(url.toString(), {
            ...defaultInit,
            ...options,
        });
        if (!response.ok) {
            await handleErrorResponse(response);
        }
        return await response.json();
    } catch (error) {
        const isAborted = error instanceof DOMException && error.name === 'AbortError';
        if (handleError && !isAborted) {
            const errorMsg = parseErrorMsg(error);
            generateToast(errorMsg, 'error');
            if (callbackOnError) {
                callbackOnError(error);
            }
        }
        throw error;
    }
}

export async function getRequest<TData>({
    endpointUrl,
    params = {},
    signal,
    handleError,
    callbackOnError,
}: RequestParams) {
    const url = createUrl(endpointUrl, params);
    const options = {
        method: 'GET',
        signal,
    } satisfies RequestInit;

    return fetchWithErrorHandling<TData>(url, options, handleError, callbackOnError);
}

export async function postRequest<TData>({
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

    const options = {
        method: 'POST',
        headers,
        signal,
        body: body?.toString(),
    } satisfies RequestInit;
    return fetchWithErrorHandling<TData>(url, options, handleError, callbackOnError);
}

export async function deleteRequest<TData>({
    endpointUrl,
    params = {},
    signal,
    handleError,
    callbackOnError,
}: RequestParams) {
    const url = createUrl(endpointUrl, params);

    const options = {
        method: 'DELETE',
        signal,
    } satisfies RequestInit;

    return fetchWithErrorHandling<TData>(url, options, handleError, callbackOnError);
}
