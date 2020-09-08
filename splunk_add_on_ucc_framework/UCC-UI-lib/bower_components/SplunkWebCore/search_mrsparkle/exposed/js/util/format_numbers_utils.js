/**
 * Util package for formatting number.
 */

define(['underscore', 'splunk.i18n', 'splunk.util', 'util/math_utils'], function(_, i18n, splunkUtil, mathUtils) {

    /**
     * method to convert number to file size representation
     * @param bytes (file size in bytes)
     */

    var bytesToFileSize = function(bytes) {

        var kbFileSize = ((bytes || 0) / 1024),
            mbFileSize, gbFileSize, tbFileSize;
        
        if (Math.floor(kbFileSize) === 0) {
            return i18n.format_decimal(bytes) + " " +  _("B").t();
        }
        
        mbFileSize = kbFileSize / 1024;
        
        if (Math.floor(mbFileSize) === 0) {
            return i18n.format_decimal(kbFileSize.toFixed(2)) + " " +  _("KB").t();
        } 
        
        gbFileSize = mbFileSize / 1024;
        
        if (Math.floor(gbFileSize) === 0) {
            return i18n.format_decimal(mbFileSize.toFixed(2)) + " " + _("MB").t();
        }
        
        tbFileSize = gbFileSize / 1024;
        if (Math.floor(tbFileSize) === 0) {
            return i18n.format_decimal(gbFileSize.toFixed(2)) + " " + _("GB").t();
        }

        return i18n.format_decimal(tbFileSize.toFixed(2)) + " " + _("TB").t();
    };

    /**
     * A method to abbreviate number to a maximum of 4 digits 
     *
     * @param number {integer} number to format
     */

    var abbreviateNumber = function(number) {
        if (number <= 1000) {
            //less than 1,000
            return i18n.format_decimal(number);
        } else if (number < 10000) {
            //less than 10,000
            return splunkUtil.sprintf(_('%sK').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000, -2)));
        } else if (number < 100000) {
            //less than 100,000
            return splunkUtil.sprintf(_('%sK').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000, -1)));
        } else if (number < 999500) {
            //less than 999,500
            return splunkUtil.sprintf(_('%sK').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000, 0)));
        } else if (number < 10000000) {
            //less than 10,000,000
            return splunkUtil.sprintf(_('%sM').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000000, -2)));
        } else if (number < 100000000) {
            //less than 100,000,000
            return splunkUtil.sprintf(_('%sM').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000000, -1)));
        } else if (number < 999500000) {
            //less than 999,500,000
            return splunkUtil.sprintf(_('%sM').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000000, 0)));
        } else if (number < 10000000000) {
            //less than 10,000,000,000
            return splunkUtil.sprintf(_('%sB').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000000000, -2)));
        } else if (number < 100000000000) {
            //less than 100,000,000,000
            return splunkUtil.sprintf(_('%sB').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000000000, -1)));
        } else {
            //greater than or equal to 100,000,000,000
            return splunkUtil.sprintf(_('%sB').t(), i18n.format_decimal(mathUtils.roundToDecimal(number/1000000000, 0)));
        }
    };
    return ({
        abbreviateNumber: abbreviateNumber,
        bytesToFileSize: bytesToFileSize
    });
});