/**
 * @author jszeto
 * @date 6/11/13
 *
 * Represents the response from the TStats summarization endpoint.
 *
 * Attributes:
 *  summary.access_count - number of times the index has been accessed (via Pivot)
 *  summary.access_time - last time the index has been accessed
 *  summary.buckets - number of buckets
 *  summary.buckets_size - size of each bucket in MB
 *  summary.complete - decimal number between 0 and 1. Represents the percentage of the buckets that have been indexed
 *  summary.earliest_time - start time for the data being indexed
 *  summary.id - id of the index
 *  summary.is_inprogress - if 1, then the index has been scheduled to be collected
 *  summary.last_error - string displaying any error when processing the index
 *  summary.last_sid
 *  summary.latest_time - end time for the data being indexed
 *  summary.mod_time - last time the index was modified
 *  summary.size - the byte size of the index on disk
 *  summary.time_range
 */
define(
    [
        'jquery',
        'models/SplunkDBase'
    ],
    function($, SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "admin/summarization",
            fetch: function(options) {
                // for the purposes of parsing timestamps in the UI, make sure to use ISO-8601 as the time format
                options = $.extend(true, { data: { time_format: 'iso8601' } }, options);
                return SplunkDBaseModel.prototype.fetch.call(this, options);
            }
        });
    }
);
