define(
    [
        'underscore',
        'util/math_utils'
    ],
    function(
        _,
        mathUtils
    ) {
        return {
            isIPV4: function(string) {
                return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(string);
            },

            // The only boolean types that are compatible with Pivot are true | false.
            isBoolean: function(string) {
                return /^true$|^false$/.test(string);
            },

            isNumber: function(string) {
                return !_.isNaN(mathUtils.strictParseFloat(string));
            },

            isInteger: function(string) {
                return mathUtils.strictParseFloat(string) % 1 === 0;
            },

            isEpochTime: function(string) {
                // While epoch time can technically be negative, Splunk doesn't handle that well
                return /^\d+\.?\d{0,3}$|^\d*\.\d{0,3}$/.test(string);
            },
            
            // Enforcing three rules:
            //  - no fields that start with underscores. they're reserved for Splunk internal fields, and any fields that
            //    start with underscores don't get returned by the summary endpoint.
            //  - no whitespace. a user might assume that spaces are valid everywhere in Splunk if they're valid in
            //    table UI, and many commands don't work with whitespace in fields. (we make sure to quote wrap)
            //  - no quotes. since we're quote wrapping, the user shouldn't add any of their own quotes.
            isValidFieldName: function(string) {
                return !((_.isEmpty(string)) || (string.charAt(0) === '_') || (/[\s\'\"]/.test(string)));
            },

            // Currently, the rex command can't handle extracting into a field name that consists of any non-alphanumeric
            // characters. So, we have to be stricter for Rex and AdvancedRex here. See SPL-104386 / SPL-127748.
            isValidRexFieldName: function(string) {
                return !_.isEmpty(string) && /^[A-Za-z0-9][\w]*$/.test(string);
            },

            // Inserts a backslash in front of backslashes and double quotes to follow escaping rules for SPL syntax
            splEscape: function(string) {
                return string
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"');
            }
        };
    }
);
