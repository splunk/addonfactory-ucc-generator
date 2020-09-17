define(
    [
        'jquery',
        'underscore',
        'splunk.i18n',
        'models/Base',
        'collections/services/search/TimeParsers',
        'util/splunkd_utils',
        'util/time'
    ],
    function($, _, i18n, BaseModel, TimeParsersCollection, splunkd_utils, time_utils) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
                this.timeParsers = new TimeParsersCollection();
                this.associated.timeParsers = this.timeParsers;
                this.units = time_utils.TIME_UNITS;
            },
            clear: function(options) {
                delete this.timeParsersXHR;
                return BaseModel.prototype.clear.apply(this, arguments);
            },
            defaults: {
                enableRealTime: true
            },
            validation: {
                earliest: [
                    {},
                    {
                        fn: 'validateTime'
                    }
                ],
                latest: [
                    {},
                    {
                        fn: 'validateTime'
                    }
                ]
            },
            validateTime: function(value, attr, computedState) {
                var earliest_time_attr = (computedState.earliest || ""),
                    latest_time_attr = (computedState.latest || ""),
                    enableRealTime = this.get('enableRealTime'),
                    is_earliest_rt = time_utils.isRealtime(earliest_time_attr),
                    is_latest_rt = time_utils.isRealtime(latest_time_attr),
                    earliest_time = time_utils.stripRTSafe(earliest_time_attr, false),
                    latest_time = time_utils.stripRTSafe(latest_time_attr, true);
                
                if (earliest_time && latest_time && (earliest_time === latest_time) && (attr === "latest")) {
                    return _("You cannot have equivalent times.").t();
                } else if (!enableRealTime) {
                    if (((is_earliest_rt && is_latest_rt) && (attr === "latest")) ||
                            ((is_earliest_rt && !is_latest_rt && (attr === "earliest")) ||
                            (is_latest_rt && !is_earliest_rt && (attr === "latest")))) {
                        return _("rt time values are not allowed").t();
                    }
                } else {
                    if (is_earliest_rt && !is_latest_rt && (attr === "latest")) {
                        return _("You must set a rt value for latest time if you set a rt value for earliest time.").t();
                    } else if (!is_earliest_rt && is_latest_rt && (attr === "earliest")) {
                        return _("You must set a rt value for earliest time if you set a rt value for latest time.").t();
                    }                    
                }
            },
            sync: function(method, model, options) {
                var deferredResponse = $.Deferred(),
                    rootModel = model,
                    rootOptions = options,
                    timeParsers,
                    timeParsersISO,
                    times = [],
                    data = {},
                    error_msg,
                    latest,
                    earliest;
                
                model.trigger('request', model, deferredResponse, options);

                switch (method) {
                    case 'create':
                        earliest = time_utils.stripRTSafe(((model.get('earliest') || '') + ''), false);
                        if (earliest) {
                            times.push(earliest);
                        }   
                        latest = time_utils.stripRTSafe(((model.get('latest') || '') + ''), true);
                        if (latest) {
                            times.push(latest);
                        }
                        if (!times.length) {
                            options.success(data);
                            deferredResponse.resolve.apply(deferredResponse);
                            return deferredResponse.promise();
                        }

                        //get epoch
                        this.timeParsers.reset([]);
                        this.timeParsersXHR = this.timeParsers.fetch({
                            data: {
                                time: times,
                                output_time_format: '%s.%Q|%Y-%m-%dT%H:%M:%S.%Q%:z'
                            },  
                            success: function() {
                                var timeParserEarliest = this.timeParsers.get(earliest),
                                    timeParserEarliestParts = timeParserEarliest ? (timeParserEarliest.get('value') || '').split('|') : [],
                                    timeParserEarliestEpoch = timeParserEarliestParts[0],
                                    timeParserEarliestISO = timeParserEarliestParts[1],
                                    timeParserLatest = this.timeParsers.get(latest),
                                    timeParserLatestParts = timeParserLatest ? (timeParserLatest.get('value') || '').split('|') : [],
                                    timeParserLatestEpoch = timeParserLatestParts[0],
                                    timeParserLatestISO = timeParserLatestParts[1];
                                if (timeParserEarliest) {
                                    data.earliest_epoch = parseFloat(timeParserEarliestEpoch);
                                }
                                if (timeParserLatest) {
                                    data.latest_epoch = parseFloat(timeParserLatestEpoch);
                                }
                                if (timeParserEarliestISO) {
                                    data.earliest_iso = timeParserEarliestISO;
                                    data.earliest_date = time_utils.isoToDateObject(timeParserEarliestISO);
                                }
                                if (timeParserLatestISO) {
                                    data.latest_iso = timeParserLatestISO;
                                    data.latest_date = time_utils.isoToDateObject(timeParserLatestISO);
                                }
                                if (timeParserEarliest && timeParserLatest) {
                                    var earliestRounded = (Math.round(data.earliest_epoch * 1000) / 1000),
                                        latestRounded = (Math.round(data.latest_epoch * 1000) / 1000);
                                    
                                    if (earliestRounded === latestRounded) {
                                        error_msg = splunkd_utils.createSplunkDMessage(
                                            splunkd_utils.ERROR,
                                            _("You cannot have equivalent times.").t()
                                        );
                                    }
                                    if (earliestRounded > latestRounded) {
                                        error_msg = splunkd_utils.createSplunkDMessage(
                                            splunkd_utils.ERROR,
                                            _("Earliest time cannot be greater than latest time.").t()
                                        );
                                    }
                                    if (error_msg) {
                                        rootOptions.error(error_msg);
                                        return;
                                    }
                                }
                                rootOptions.success(data);
                            }.bind(this),
                            error: function() {
                                var message = splunkd_utils.createSplunkDMessage(
                                    splunkd_utils.ERROR,
                                    _("You have an invalid time in your range.").t()
                                );
                                rootOptions.error(message);                                
                            }
                        });
                        
                        this.timeParsersXHR.done(function(){
                            deferredResponse.resolve.apply(deferredResponse, arguments);
                        });
                        
                        this.timeParsersXHR.fail(function(){
                            deferredResponse.reject.apply(deferredResponse, arguments);
                        });
                        
                        return deferredResponse.promise();
                    default:
                        throw 'Operation not supported';
                }
            },
            
            /**
             * Convenience pass through methods to time_utils
             */
            getTimeParse: function(attr) {
                return time_utils.parseTimeString(this.get(attr));
            },
            isRealtime: function(attr) {
                return time_utils.isRealtime(this.get(attr));
            },
            isAbsolute: function(attr) {
                return time_utils.isAbsolute(this.get(attr));
            },
            isEpoch: function(attr) {
                return time_utils.isEpoch(this.get(attr));
            },
            isWholeDay: function(attr) {
                return time_utils.timeAndJsDateIsWholeDay(this.get(attr), this.get(attr + '_date'));
            },
            latestIsNow: function() {
                return time_utils.isNow(this.get('latest'));
            },
            hasNoEarliest: function() {
                return time_utils.isEmpty(this.get('earliest'));
            },

            isRangeSnappedToSeconds: function() {
                var earliestDate = this.get('earliest_date'),
                    latestDate = this.get('latest_date');

                if (earliestDate && (earliestDate.getMilliseconds() !== 0)) {
                    return false;
                }
                if (latestDate && (latestDate.getMilliseconds() !== 0)) {
                    return false;
                }
                return true;
            },

            /**
            * presets: <collections.services.data.ui.TimesV2>
            **/
            generateLabel: function(presets) {               
                return time_utils.generateLabel(presets, this.get('earliest'), this.get("earliest_date"), this.get('latest'), this.get("latest_date"));
            },
            fetchAbort: function() {
                BaseModel.prototype.fetchAbort();
                if (this.timeParsersXHR && this.timeParsersXHR.state && this.timeParsersXHR.state()==='pending') {
                    this.timeParsersXHR.abort();
                }
            }
        });
    }
);
