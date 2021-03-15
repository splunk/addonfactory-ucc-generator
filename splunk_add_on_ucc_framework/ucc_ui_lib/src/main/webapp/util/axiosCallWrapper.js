import axios from 'axios';
import { CSRFToken, app } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { generateEndPointUrl, generateToast } from './util';

/**
 *
 * @param {Object} data The object containing required params for request
 * @param {string} data.serviceName service name which is input name or tab name based on the page
 * @param {string} data.endpointUrl rest endpoint path
 * @param {object} data.params object with params as key value pairs
 * @param {object} data.customHeaders extra headers as key value pair
 * @param {string} data.method rest method type
 * @param {string} data.handleError whether or not show toast notifications on failure
 * @param {string} data.callbackOnError callback function to execute after handling error. Only executed when handleError is set to true
 * @returns
 */
const axiosCallWrapper = (
    data = {
        serviceName: null,
        endpointUrl: null,
        params: {},
        customHeaders: {},
        method: 'get',
        handleError: false,
        callbackOnError: () => {},
    }
) => {
    const {
        serviceName,
        endpointUrl,
        params,
        customHeaders,
        method,
        handleError,
        callbackOnError,
    } = data;
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
    const url = `${createRESTURL(endpoint, appData)}?output_mode=json`;

    const options = {
        method,
        url,
        credentials: 'include',
        headers,
    };

    if (method === 'post') {
        options.data = params;
    } else {
        options.params = params;
    }

    return handleError
        ? axios(options).catch((error) => {
              let message = '';
              if (error.response) {
                  // The request was made and the server responded with a status code
                  message = `Error response received from server: ${error.response.data.messages[0].text}`;
                  generateToast(message);
              } else if (error.request) {
                  // The request was made but no response was received
                  message = `No response received while making request to ${endpointUrl}`;
                  generateToast(message);
              } else {
                  // Something happened in setting up the request that triggered an Error
                  message = `Error making ${method} request to ${endpointUrl}`;
                  generateToast(message);
              }
              callbackOnError(error);
              return Promise.reject(error);
          })
        : axios(options);
};

export { axiosCallWrapper };
