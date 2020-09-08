define([
       'underscore',
       'util/console'
    ], function(
        _,
        console
    ) {

    function _encodePrimitiveValue(value) {
        if (_.isObject(value)) {
            console.error('Encountered non-primitive value %o to be encoded as URL param.', value);
            throw new Error('Non-primitive values are not allowed in the query string');
        }
        return encodeURIComponent(value);
    }

    // @todo test this!
    return {

        /**
         * Encodes the provided parameters into a string for appending to a url. It will encode
         * arrays of strings as a repeated list of URL params
         * @param {Object} params  The params to encode
         * @param {Object} options
         * @param {Boolean} [options.preserveEmptyStrings = true]
         * @param {Boolean} [options.preserveNull = true]
         * @return {String}
         */
        encode: function(params, options) {
            var queryArray = [], encodedKey;
            options = _.extend({ preserveEmptyStrings: true, preserveNull: true }, options);
            _.each(params, function(value, key) {
                if (_.isUndefined(value) || (value === null && !options.preserveNull)
                    || (value === "" && !options.preserveEmptyStrings)) {
                    return;
                }
                encodedKey = encodeURIComponent(key);
                if (value === null) {
                    queryArray.push(encodedKey);
                } else if (_.isArray(value)) {
                    _.each(value, function(v) {
                        queryArray.push(encodedKey + '=' + _encodePrimitiveValue(v));
                    });
                } else {
                    queryArray.push(encodedKey + '=' + _encodePrimitiveValue(value));
                }
            });
            return queryArray.join('&');

        },

        /**
         * Decodes the given query string into a params object
         * @param  {String} queryString
         * @return {Object}
         */
        decode: function(queryString) {
            queryString = (queryString || '').replace(/^[&\?#]|[&#]$/g, '');
            if (!queryString) {
                return {};
            }
            var output = {};
            _(queryString.split('&')).each(function(param) {
                var parts = param.split('=', 2);
                var key = decodeURIComponent(parts[0]);
                var value = parts.length > 1 ? decodeURIComponent(parts[1]) : null;
                if (output.hasOwnProperty(key)) {
                    var cur = output[key];
                    if (!_.isArray(cur)) {
                        cur = output[key] = [cur];
                    }
                    cur.push(value);
                } else {
                    output[key] = value;
                }
            });
            return output;
        }
    };

});