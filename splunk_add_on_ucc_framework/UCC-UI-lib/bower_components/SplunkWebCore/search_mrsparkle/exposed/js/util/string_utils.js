define(
    [
        'underscore'
    ],
    function(_) {

        var strEndsWith = function(str, suffix) {
            if (!str || !suffix) {
                return false;
            }
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };

        var strStartsWith = function(str, prefix) {
            if (!str || !prefix) {
                return false;
            }
            return str.indexOf(prefix) === 0;
        };

        /**
        * Changes the first letter of first word in a string to upper-case.
        * All other letters remain unchanged. 
        *
        * @param str {String} - string to capitalize.
        * @returns {String} - Returns a string with the first letter of first word upper-case. 
        */
        var capitalize = function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };


        /**
        * Changes the first letter of first word in a string to lower-case.
        * All other letters remain unchanged.
        *
        * @param str {String} - string to process.
        * @returns {String} - Returns a string with the first letter of first word lower-case.
        */
        var firstToLower = function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        };


        /**
         * Truncates and adds ellipsis in the interior of a string if
         * the string is longer than the desired length.
         * 
         * @param str {String} - The string to have inner ellipsis added to it.
         * @param maxLength {Number} - Maximum length of the string.
         * @param leadingLength {Number} - Desired length ahead of the ellipsis.
         * @param trailingLength {Number} - Desired length following the ellipsis.
         * @returns {String} - Returns a string with the specified inner ellipsis if
         *          the original string was longer than maxLength.
         */
        var truncateString = function(str, maxLength, leadingLength, trailingLength) {
            var label = str;
            if(label.length > maxLength) {
                label = label.substring(0, leadingLength) +
                        _('…').t() +
                        label.substring(label.length - trailingLength);
            }
            return label;
        };

        /**
         * Truncates and adds ellipsis at the end of the string if
         * the string is longer than the desired length.
         *
         * @param str {String} - The string to have trailing ellipsis added to it.
         * @param maxLength {Number} - Maximum length of the string.
         * @returns {String} - Returns a string with the trailing ellipsis if the
         * original string was greater than MaxLength.
         */
        var truncateTrailingString = function(str, maxLength) {
            return truncateString(str, maxLength, maxLength - 1, 0);
        };

        /**
         * Takes a regex and a text string, returns an array of arrays, containing all matches corresponding to groups within the regex
         *
         * @param text - string to match against
         * @param regExp - takes the form /(foo)...(bar)/g
         * Note that the global field "g" is required or else the function will go into an infinite loop
         */
        var getRegexMatches = function(regExp, text) {
            var matches = [];
            var match = regExp.exec(text);
            while (match != null) {
                matches.push(match);
                match = regExp.exec(text);
            }
            return matches;
        };

        var stripSearchFromSearchQuery = function(search) {
            if (search && search.indexOf('search') === 0) {
                return search.slice(6).trim();
            }
            return search;
        };

        /**
         * removeNewlines replace newlines within a string with spaces.
         * @param str {String} - string to process.
         */
        var removeNewlines = function(str) {
            return str.replace(/[\t ]*(\r\n|\r|\n)\s*/g, " ");     
        };

        return {
            strEndsWith: strEndsWith,
            strStartsWith: strStartsWith,
            capitalize: capitalize,
            firstToLower: firstToLower,
            truncateString: truncateString,
            truncateTrailingString: truncateTrailingString,
            getRegexMatches: getRegexMatches,
            stripSearchFromSearchQuery: stripSearchFromSearchQuery,
            removeNewlines: removeNewlines
        };
    }
);
