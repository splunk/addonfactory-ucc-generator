import axios from 'axios';
import { CSRFToken, app } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { generateEndPointUrl } from './util';

/**
 * Provides a axios wrapper with applied common options
 * @param {string} serviceName service name which is input name or tab name based on the page
 * @param {string} endpointUrl rest endpoint path
 * @param {object} params object with params as key value pairs
 * @param {object} customHeaders extra headers as key value pair
 * @param {string} method rest method type
 */
const axiosCallWrapper = (
    serviceName,
    endpointUrl = null,
    params = {},
    customHeaders = {},
    method = 'get'
) => {
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

    return axios(options);
};

export { axiosCallWrapper };
