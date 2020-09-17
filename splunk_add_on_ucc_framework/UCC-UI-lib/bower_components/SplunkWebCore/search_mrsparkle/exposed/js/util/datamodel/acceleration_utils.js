define([
            'underscore',
            'util/moment',
            'util/time',
            'splunk.i18n',
            'splunk.util'
        ],
        function(
            _,
            moment,
            timeUtils,
            i18n,
            splunkUtils
        ) {

    var DATE_FORMAT = 'YYYY MM dd,',
        TIME_FORMAT = 'medium';

    /**
     * Formats an ISO-8601 timestamp into a user-friendly time string.
     * If the time string corresponds to epoch zero, return a message indicating that the acceleration has no data.
     * @param isoTime
     */
    var formatTimestamp = function(isoTime) {
        if(!isoTime) {
            return '';
        }
        var epoch = splunkUtils.getEpochTimeFromISO(isoTime);
        if(epoch === '0') {
            return _('None').t();
        }
        var date = timeUtils.isoToDateObject(isoTime);
        return i18n.format_datetime(date, DATE_FORMAT, TIME_FORMAT);
    };

    /**
     * Outputs a full description of the status of acceleration.
     * @param progress (decimal between 0 and 1)
     * @param lastUpdated (ISO-8601 timestamp)
     */
    var formatProgressMessage = function(progress, lastUpdated) {
        if(!progress && progress !== 0) {
            return '';
        }
        if(_.isString(progress)) {
            progress = parseFloat(progress);
        }
        if(progress < 1) {
            return splunkUtils.sprintf(_('%s Complete').t(), i18n.format_percent(progress));
        }
        if(!lastUpdated) {
            return _('Completed').t();
        }
        var lastUpdatedMessage = moment(timeUtils.isoToDateObject(lastUpdated)).fromNow();
        return splunkUtils.sprintf(_('Completed (Updated %s)').t(), lastUpdatedMessage);
    };

    /**
     * Outputs a user-friendly version of an acceleration time range.
     * @param range (number of seconds)
     */
    var formatRange = function(range) {
        if(!range && range !== 0) {
            return '';
        }
        if(_.isString(range)) {
            range = parseInt(range, 10);
        }
        return moment.duration(range, 'seconds').humanize();
    };

    return ({

        formatTimestamp: formatTimestamp,
        formatProgressMessage: formatProgressMessage,
        formatRange: formatRange

    });

});
