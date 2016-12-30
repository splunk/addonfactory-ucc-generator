import {configManager} from 'app/util/configManager';
import _ from 'lodash';
import $ from 'jquery';

define(function () {
    var APP_NAME = 'AddOns',
        APP_VERSION = 'released',
        APP_PREFIX = encodeURIComponent('[' + APP_NAME + ':' + APP_VERSION + ']');

    return {
        /**
         * insert [app_name:app_version] before the link.
         * @param link
         * @returns new link
         */
        buildLink: function (link) {
            var s = link.indexOf('help?location='),
                e = s + 'help?location='.length,
                newLink = link.substr(0, e) + APP_PREFIX + link.substr(e);

            if (s < 0) {
                return link;
            }

            return newLink;
        },

        getLinkPrefix: function () {
            return APP_PREFIX;
        },

        //Decode Base64URL encoded JWT token
        decode: function (str) {
            var output, result;
            output = str.replace(/-/g, "+").replace(/_/g, "/");
            switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += "==";
                break;
            case 3:
                output += "=";
                break;
            default:
                throw "Illegal base64url string!";
            }

            result = atob(output);

            try {
                return decodeURIComponent(escape(result));
            } catch (err) {
                return result;
            }
        },

        parse: function (str) {
            return JSON.parse(str);
        },

        getAddonName: function () {
            var split_array = window.location.pathname.split('/');
            return split_array[split_array.length - 2];
        },

        guid: function guid() {
            return parseInt(new Date() - 0).toString();
        },

        parseBoolean: function (val, defaultValue) {
            const trueList = ['true', 't', '1', 'yes', 'y'];
            const falseList = ['false', 'f', '0', 'no', 'n'];
            if (val !== undefined &&
                trueList.indexOf(String(val).toLowerCase()) > -1) {
                return true;
            } else if (val !== undefined &&
                falseList.indexOf(String(val).toLowerCase()) > -1) {
                return false;
            } else {
                return defaultValue;
            }
        },

        encryptTableText: function(srcComponent, entity, field, text) {
            if (!text) {
                return '';
            }

            if (text === '' || !_.isString(text) || !field) {
                return text;
            }
            const isInputsPage = !!srcComponent.services;
            const serviceLikeArr = isInputsPage ? srcComponent['services']
                : [srcComponent];

            if (serviceLikeArr && entity) {
                const {unifiedConfig: {meta: {restRoot}}} = configManager;
                const modelID = entity.id;

                // ID of model: /servicesNS/nobody/${TA_NAME}/${TA_REST_ROOT}_${COLLECTION_NAME}/1
                const strArr = modelID.split('/');
                if (strArr.length < 2) {
                    return text;
                }
                const serviceName = strArr[strArr.length - 2].replace(`${restRoot}_`, '');
                const entityList = _.get(_.find(serviceLikeArr, d => d.name === serviceName), 'entity');
                if (!entityList) {
                    return text;
                }

                const srcEntity = _.find(entityList, d => d.field === field);

                if (srcEntity && srcEntity.encrypted) {
                    // Return 8 "*" since the length of content is also a secret
                    return _.repeat('*', 8);
                }
            }
            return text;
        },

        encodeHTML: function(value) {
            return $('<div/>').text(value).html();
        },

        decodeHTML: function(value) {
            return $('<div/>').html(value).text();
        }
    };
});
