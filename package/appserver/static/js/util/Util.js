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

        injectPublicPath(name) {
            __webpack_public_path__ = (function getPath() {

                /**
                 * This is a port of make_url from js/util.js
                 */
                function make_url() {
                    var output = '', seg, len;
                    for (var i=0,l=arguments.length; i<l; i++) {
                        seg = arguments[i].toString();
                        len = seg.length;
                        if (len > 1 && seg.charAt(len-1) == '/') {
                            seg = seg.substring(0, len-1);
                        }
                        if (seg.charAt(0) != '/') {
                            output += '/' + seg;
                        } else {
                            output += seg;
                        }
                    }

                    // augment static dirs with build number
                    if (output!='/') {
                        var segments = output.split('/');
                        var firstseg = segments[1];
                        if (firstseg=='static' || firstseg=='modules') {
                            var postfix = output.substring(firstseg.length+2, output.length);
                            output = '/'+firstseg+'/@' + window.$C['BUILD_NUMBER'];
                            if (window.$C['BUILD_PUSH_NUMBER']) output += '.' + window.$C['BUILD_PUSH_NUMBER'];
                            if (segments[2] == 'app')
                                output += ':'+ getConfigValue('APP_BUILD', 0);
                            output += '/' + postfix;
                        }
                    }

                    var root = getConfigValue('MRSPARKLE_ROOT_PATH', '/');
                    var djangoRoot = getConfigValue('DJANGO_ROOT_PATH', '');
                    var locale = getConfigValue('LOCALE', 'en-US');

                    var combinedPath = "";
                    if (djangoRoot && output.substring(0, djangoRoot.length) === djangoRoot) {
                        combinedPath = output.replace(djangoRoot, djangoRoot + "/" + locale.toLowerCase());
                    } else {
                        combinedPath = "/" + locale + output;
                    }

                    if (root == '' || root == '/') {
                        return combinedPath;
                    } else {
                        return root + combinedPath;
                    }
                }

                function getConfigValue(key, defaultValue) {
                    if (window.$C && window.$C.hasOwnProperty(key)) {
                        return window.$C[key];
                    } else {
                        if (defaultValue !== undefined) {
                            return defaultValue;
                        }

                        throw new Error('getConfigValue - ' + key + ' not set, no default provided');
                    }
                }

                return make_url(`/static/app/'${name}'/js/build`) + '/';
            })();
        }
    };

});
