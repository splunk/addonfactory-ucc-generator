define([
       'underscore'
   ],
   function(_) {

    var DECIMAL_OR_SCIENTIFIC_REGEX = /(^[-+]?[0-9]*[.]?[0-9]*$)|(^[-+]?[0-9][.]?[0-9]*e[-+]?[0-9][0-9]*$)/i;
    var COMMA_SEPARATED_NUMBER_REGEX = /(^[-+]?([0]|([1-9][0-9]{0,2})|(([1-9][0-9]{0,2}[,])([0-9]{3}[,])*[0-9]{3}))(([.][0-9]+)?)$)/;
    var MIN_SAFE_INTEGER = -9007199254740991; // Hard code Number.MIN_SAFE_INTEGER since it is not supported in IE, opera and safari
    var MAX_SAFE_INTEGER =  9007199254740991; // Hard code Number.MAX_SAFE_INTEGER since it is not supported in IE, opera and safari

    /**
     * @author sfishel
     *
     * A strict version of parseFloat that requires the entire input string to be valid decimal or scientific format
     *
     * @param {String} str - string to be parsed into a number
     * @return {Number or NaN}
     */

    var strictParseFloat = function(str) {
        // if the number is not in decimal or scientific format, return NaN explicitly
        // instead of letting JavaScript do its loose parsing
        if(!DECIMAL_OR_SCIENTIFIC_REGEX.test(str)) {
            return NaN;
        }
        return parseFloat(str);
    };

    /**
    * @author rtran
    *
    * Checks if the value passed in is some comma separated number
    * (e.g. "1,234", "300,000,000", and "12,345.67"). This function provides 
    * a simple way to determine when a comma seperated value string should be 
    * considered a number.
    *
    * @param {String} str - string to be checked
    * @returns {Boolean} - return true if (str) is a valid number grouped by either commas or decimals, false otherwise
    */
    var isCommaSeparatedNumber = function(str) {
        // if str is not a number grouped with either commas or decimals
        if(!COMMA_SEPARATED_NUMBER_REGEX.test(str)) {
            return false;
        }
        return true;
    };

    /**
     * 
     * Rounds a number to a specifice exp base 10
     *
     * @param {Number} value - number to round
     * @param {Number} exp - exp of base 10 of the decimal palce to round to 
                            eg: exp=-1 rounds to the tenths place
                                exp=-2 rounds to the hundredth place
                                exp=0 rounds to the ones place
                                exp=1 rounds to the tens place
     * @return {Number or NaN}
     *
     * reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
     */
    var roundToDecimal = function(value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math.round(value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    };

    /**
     *
     * Returns if an input is an integer
     *
     * @param {String} value
     * @return {Boolean}
     */
     var isInteger = function(value) {
        var parsedValue = strictParseFloat(value);
        return !isNaN(parsedValue) && parsedValue % 1 === 0;
     };
     
     var nearestMatchAndIndexInArray = function(valueToMatch, values) {         
         var closestValue, closestIndex;
         _.each(values, function(value, index){
             if (closestValue == null || (Math.abs(valueToMatch - value) < Math.abs(closestValue - valueToMatch))) {
                 closestValue = value;
                 closestIndex = index;
             }
         });
         return {value: closestValue, index: closestIndex};
     };

     /*
      * Returns the nearest whole power of ten to the given number, without exceeding that number
      * e.g.
      *
      * 10 -> 10
      * 11 -> 10
      * 99 -> 10
      * 100 -> 100
      * ...
      */
     var nearestPowerOfTen = function(number) {
         return Math.pow(10, Math.floor(Math.log(number) / Math.LN10));
     };

     var isLessThanMinSafeInt = function(number) {
        if(typeof number != 'number') return false;
        if(number <= MIN_SAFE_INTEGER) {
            return true;
        }
        return false;
     };

     var isGreaterThanMaxSafeInt = function(number) {
        if(typeof number != 'number') return false;
        if(number >= MAX_SAFE_INTEGER) {
            return true;
        }
        return false;
     };

     var stripFloatingPointErrors = function(number) {
         return (parseFloat(number.toPrecision(12)));
     };

     var convertToTwoDecimalPercentage = function(value, totalCount) {
         // Convert to percentage and always round to 2 d.p.
         return (parseFloat(value) / totalCount * 100).toFixed(2);
     };

    return ({
        strictParseFloat: strictParseFloat,
        isCommaSeparatedNumber: isCommaSeparatedNumber,
        roundToDecimal: roundToDecimal,
        isInteger: isInteger,
        nearestMatchAndIndexInArray: nearestMatchAndIndexInArray,
        nearestPowerOfTen: nearestPowerOfTen,
        isLessThanMinSafeInt: isLessThanMinSafeInt,
        isGreaterThanMaxSafeInt: isGreaterThanMaxSafeInt,
        stripFloatingPointErrors: stripFloatingPointErrors,
        convertToTwoDecimalPercentage: convertToTwoDecimalPercentage
    });

});