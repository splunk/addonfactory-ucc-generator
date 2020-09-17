/**
 * @author jszeto
 * @date 11/20/14
 */
define(
    [
        'backbone',
        'underscore',
        'splunk.util'

    ],
    function(
        Backbone,
        _,
        splunkUtils) {

        var KB = 1000;
        var MB = 1000000;
        var GB = 1000000000;
        var TB = 1000000000000;

        var KB_STRING = _("Kbit/s").t();
        var MB_STRING = _("Mbit/s").t();
        var GB_STRING = _("Gbit/s").t();
        var TB_STRING = _("Tbit/s").t();

        /**
         * Formats a value in Bits / second into a more human readable format.
         *
         * @param value number in Bits / second
         * @returns {string} a formatted string (eg. "4 Mbit/s" or "1 Gbit/s" or "unlimited")
         */
        var formatBandWidth = function(value) {
            var formattedValue = "";
            var bandWidth = parseInt(value, 10) || 0;
            var unit = ((bandWidth >= TB) && (bandWidth % TB == 0)) ? {value: TB, label:TB_STRING}:
                       ((bandWidth >= GB) && (bandWidth % GB == 0)) ? {value: GB, label:GB_STRING}:
                       ((bandWidth >= MB) && (bandWidth % MB == 0)) ? {value: MB, label:MB_STRING}:{value: KB, label:KB_STRING};
            var number = bandWidth / unit.value;

            //console.log("formatBandWidth",value,"bandWidth",bandWidth);
            if (number == 0)
                return _("unlimited").t();

            return splunkUtils.sprintf('%d %s', number, unit.label);
        };

        return ({
            formatBandWidth: formatBandWidth
        });
    }
);
