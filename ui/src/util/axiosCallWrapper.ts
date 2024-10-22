import axios, { AxiosRequestConfig } from 'axios';
import { CSRFToken, app } from '@splunk/splunk-utils/config';
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

/**
 *
 * @param {Object} data The object containing required params for request
 * @param {string} data.endpointUrl rest endpoint path
 * @param {object} data.params object with params as key value pairs
 * @param {object} data.body object with body as key value pairs for post request
 * @param {object} data.customHeaders extra headers as key value pair
 * @param {string} data.method rest method type
 * @param {string} data.handleError whether or not show toast notifications on failure
 * @param {string} data.callbackOnError callback function to execute after handling error. Only executed when handleError is set to true
 * @returns
 */
const axiosCallWrapper = ({
    endpointUrl,
    params,
    body,
    signal,
    customHeaders = {},
    method = 'get',
    handleError = false,
    callbackOnError = () => {},
}: AxiosCallType) => {
    const baseHeaders = {
        'X-Splunk-Form-Key': CSRFToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    };
    const headers = Object.assign(baseHeaders, customHeaders);
    const url = createRESTURL(endpointUrl, { app, owner: 'nobody' });

    const options: AxiosRequestConfig = {
        params: {
            ...DEFAULT_PARAMS,
            ...params,
        },
        method,
        url,
        withCredentials: true,
        headers,
        signal,
    };

    if (method === 'post') {
        options.data = body;
    }

    return handleError
        ? axios(options).catch((error) => {
              if (axios.isCancel(error)) {
                  return Promise.reject(error);
              }
              const message = parseErrorMsg(error);

              generateToast(message, 'error');
              callbackOnError(error);
              return Promise.reject(error);
          })
        : axios(options);
};

export { axiosCallWrapper };
