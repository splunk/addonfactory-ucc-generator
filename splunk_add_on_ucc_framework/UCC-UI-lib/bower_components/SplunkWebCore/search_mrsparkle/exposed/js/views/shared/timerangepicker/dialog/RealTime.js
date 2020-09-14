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
        "splunk.i18n",
        'contrib/text!views/shared/timerangepicker/dialog/RealTime.html'
    ],
    function($,
        _,
        Backbone,
        module,
        TimeParserModel,
        TimeRangeModel,
        Base,
        SyntheticSelectControl,
        FlashMessages,
        time_utils,
        i18n,
        realTimeTemplate
        ) {
        return Base.extend({
            moduleId: module.id,
            className: 'accordion-inner form real-time-container',
            template: realTimeTemplate,
            defaultRangeType: "s",
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);

                _.defaults(this.options, {appendSelectDropdownsTo: 'body'});

                this.label = _('Real-time').t();

                this.model = {
                    timeRange: this.model,
                    workingRange: new TimeRangeModel(),
                    earliestTimeParser: new TimeParserModel()
                };
                this.syncInternals();

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
                    modelAttribute: 'realtime_range_type',
                    className: 'btn-group timerangepicker-realtime_range_type',
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    popdownOptions: {attachDialogTo: this.options.appendSelectDropdownsTo},
                    save: false
                });

                this.children.flashMessages = new FlashMessages({
                    model: {
                        workingRange: this.model.workingRange,
                        earliestTimeParser: this.model.earliestTimeParser
                    }
                });

                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.workingRange, "change:realtime_range_type change:realtime_earliest_value", _.debounce(function() {
                    this.fetchEarliestTime();
                }.bind(this), 0));

                this.listenTo(this.model.earliestTimeParser, "change", this.updateEarliestHint);

                this.listenTo(this.model.earliestTimeParser, "error", function() {
                    this.$("#hint_" + this.cid).html(this.model.earliestTimeParser.error.get("messages")[0].message);
                    this.disableApply();
                });

                this.listenTo(this.model.timeRange, 'change:earliest change:latest prepopulate', _.debounce(this.prepopulate, 0));
            },
            syncInternals: function() {
                this.model.workingRange.set(
                    $.extend(true, {}, this.model.timeRange.toJSON(), {realtime_range_type: this.defaultRangeType})
                );

                this.model.earliestTimeParser.set({
                    key: time_utils.stripRTSafe(this.model.timeRange.get("earliest"), false),
                    value: this.model.timeRange.get("earliest_iso")
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

                return this;
            },
            updateEarliestHint: function() {
                var date = time_utils.isoToDateObject(this.model.earliestTimeParser.get("value"));
                this.$("#hint_" + this.cid).html(i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(date), "short", "full"));
                this.enableApply();
            },
            prepopulate: function() {
                var earliestParse = this.model.timeRange.getTimeParse('earliest'),
                    attrValues = {};

                if (!earliestParse) { return;}

                this.$('.earliest_input').val(earliestParse.amount);

                attrValues.realtime_earliest_value = earliestParse.amount;
                attrValues.realtime_range_type = earliestParse.unit;

                this.model.workingRange.set(attrValues);
            },
            supportsRange: function() {
                var earliestParse = this.model.timeRange.getTimeParse('earliest'),
                    latestParse = this.model.timeRange.getTimeParse('latest');

                if (!earliestParse) { return false; }

                return earliestParse.isRealTime && earliestParse.amount && !earliestParse.snapUnit
                        && latestParse.isRealTime && latestParse.isNow && !latestParse.snapUnit ;
            },
            getEarliestTime: function(withoutRT) {
                var amount = this.model.workingRange.get('realtime_earliest_value'),
                    type = this.model.workingRange.get('realtime_range_type') || this.defaultRangeType;

                if (!amount){
                    return null;
                }
                return (withoutRT ? "" : "rt") + "-" + amount + type;
            },
            fetchEarliestTime: function() {
                var time = this.getEarliestTime(true),
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
                    this.$("#hint_" + this.cid).html("");
                    this.enableApply();
                }
            },
            events: {
                "keyup .earliest_input": function(event) {
                    this.model.workingRange.set('realtime_earliest_value', this.$("#earliest_" + this.cid).val());
                },
                "click .apply": function(event) {
                    if ($(event.currentTarget).hasClass("disabled")) {
                        event.preventDefault();
                        return;
                    }

                    var that = this,
                        earliest = this.getEarliestTime();
                    this.disableApply();

                    this.model.workingRange.save(
                            {
                                earliest: earliest,
                                latest: "rtnow"
                            },
                            {
                                success: function(model) {
                                    that.enableApply();
                                    that.model.timeRange.set({
                                        'earliest': earliest,
                                        'latest': "rtnow",
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
                                    that.enableApply();
                                }
                            }
                    );
                    event.preventDefault();
                }
            },
            enableApply: function() {
                this.$("#apply_" + this.cid).removeClass('disabled');
            },
            disableApply: function() {
                this.$("#apply_" + this.cid).addClass('disabled');
            },
            render: function() {
                var template = _.template(this.template, {
                    _: _,
                    cid: this.cid,
                    time: this.model.workingRange.get('realtime_earliest_value') || ""
                });
                this.$el.html(template);

                this.children.flashMessages.render().prependTo(this.$el);
                this.children.rangeTypeSelect.render().insertAfter(this.$(".earliest_input"));

                return this;
            }
        });
    }
);
