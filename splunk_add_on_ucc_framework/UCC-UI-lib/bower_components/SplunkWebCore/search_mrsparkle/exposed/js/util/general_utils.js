define(
    [
        'jquery',
        'underscore',
        'splunk.util',
        'util/math_utils'
    ],
    function($, _, SplunkUtils, mathUtils) {
        //returns an array of key:value pairs from the union of the values found in the
        //arrays with the key being the passed key
        var unionWithKey = function(arrayOne, arrayTwo, key) {
            var union = _.union(arrayOne, arrayTwo);
            return _.map(union, function(field) {
                var ret_hash = {};
                ret_hash[key] = field;
                return ret_hash;
            });
        };

        //returns an array of key:value pairs from the difference of the values found in the
        //arrays with the key being the passed key

        var differenceWithKey = function(arrayOne, arrayTwo, key) {
            var difference = _.difference(arrayOne, arrayTwo);
            return _.map(difference, function(field) {
                var ret_hash = {};
                ret_hash[key] = field;
                return ret_hash;
            });
        };

        /**
         * Filters the given object, omitting any key-value pairs where the key doesn't match at least one of the given
         * regular expressions
         *
         * @param obj {Object} the object to filter
         * @param regexes {Array<String or RegExp> or String or RegExp} a list of strings or regular expressions, strings will be converted
         *                                                              to regular expressions internally
         * @param options {Object} {
         *     strip {String or RegExp} optional, a pattern to strip from each key before comparing
         *     allowEmpty {Boolean} defaults to false, whether keys with empty values should be included in the return object
         *     allowObject {Boolean} defaults to false, whether keys with Object values should be included in the return object
         * }
         */

        var filterObjectByRegexes = function(obj, regexes, options) {
            options = options || {};
            if(!_(regexes).isArray()) {
                regexes = [regexes];
            }
            regexes = _.map(regexes, function(regex) {
                return (regex instanceof RegExp ? regex: new RegExp(regex));
            });

            var attrs = {}, strippedKey,
                strip = _.isString(options.strip) ? options.strip : '',
                allowEmpty = !!options.allowEmpty,
                allowObject = !!options.allowObject;

            // match for the wildcards on each key
            _.each(obj, function(value, key) {
                strippedKey = key.replace(strip, '');
                if (attrs[strippedKey]) {
                    return;
                }
                _.each(regexes, function(regex) {
                    if (regex.test(key)) {
                        if (!_.isUndefined(value)){
                            if ((_.isString(value) && value=='' && !allowEmpty) || (_.isObject(value) && !allowObject)) {
                                return;
                            }
                            attrs[strippedKey] = value;
                        }
                    }
                }, this);
            }, this);
            return attrs;
        };

        var deleteFromObjectByRegexes = function(obj, regexes) {
            if(!_(regexes).isArray()) {
                regexes = [regexes];
            }
            regexes = _.map(regexes, function(regex) {
                return (regex instanceof RegExp ? regex: new RegExp(regex));
            });

            var attrs = $.extend(true, {}, obj);

            // match for the wildcards on each key
            _.each(attrs, function(value, key) {
                _.each(regexes, function(regex) {
                    if (regex.test(key)) {
                        delete attrs[key];
                    }
                }, this);
            }, this);

            return attrs;
        };

        /**
         * Recursively removes all attributes with an undefined value from an object
         *
         * @param obj
         * @returns obj
         */
        var stripUndefinedAttrs = function(obj) {
            _.each(obj, function(value, key) {
                if (value === undefined) {
                    delete obj[key];
                } else if (_.isObject(value)) {
                    stripUndefinedAttrs(value);
                }
            });
            return obj;
        };

        // Returns input as an array
        var asArray = function(obj) {
            if (obj == null) {
                return [];
            }
            return _.isArray(obj) ? obj : [obj];
        };

        /**
         * Converts a string with wildcard asterisks to the appropriate
         * regular expression object.
         *
         * Example Usage:
         *
         * var foo = globber('te*st*');
         * // typeof foo is: RegExp
         * // foo's value is (without spaces): / ^ t e . * s t . * /
         *
         */
        var globber = function(str) {
            var rex,
                chars = str.split('');

            if (_.first(chars) !== '*') {
                chars.unshift('^');
            }

            if (_.last(chars) !== '*') {
                chars.push('$');
            }
            str = chars.join('').replace(/\*/g, '.*');

            try {
                rex = new RegExp(str);
            } catch(e) {}

            return rex;
        };

        //takes two values and compares them returning the comparison inverted or not depending on
        //the sort direction boolean isAsc
        var compareWithDirection = function(value1, value2, isAsc) {
            var returnVal = 0;
            if (value1 == value2) {
                return returnVal;
            }
            if (value1 < value2){
                returnVal = -1;
            } else {
                returnVal = 1;
            }
            return (isAsc) ? returnVal : -returnVal;
        };

        /**
         * @author sfishel
         *
         * Checks if a list of values can be considered "numeric".
         *
         * Returns true if half or more of the non-null values can be parsed to a float.
         *
         * @param {Array} values
         * @return {Boolean}
         */

        var valuesAreNumeric = function(values) {
            var numericCount = 0,
                nonNullCount = 0;

            _(values).each(function(value) {
                // in the case of multivalue fields, use the first value
                if(_(value).isArray()) {
                    value = value.length > 0 ? value[0] : null;
                }
                if(_(value).isNull()) {
                    return;
                }
                nonNullCount++;

                var isNumber = !!mathUtils.strictParseFloat(value) || mathUtils.isCommaSeparatedNumber(value);
                if(isNumber) {
                    numericCount++;
                }
            });
            if(nonNullCount === 0) {
                return false;
            }
            return (numericCount >= (nonNullCount / 2));
        };

        var valuesAreNumericAndFinite = function(values) {
            var areNumericAndFinite = true;
            _(values).each(function(value) {
                if (isNaN(value) || !isFinite(value)) {
                    areNumericAndFinite = false;
                }
            });
            return areNumericAndFinite;
        };

        /**
         * @author sfishel
         *
         * This is an approximation method for obtaining a pair of lower and upper percentile values from a list.
         *
         * Ported from //python-site/splunk/appserver/mrsparkle/lib/util.py
         *
         * @param {Array} orderedList, must be sorted before calling this method
         * @param {Number} lowerPercentile
         * @param {Number} upperPercentile
         *
         * @return {Object} an object with properties 'upper' and 'lower' corresponding to the upper and lower values.
         */

        var getPercentiles = function(orderedList, lowerPercentile, upperPercentile) {

            if(orderedList.length === 0) {
                return { upper: null, lower: null };
            }

            var f = function(p, ln) {
                var n = p * (ln - 1) + 1,
                    k = Math.floor(n),
                    d = n - k;

                return [n, k, d];
            };

            var v = function(percentile, oList) {
                var fArray = f(percentile, oList.length),
                    n = fArray[0],
                    k = fArray[1],
                    d = fArray[2];

                if(k === 0 || oList.length === 1) {
                    return oList[0];
                }
                else if(k === oList.length - 1) {
                    return oList[oList.length - 1];
                }
                else {
                    return (oList[k] + d * (oList[k + 1] - oList[k]));
                }
            };

            return ({
                lower: v(lowerPercentile, orderedList),
                upper: v(upperPercentile, orderedList)
            });

        };

        //take an object and replace a key with another key
        var transferKey = function(obj, oldKey, newKey) {
            if (!_.isUndefined(obj[oldKey])){
                obj[newKey] = obj[oldKey];
                delete obj[oldKey];
            }
        };

        /**
         *  @author jszeto
         *
         *  Returns a copy of the object where the keys have become the values and the values the keys.
         *  For this to work, all of your object's values should be unique and string serializable.
         *
         * @param obj
         * @return {Object}
         */
        var invert = function (obj) {

            // TODO [JCS] Create a version that resolves key conflicts by creating an array of values.
            // TODO [JCS] Underscore provides an invert function, but the values must be unique.
            var new_obj = {};

            for (var prop in obj) {
                if(obj.hasOwnProperty(prop)) {
                    new_obj[obj[prop]] = prop;
                }
            }

            return new_obj;
        };

        /**
         * Converts 13824237 to 13,824,237
         * @param num
         * @return {String}
         */
        var convertNumToString = function(num) {
            // adds a comma after each 3 digits
            if (!num) {
                return null;
            }
            return (num.toString()).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        };

        /**
         * Not an exhaustive check that the search string can be parsed as a pivot search, but some simple checks
         * that the search starts with "| pivot" and doesn't pipe to any other search commands.
         *
         * @param searchString
         */
        var isValidPivotSearch = function(searchString) {
            if(!/^\s*\|\s*pivot\s+/.test(searchString)) {
                return false;
            }
            // now we need to check for a "|" to another search command,
            // but need to make sure we don't match a "|" inside a string
            // start by removing any escaped quotes
            searchString = searchString.replace(/(\\"|\\')/g, '');
            // then it is safe to remove any quoted contents
            searchString = searchString.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '');
            // now if there is more than one "|" left it is a search language pipe
            return searchString.split('|').length === 2;
        };

        /**
         * Returns the text currently selected with mouse or null
         */
        var getMouseSelection = function() {
            if (window.getSelection) {
                return window.getSelection().toString();
            } else if (document.selection) {
                return document.selection.createRange().text;
            }
            return null;
        };

        var isTrueEquivalent = function(value) {
            value = typeof(value) === 'string' ? value.toLowerCase() : value;
            return value === true || value === 1 ||
                value === 'true' || value === '1' || value === 'on' || value === 'yes';
        };

        var isFalseEquivalent = function(value) {
            value = typeof(value) === 'string' ? value.toLowerCase() : value;
            return value === false || value === 0 ||
                value === 'false' || value === '0' || value === 'off' || value === 'no';
        };

        /**
         * Checks if the given value can be normalized to a boolean value
         * @see normalizeBoolean
         * @param value {*} the value which
         * @returns {Boolean} true if the value can be normalized to a boolean value, otherwise false
         */
        var isBooleanEquivalent = function(value) {
            return isTrueEquivalent(value) || isFalseEquivalent(value);
        };

        /**
         * Strict normalization of a string to boolean which always returns a boolean value.
         * The following values are treated as true (see isTrue helper)
         *      - the strings "true", "on", "yes" or "1" (case-insensitive)
         *      - the integer 1
         *      - the boolean true
         * The following values are normalized to false (see isFalse helper)
         *      - the strings "false", "off", "no" or "0" (case-insensitive)
         *      - the integer 0
         *      - the boolean false
         * @param value {Boolean|Number|String} - a value to be normalized as a boolean
         * @param options {Object} - {
         *      default {Boolean|Number|String} - fallback value in case the string is not a valid boolean expression
         *  }
         * @returns {Boolean} the normalization result in case of a valid boolean expression, the default value if
         *                    specified and a valid boolean, otherwise the default value is normalized or if not
         *                    specified false is returned by default
         */
        var normalizeBoolean = function(value, options) {
            options || (options = {});
            if (isTrueEquivalent(value)) {
                return true;
            }
            if (isFalseEquivalent(value)) {
                return false;
            }
            return options.hasOwnProperty('default') ?
                (typeof(options['default']) === 'boolean' ? options['default'] : normalizeBoolean(options['default']))
                : false;
        };


        /**
         * This method is some nasty backwards compatibility for a GET param that used to be a boolean string, but has been migrated to int
         */
        var parseBooleanOrInt = function(val) {
            if (mathUtils.isInteger(val)) {
                return parseInt(val, 10);
            }
            return normalizeBoolean(val);
        };

        /**
        * Equality comparison that will deal with objects and Booleans.
        * If both params are Boolean or Boolean-equivalent
        * (see the the doc comment for normalizeBoolean)
        * convert them to Boolean and use === to compare.
        * Otherwise use Underscore isEqual to compare them.
        *
        * @param value1 {Boolean|Number|String|Object} - value to be compared.
        * @param value2 {Boolean|Number|String|Object} - value to be compared.
        * @returns {Boolean} - Returns true if the values are the same, false if they are different.
        */
        var checkEquality = function(value1, value2) {
            if (isBooleanEquivalent(value1) && isBooleanEquivalent(value2)) {
                return (normalizeBoolean(value1) === normalizeBoolean(value2));
            } else {
                return _.isEqual(value1, value2);
            }
        };

        /**
         * Check if an array is a subset of another array, where the
         * needle array may contain wildcard characaters. An empty array
         * is always a subset of another array.
         *
         * NOTE: String comparison is always used, so [1] will be considered
         * a subset of ['1'].
         *
         * Example Usage:
         *
         * var isSubset = isFuzzySubset(['one', 't*e'], ['four', 'three', 'one', 'two']);
         * // isSubset's value is: true
         *
         */
        var isFuzzySubset = function(subset, superset) {
            superset.length || (superset = ['*']);  // Force superset to have at least one element
            var intersection = _(subset).filter(function(subsetElement) {
                var subsetElementPattern = globber(subsetElement.toString());
                return _(superset).find(function(supersetElement) {
                    return supersetElement.toString().match(subsetElementPattern) !== null;
                });
            });
            return intersection.length == subset.length;
        };


        /**
         * Genereate regular expression from filter string
         *
         * Example Usage:
         *
         * var foo = generateRegex("a bc d")
         * // typeof foo is: RegExp
         * // foo's value is (without spaces): /^(?=.*a)(?=.*bc)(?=.*d)/
         *
         */
        var VALUES_REGEX = /(\'.*?\')|(\".*?\")|([^\s]+)/g,
            QUOTES_REGEX = /^(\".*\")$|^(\'.*\')$/;
        var generateFilterRegex = function(value) {
            // Escape value to be treated as literal string
            value = SplunkUtils.escapeRegex(value);

            var values = (value) ? value.match(VALUES_REGEX): [];
            if (values.length) {
                var parsed = _.chain(values)
                    .map(function(value) {
                        if (value.match(QUOTES_REGEX)) {
                            var len = value.length;
                            value = value.substring(1, len-1);
                        }
                        return ['(?=.*', value,')'].join('');
                    })
                    .join('')
                    .value();
                return new RegExp('^' + parsed, 'im'); // Added ignore case and multiline match flags
            } else {
                return new RegExp('.*');
            }
        };

        return {
            VALUES_REGEX: VALUES_REGEX,
            QUOTES_REGEX: QUOTES_REGEX,
            compareWithDirection: compareWithDirection,
            unionWithKey: unionWithKey,
            differenceWithKey: differenceWithKey,
            filterObjectByRegexes: filterObjectByRegexes,
            deleteFromObjectByRegexes: deleteFromObjectByRegexes,
            stripUndefinedAttrs: stripUndefinedAttrs,
            globber: globber,
            valuesAreNumeric: valuesAreNumeric,
            valuesAreNumericAndFinite: valuesAreNumericAndFinite,
            getPercentiles: getPercentiles,
            transferKey: transferKey,
            convertNumToString: convertNumToString,
            invert: invert,
            isValidPivotSearch: isValidPivotSearch,
            getMouseSelection: getMouseSelection,
            normalizeBoolean: normalizeBoolean,
            isBooleanEquivalent: isBooleanEquivalent,
            checkEquality: checkEquality,
            isFuzzySubset: isFuzzySubset,
            asArray: asArray,
            generateFilterRegex: generateFilterRegex,
            parseBooleanOrInt: parseBooleanOrInt
        };
    }
);
