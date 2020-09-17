define([
            'underscore',
            'util/math_utils',
            'splunk.util'
        ],
        function(
            _,
            mathUtils,
            splunkUtils
        ) {

    var isNumberOrAuto = function(value) {
        return (value === 'auto' || !_.isNaN(mathUtils.strictParseFloat(value)));
    };

    var ValidationUtils = {};

    ValidationUtils.positiveNumberOrAutoValidationGenerator = function(displayName) {
        return function(value) {
            var invalidMessage = splunkUtils.sprintf(
                _('%s must be a positive number or "auto".').t(),
                displayName
            );
            if (!isNumberOrAuto(value)) {
                return invalidMessage;
            }
            var num = mathUtils.strictParseFloat(value);
            if (!_.isNaN(num) && num <= 0) {
                return invalidMessage;
            }
        };
    };

    ValidationUtils.numberOrAutoValidationGenerator = function(displayName) {
        return function(value) {
            if (!isNumberOrAuto(value)) {
                return splunkUtils.sprintf(
                    _('%s must be a number or "auto".').t(),
                    displayName
                );
            }
        };
    };

    ValidationUtils.minMaxValidationGenerator = function(minAttr, maxAttr, invalidMessage) {
        return function(value, attr, computedState) {
            var min = attr === minAttr ? mathUtils.strictParseFloat(value) : mathUtils.strictParseFloat(computedState[minAttr]),
                max = attr === maxAttr ? mathUtils.strictParseFloat(value) : mathUtils.strictParseFloat(computedState[maxAttr]);

            if (!_.isNaN(min) && !_.isNaN(max) && max <= min) {
                return invalidMessage;
            }
        };
    };

    ValidationUtils.filterToValidRangeValues = function(rangeValues) {
        if (_(rangeValues).isString()) {
            rangeValues = ValidationUtils.parseStringifiedArray(rangeValues);
        }
        rangeValues = _(rangeValues).chain().map(parseFloat).filter(function(val) { return !_(val).isNaN(); }).uniq().value();
        var runningMax = -Infinity;
        rangeValues = _(rangeValues).filter(function(val) {
            if(val < runningMax) {
                return false;
            }
            runningMax = val;
            return true;
        });
        return rangeValues;
    };

    ValidationUtils.validateRangeValues = function(value) {
        var ranges;
        if (value) {
            try {
                ranges = JSON.parse(value);
            }
            catch(e) {
                return _('Ranges must be of the form: ["0","30","70","100"]').t();
            }
        } else {
            ranges = [];
        }
        if (_(ranges).any(isNaN) || _(ranges).any(function(range) { return range === ""; })) {
            return _('All color ranges must be valid numbers.').t();
        }
        ranges = ranges.map(parseFloat);
        var filteredRanges = ValidationUtils.filterToValidRangeValues(ranges);
        if(!_.isEqual(ranges, filteredRanges)) {
            return _('Color ranges must be entered from lowest to highest.').t();
        }
    };

    ValidationUtils.parseStringifiedColorArray = function(value) {
        if (_(value).isArray()) {
            return value;
        }
        if (!value || value.charAt(0) !== '[' || value.charAt(value.length - 1) !== ']') {
            return false; //need to find a different way to bail
        }
        return splunkUtils.stringToFieldList(value.substring(1, value.length - 1));
    };

    ValidationUtils.parseStringifiedArray = function(value) {
        if (!value) {
            return [];
        }
        var parsedValues = [];
        // SPL-80318 wrap this call to JSON.parse in a try-catch because the input could be invalid JSON
        try {
            parsedValues = _.values(JSON.parse(value));
        }
        catch(e) {}
        return parsedValues;
    };

    /**
     *
     * Returns if an input is an integer that is supported in the conf 
     *
     * @param {String} value - string to be parsed into a number
     * @return {Boolean}
     */
    ValidationUtils.isValidInteger = function(value) {
        return value && (value === parseInt(value, 10).toString());
    };

    /**
     *
     * Returns if an input is an integer that is supported in the conf and not neg
     *
     * @param {String} value - string to be parsed into a number
     * @return {Boolean}
     */
    ValidationUtils.isNonNegValidInteger = function(value) {
        return ValidationUtils.isValidInteger(value) && value >= 0;
    };

    ValidationUtils.isPositiveValidInteger = function(value) {
        return ValidationUtils.isValidInteger(value) && value > 0;
    };

    /**
     *
     * Returns if an input is a valid hex color string
     *
     * @param {String} value - string to be parsed into a hex color
     * @return {Boolean}
     */
    ValidationUtils.isValidHexColorString = function(value) {
        if (!_.isString(value)) {
            return false;
        }
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
    };

    return ValidationUtils;

});