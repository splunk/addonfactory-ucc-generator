import axios, { CancelToken } from 'axios';
import { CSRFToken, app } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { generateEndPointUrl, generateToast } from './util';
import { parseErrorMsg } from './messageUtil';

interface axiosCallWithServiceName {
    serviceName?: string;
    endpointUrl: string;
}

interface axiosCallWithEndpointUrl {
    serviceName: string;
    endpointUrl?: string;
}

interface CommonAxiosCall {
    params?: Record<string, string | number>;
    cancelToken?: CancelToken;
    customHeaders?: Record<string, string>;
    method?: 'get' | 'post' | 'delete';
    body?: URLSearchParams;
    handleError?: boolean;
    callbackOnError?: (error: unknown) => void;
}

type AxiosCallType = (axiosCallWithServiceName | axiosCallWithEndpointUrl) & CommonAxiosCall;

/**
 *
 * @param {Object} data The object containing required params for request
 * @param {string} data.serviceName service name which is input name or tab name based on the page
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
    serviceName,
    endpointUrl,
    params,
    body,
    cancelToken,
    customHeaders = {},
    method = 'get',
    handleError = false,
    callbackOnError = () => {},
}: AxiosCallType) => {
    const endpoint = serviceName ? generateEndPointUrl(serviceName) : endpointUrl;
    const appData = {
        app,
        owner: 'nobody',
    };
    const baseHeaders = {
        'X-Splunk-Form-Key': CSRFToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    };
    const headers = Object.assign(baseHeaders, customHeaders);
    const url = createRESTURL(endpoint, appData);

    let newParams = { output_mode: 'json' };
    if (params) {
        newParams = { ...newParams, ...params };
    }

    const options: Record<string, unknown> = {
        params: newParams,
        method,
        url,
        credentials: 'include',
        headers,
        cancelToken,
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
