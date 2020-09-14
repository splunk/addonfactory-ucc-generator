define(['underscore', 'util/math_utils'], function(_, splunkMathUtils) {

    var HEX_REGEX = /^( )*(0x|-0x)/;

    // an extended version of parseFloat that will handle numbers encoded in hex format (i.e. "0xff")
    // and is stricter than native JavaScript parseFloat for decimal numbers
    var parseFloat = function(str) {
        // determine if the string is a hex number by checking if it begins with '0x' or '-0x',
        // in which case delegate to parseInt with a 16 radix
        if(HEX_REGEX.test(str)) {
            return parseInt(str, 16);
        }
        return splunkMathUtils.strictParseFloat(str);
    };

    // shortcut for base-ten log, also rounds to four decimal points of precision to make pretty numbers
    var logBaseTen = function(num) {
        var result = Math.log(num) / Math.LN10;
        return (Math.round(result * 10000) / 10000);
    };

    // transforms numbers to a normalized log scale that can handle negative numbers
    // rounds to four decimal points of precision
    var absLogBaseTen = function(num) {
        if(typeof num !== "number") {
            num = parseFloat(num);
        }
        if(_(num).isNaN()) {
            return num;
        }
        var isNegative = (num < 0),
            result;

        if(isNegative) {
            num = -num;
        }
        if(num < 10) {
            num += (10 - num) / 10;
        }
        result = logBaseTen(num);
        return (isNegative) ? -result : result;
    };

    // reverses the transformation made by absLogBaseTen above
    // rounds to three decimal points of precision
    var absPowerTen = function(num) {
        if(typeof num !== "number") {
            num = parseFloat(num);
        }
        if(_(num).isNaN()) {
            return num;
        }
        var isNegative = (num < 0),
            result;

        if(isNegative) {
            num = -num;
        }
        result = Math.pow(10, num);
        if(result < 10) {
            result = 10 * (result - 1) / (10 - 1);
        }
        result = (isNegative) ? -result : result;
        return (Math.round(result * 1000) / 1000);
    };

    // calculates the power of ten that is closest to but not greater than the number
    // negative numbers are treated as their absolute value and the sign of the result is flipped before returning
    var nearestPowerOfTen = function(num) {
        if(typeof num !== "number") {
            return NaN;
        }
        var isNegative = num < 0;
        num = (isNegative) ? -num : num;
        var log = logBaseTen(num),
            result = Math.pow(10, Math.floor(log));

        return (isNegative) ? -result: result;
    };

    var roundWithMin = function(value, min) {
        return Math.max(Math.round(value), min);
    };

    var roundWithMinMax = function(value, min, max) {
        var roundVal = Math.round(value);
        if(roundVal < min) {
            return min;
        }
        if(roundVal > max) {
            return max;
        }
        return roundVal;
    };

    var degreeToRadian = function(degree) {
        return (degree * Math.PI) / 180;
    };

    // returns the number of digits of precision after the decimal point
    // optionally accepts a maximum number, after which point it will stop looking and return the max
    var getDecimalPrecision = function(num, max) {
        max = max || Infinity;
        var precision = 0;

        while(precision < max && num.toFixed(precision) !== num.toString()) {
            precision += 1;
        }

        return precision;
    };

    return ({

        parseFloat: parseFloat,
        logBaseTen: logBaseTen,
        absLogBaseTen: absLogBaseTen,
        absPowerTen: absPowerTen,
        nearestPowerOfTen: nearestPowerOfTen,
        roundWithMin: roundWithMin,
        roundWithMinMax: roundWithMinMax,
        degreeToRadian: degreeToRadian,
        getDecimalPrecision: getDecimalPrecision

    });

});