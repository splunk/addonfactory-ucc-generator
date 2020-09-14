define(
    [
        "jquery",
        "underscore",
        "backbone",
        "module",
        "models/services/search/TimeParser",
        "models/shared/TimeRange",
        "views/Base",
        "views/shared/controls/SyntheticSelectControl",
        "views/shared/FlashMessages",
        "util/time",
        "util/splunkd_utils",
        "splunk.i18n",
        'contrib/text!views/shared/timerangepicker/dialog/Relative.html'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        TimeParserModel,
        TimeRangeModel,
        Base,
        SyntheticSelectControl,
        FlashMessages,
        time_utils,
        splunkd_utils,
        i18n,
        relativeTemplate
        ) {
        return Base.extend({
            moduleId: module.id,
            className: 'accordion-inner relative-time-container form',
            template: relativeTemplate,
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);

                _.defaults(this.options, {appendSelectDropdownsTo: 'body'});

                this.label = _('Relative').t();

                this.model = {
                    timeRange: this.model,
                    workingRange: new TimeRangeModel(),
                    earliestTimeParser: new TimeParserModel(),
                    latestTimeParser: new TimeParserModel()
                };
                this.syncInternals();

                this.rangeMap = {
                        's': {
                            earliest: _('Beginning of second').t(),
                            latest: _('Beginning of current second').t()
                        },
                        'm': {
                            earliest: _('Beginning of minute').t(),
                            latest: _('Beginning of current minute').t()
                        },
                        'h': {
                            earliest: _('Beginning of hour').t(),
                            latest: _('Beginning of current hour').t()
                        },
                        'd': {
                            earliest: _('Beginning of day').t(),
                            latest: _('Beginning of today').t()
                        },
                        'w': {
                            earliest: _('First day of week').t(),
                            latest: _('First day of this week').t()
                        },
                        'mon': {
                            earliest: _('First day of month').t(),
                            latest: _('First day of this month').t()
                        },
                        'q': {
                            earliest: _('First day of quarter').t(),
                            latest: _('First day of this quarter').t()
                        },
                        'y': {
                            earliest: _('First day of year').t(),
                            latest: _('First day of this year').t()
                        }
                };

                this.children.rangeTypeSelect = new SyntheticSelectControl({
                    model: this.model.workingRange,
                    items: [
                        {value: 's', label: _('Seconds Ago').t()},
                        {value: 'm', label: _('Minutes Ago').t()},
                        {value: 'h', label: _('Hours Ago').t()},
                        {value: 'd', label: _('Days Ago').t()},
                        {value: 'w', label: _('Weeks Ago').t()},
                        {value: 'mon', label: _('Months Ago').t()},
                        {value: 'q', label: _('Quarters Ago').t()},
                        {value: 'y', label: _('Years Ago').t()}
                    ],
                    modelAttribute: 'relative_range_unit',
                    className: 'btn-group timerangepicker-relative_range_unit',
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    popdownOptions: {attachDialogTo: this.options.appendSelectDropdownsTo},
                    save: false
                });

                this.children.flashMessages = new FlashMessages({
                    model: {
                        workingRange: this.model.workingRange,
                        earliestTimeParser: this.model.earliestTimeParser,
                        latestTimeParser: this.model.latestTimeParser
                    }
                });

                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.workingRange, "change:relative_range_unit", function() {
                    var timeRange = this.model.workingRange.get("relative_range_unit");
                    this.$(".earliest_snap_label .text").html(this.rangeMap[timeRange].earliest);
                    this.$(".latest_snap_label .text").html(this.rangeMap[timeRange].latest);
                    this.fetchEarliestTime();
                    this.fetchLatestTime();
                });

                this.listenTo(this.model.workingRange, "change:relative_earliest_snap_to change:relative_earliest_value", _.debounce(this.fetchEarliestTime, 0));
                this.listenTo(this.model.workingRange, "change:relative_latest_snap_to", _.debounce(this.fetchLatestTime, 0));

                this.listenTo(this.model.earliestTimeParser, "change", this.updateEarliestHint);

                this.listenTo(this.model.earliestTimeParser, "error", function() {
                    this.$("#earliest_hint_" + this.cid).html(this.model.earliestTimeParser.error.get("messages")[0].message);
                    this.disableApply();
                });

                this.listenTo(this.model.latestTimeParser, "change", this.updateLatestHint);

                this.listenTo(this.model.latestTimeParser, "error", function() {
                    this.$("#latest_hint_" + this.cid).html(this.model.latestTimeParser.error.get("messages")[0].message);
                    this.disableApply();
                });

                this.listenTo(this.model.timeRange, 'change:earliest change:latest prepopulate', _.debounce(this.prepopulate, 0));
            },
            syncInternals: function() {
                this.model.workingRange.set(
                    $.extend(true, {}, this.model.timeRange.toJSON(), {relative_range_unit: 's'})
                );

                this.model.earliestTimeParser.set({
                    key: time_utils.stripRTSafe(this.model.timeRange.get("earliest"), false),
                    value: this.model.timeRange.get("earliest_iso")
                });

                this.model.latestTimeParser.set({
                    key: time_utils.stripRTSafe(this.model.timeRange.get("latest"), true),
                    value: this.model.timeRange.get("latest_iso")
                });
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                this.syncInternals();
                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);

                this.model.workingRange.fetchAbort();
                this.model.workingRange.clear({setDefaults: true});
                this.model.earliestTimeParser.fetchAbort();
                this.model.earliestTimeParser.clear({setDefaults: true});
                this.model.latestTimeParser.fetchAbort();
                this.model.latestTimeParser.clear({setDefaults: true});

                return this;
            },
            updateEarliestHint: function() {
                var date = time_utils.isoToDateObject(this.model.earliestTimeParser.get("value"));
                this.$("#earliest_hint_" + this.cid).html(i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(date), "short", "full"));
                this.enableApply();
            },
            updateLatestHint: function() {
                var date = time_utils.isoToDateObject(this.model.latestTimeParser.get("value"));
                this.$("#latest_hint_" + this.cid).html(i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(date), "short", "full"));
                this.enableApply();
            },
            prepopulate: function() {
                var earliestParse = this.model.timeRange.getTimeParse('earliest'),
                    latestParse = this.model.timeRange.getTimeParse('latest'),
                    attrValues = {};

                if (!earliestParse) return;

                attrValues.relative_earliest_value = earliestParse.amount;
                attrValues.relative_earliest_snap_to = (earliestParse.hasSnap ? 1 : 0);
                attrValues.relative_latest_snap_to = ((latestParse && latestParse.hasSnap) ? 1 : 0);
                if (this.rangeMap.hasOwnProperty(earliestParse.unit)) {
                    attrValues.relative_range_unit = earliestParse.unit;
                }

                this.model.workingRange.set(attrValues);

                this.$('.earliest_input').val(earliestParse.amount);
                this.$('[name=earliest_snap][value=' + this.model.workingRange.get('relative_earliest_snap_to') + ']').prop('checked', true);
                this.$('[name=latest_snap][value=' + this.model.workingRange.get('relative_latest_snap_to') + ']').prop('checked', true);
            },
            supportsRange: function() {
                return time_utils.generateRelativeTimeLabel(this.model.timeRange.get('earliest'), this.model.timeRange.get('latest'));
            },
            getEarliestTime: function() {
                var amount = this.model.workingRange.get('relative_earliest_value'),
                    unit = this.model.workingRange.get('relative_range_unit') || "s",
                    snap = this.model.workingRange.get('relative_earliest_snap_to');
                if (!amount){
                    return null;
                }
                return "-" + amount + unit + (snap ? ("@" + unit) : "");
            },
            fetchEarliestTime: function() {
                var time = this.getEarliestTime(),
                    id = time_utils.stripRTSafe(this.model.earliestTimeParser.id, false);

                if (time && (time !== id)) {
                    this.model.earliestTimeParser.fetch({
                        data : {
                            time: time
                        }
                    });
                } else if (this.model.earliestTimeParser.get("value")) {
                    this.updateEarliestHint();
                } else {
                    this.$("#earliest_hint_" + this.cid).html("");
                    this.enableApply();
                }
            },
            getLatestTime: function() {
                var type = this.model.workingRange.get('relative_range_unit') || "mon",
                    snap = this.model.workingRange.get('relative_latest_snap_to'),
                    time = "now";
                if (snap){
                    time = "@" + type;
                }
                return time;
            },
            fetchLatestTime: function() {
                var time = this.getLatestTime(),
                    id = this.model.latestTimeParser.id;

                if (time && (time !== id)) {
                    this.model.latestTimeParser.fetch({
                        data : {
                            time: time
                        }
                    });
                } else if (this.model.latestTimeParser.get("value")) {
                    this.updateLatestHint();
                } else {
                    this.$("#latest_hint_" + this.cid).html("");
                }
            },
            events: {
                "keyup .earliest_input": function(event) {
                    this.model.workingRange.set('relative_earliest_value', this.$("#earliest_" + this.cid).val());
                },
                "change .earliest_snap": function(event) {
                    var value = parseInt(this.$("input:radio[name=earliest_snap]:checked").val(), 10);
                    this.model.workingRange.set("relative_earliest_snap_to", value);
                },
                "change .latest_snap": function(event) {
                    var value = parseInt(this.$("input:radio[name=latest_snap]:checked").val(), 10);
                    this.model.workingRange.set("relative_latest_snap_to", value);
                },
                "click .apply": function(event) {
                    if ($(event.currentTarget).hasClass("disabled")) {
                        event.preventDefault();
                        return;
                    }

                    var that = this,
                        earliest = this.getEarliestTime(),
                        latest = this.getLatestTime();

                    if (!earliest){
                        var error = splunkd_utils.createSplunkDMessage(splunkd_utils.ERROR, "Earliest cannot be blank.");
                        this.model.earliestTimeParser.trigger("error", this.model.earliestTimeParser, error);
                        return false;
                    }

                    this.disableApply();

                    this.model.workingRange.save(
                        {
                            earliest: earliest,
                            latest: latest
                        },
                        {
                            success: function(model) {
                                that.enableApply();
                                that.model.timeRange.set({
                                    'earliest': earliest,
                                    'latest': latest,
                                    'earliest_epoch': model.get('earliest_epoch'),
                                    'latest_epoch': model.get('latest_epoch'),
                                    'earliest_iso': model.get('earliest_iso'),
                                    'latest_iso': model.get('latest_iso'),
                                    'earliest_date': new Date(model.get('earliest_date').getTime()),
                                    'latest_date': new Date(model.get('latest_date').getTime())
                                });
                                that.model.timeRange.trigger("applied");
                            },
                            error: function(model, error) {
                                that.disableApply();
                            }
                        }
                    );
                    event.preventDefault();
                }
            },
            generateLabel: function() {
                return "Custom Time";
            },
            enableApply: function() {
                this.$("#apply_" + this.cid).removeClass('disabled');
            },
            disableApply: function() {
                this.$("#apply_" + this.cid).addClass('disabled');
            },
            render: function() {
                var template = _.template(this.template, {
                    cid: this.cid,
                    time: this.model.workingRange.get('relative_earliest_value') || "",
                    rangeMap: this.rangeMap,
                    selectedRange: this.model.workingRange.get('relative_range_unit') || "mon",
                    _: _
                });
                this.$el.html(template);

                this.children.flashMessages.render().prependTo(this.$el);
                this.children.rangeTypeSelect.render().insertAfter(this.$(".earliest_input"));
                if (this.model.latestTimeParser.isNew()) {
                    this.fetchLatestTime();
                }

                return this;
            }
        });
    }
);
