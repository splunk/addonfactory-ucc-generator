/**
 * @author jszeto
 * @date 11/20/14
 *
 * TODO [JCS] Merge this in with splunk util/time.js in Ember
 */
define(
    [
        'backbone',
        'underscore',
        'splunk.util',
        'splunk.i18n'

    ],
    function(
        Backbone,
        _,
        splunkUtils,
        i18n) {

        var YEAR = 31536000;
        var MONTH = 2592000;
        var WEEK = 604800;
        var DAY = 86400;
        var HOUR = 3600;
        var MINUTE = 60;
        var SECOND = 1;

        var YEAR_STRING = _("Year").t();
        var YEARS_STRING = _("Years").t();
        var MONTH_STRING = _("Month").t();
        var MONTHS_STRING = _("Months").t();
        var WEEK_STRING = _("Week").t();
        var WEEKS_STRING = _("Weeks").t();
        var DAY_STRING = _("Day").t();
        var DAYS_STRING = _("Days").t();
        var HOUR_STRING = _("Hour").t();
        var HOURS_STRING = _("Hours").t();
        var MINUTE_STRING = _("Minute").t();
        var MINUTES_STRING = _("Minutes").t();
        var SECOND_STRING = _("Second").t();
        var SECONDS_STRING = _("Seconds").t();

        /**
         * Formats a value in seconds into a more human readable format.
         *
         * @param value number in seconds
         * @returns {string} a formatted string (eg. "2 hours" or "1 day")
         */
        var formatSeconds = function(value) {
            var formattedValue = "";
            var timeRange = parseInt(value, 10) || 0;
            var unit = ((timeRange >= YEAR) && (timeRange % YEAR == 0)) ? {value: YEAR, single: YEAR_STRING, plural: YEARS_STRING} :
                       ((timeRange >= MONTH) && (timeRange % MONTH == 0)) ? {value: MONTH, single: MONTH_STRING, plural: MONTHS_STRING}:
                       ((timeRange >= WEEK) && (timeRange % WEEK == 0)) ? {value: WEEK, single: WEEK_STRING, plural: WEEKS_STRING}:
                       ((timeRange >= DAY) && (timeRange % DAY == 0)) ? {value:DAY , single: DAY_STRING, plural:DAYS_STRING}:
                       ((timeRange >= HOUR) && (timeRange % HOUR == 0)) ? {value: HOUR, single: HOUR_STRING, plural:HOURS_STRING}:
                       ((timeRange >= MINUTE) && (timeRange % MINUTE == 0)) ? {value: MINUTE, single: MINUTE_STRING, plural:MINUTES_STRING}:
                                                                              {value: SECOND, single: SECOND_STRING, plural:SECONDS_STRING};
            var number = timeRange / unit.value;

            return splunkUtils.sprintf(i18n.ungettext('%(count)s %(single)s', '%(count)s %(plural)s', number),
                                         {count: number, single:unit.single, plural: unit.plural});
        };

    return ({
        formatSeconds: formatSeconds
    });
    }
);