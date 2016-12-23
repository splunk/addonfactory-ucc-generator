/*global define,window,atob,escape*/
/*jslint bitwise: true */
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

        formatDisabled: function(val) {
            const trueList = ['true', 't', '1', 'yes', 'y'];
            const falseList = ['false', 'f', '0', 'no', 'n'];
            if (val !== undefined) {
                if (trueList.indexOf(String(val)) > -1) {
                    return 'Disabled';
                } else if (falseList.indexOf(String(val)) > -1) {
                    return 'Enabled';
                }
            }
            return '';
        }
    };

});
