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
    callbackOnError: (error: unknown) => void
): Promise<Response> => {
    try {
        const response = await fetch(url.toString(), options);
        if (!response.ok) {
            await handleErrorResponse(response);
        }
        return response;
    } catch (error) {
        if (handleError) {
            generateToast(parseErrorMsg(error), 'error');
            callbackOnError(error);
        }
        throw error;
    }
};

const axiosCallWrapper = async ({
    endpointUrl,
    params = {},
    body,
    signal,
    customHeaders = {},
    method = 'get',
    handleError = false,
    callbackOnError = () => {},
}: AxiosCallType): Promise<Response> => {
    const defaultInit = getDefaultFetchInit();
    const headers = { ...defaultInit.headers, ...customHeaders };
    const url = createUrl(endpointUrl, params);

    const options: RequestInit = {
        ...defaultInit,
        method: method.toUpperCase(),
        headers,
        signal,
    };

    if (method === 'post' && body) {
        options.body = body.toString();
    }

    return fetchWithErrorHandling(url, options, handleError, callbackOnError);
};

export { axiosCallWrapper };
