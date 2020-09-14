define(
        [
            "jquery",
            "underscore",
            "backbone",
            "module",
            "models/Base",
            "models/shared/DateInput",
            "models/shared/TimeRange",
            "views/Base",
            "views/shared/controls/SyntheticSelectControl",
            "views/shared/timerangepicker/dialog/dateandtimerange/RangePicker",
            "views/shared/FlashMessages",
            "util/time"
        ],
        function($, _, Backbone, module, BaseModel, DateInputModel, TimeRangeModel, Base, SyntheticSelectControl, RangePicker, FlashMessages, time_utils) {
            return Base.extend({
                className: 'accordion-inner form',
                moduleId: module.id,
                initialize: function() {
                    var defaults = {
                        canSetTime: true,
                        appendSelectDropdownsTo: 'body'
                    };

                    _.defaults(this.options, defaults);
                    this.$el.addClass(this.options.canSetTime ? 'dateandtime-container' : 'date-container');

                    Base.prototype.initialize.apply(this, arguments);

                    this.label = this.options.label;
                    this.canSetTime = this.options.canSetTime;

                    this.model = {
                        timeRange: this.model,
                        rangeSelector: new BaseModel(),
                        workingRange: new TimeRangeModel(),
                        earliestDateInput: new DateInputModel(),
                        latestDateInput: new DateInputModel()
                    };

                    this.syncInternals();

                    this.children.flashMessages = new FlashMessages({
                        model: {
                            workingRange: this.model.workingRange,
                            earliestDateInput: this.model.earliestDateInput,
                            latestDateInput: this.model.latestDateInput
                        }
                    });

                    this.children.rangeTypeSelect = new SyntheticSelectControl({
                        model: this.model.rangeSelector,
                        items: [
                            {value: 'between_dates', label: _('Between').t()},
                            {value: 'before_date', label: _('Before').t()},
                            {value: 'after_date', label: _('Since').t()}
                        ],
                        modelAttribute: 'range_type',
                        className: 'timerangepicker-range-type',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        popdownOptions: {attachDialogTo: this.options.appendSelectDropdownsTo},
                        save: false
                    });

                    this.children.rangePicker = new RangePicker({
                        model: this.model,
                        canSetTime: this.canSetTime
                    });

                    this.activate();
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
                    this.model.earliestDateInput.clear({setDefaults: true});
                    this.model.latestDateInput.clear({setDefaults: true});
                    this.model.rangeSelector.clear();

                    return this;
                },
                startListening: function() {
                    this.listenTo(this.model.timeRange, 'change:earliest change:latest prepopulate', _.debounce(function(){
                        this.syncInternals();
                        this.prepopulateRangeType();
                        this.prepopulateDates();
                    }.bind(this), 0));

                    this.listenTo(this.model.rangeSelector, 'change:range_type', function() {
                        this.model.earliestDateInput.clear({setDefaults: true, silent:true});
                        this.model.latestDateInput.clear({setDefaults: true, silent:true});
                        this.syncInternals();
                        this.prepopulateDates();
                    });

                    this.listenTo(this.model.earliestDateInput, "validated:invalid", function() {
                        this.earliest_errored = true;
                        this.disableApply();
                    });

                    this.listenTo(this.model.earliestDateInput, "validated:valid", function() {
                        this.earliest_errored = false;
                        if (!this.earliest_errored && !this.latest_errored) {
                            this.enableApply();
                        }
                    });

                    this.listenTo(this.model.latestDateInput, "validated:invalid", function() {
                        this.latest_errored = true;
                        this.disableApply();
                    });

                    this.listenTo(this.model.latestDateInput, "validated:valid", function() {
                        this.latest_errored = false;
                        if (!this.earliest_errored && !this.latest_errored) {
                            this.enableApply();
                        }
                    });

                    this.listenTo(this.model.earliestDateInput, "change", function(){
                        this.model.workingRange.trigger("validated", true, this.model.workingRange, {});
                        this.model.workingRange.trigger("serverValidated", true, this.model.workingRange, []);
                    });

                    this.listenTo(this.model.latestDateInput, "change", function(){
                        this.model.workingRange.trigger("validated", true, this.model.workingRange, {});
                        this.model.workingRange.trigger("serverValidated", true, this.model.workingRange, []);
                    });
                },
                events: {
                    "click .apply": function(e) {
                        e.preventDefault();
                        if ($(e.currentTarget).hasClass("disabled")) {
                            return;
                        }

                        var rangeType = this.model.rangeSelector.get('range_type'),
                            earliestIsoWithoutTZ = "",
                            latestIsoWithoutTZ = "now";

                        if (rangeType === 'before_date') {
                            if (!this.canSetTime) {
                                this.model.latestDateInput.setHoursMinSecFromStr("00:00:00.000", {silent:true, validate: true});
                            }
                            latestIsoWithoutTZ = this.model.latestDateInput.isoWithoutTZ();
                        } else if (rangeType === 'after_date') {
                            if (!this.canSetTime) {
                                this.model.earliestDateInput.setHoursMinSecFromStr("00:00:00.000", {silent:true, validate: true});
                            }
                            earliestIsoWithoutTZ = this.model.earliestDateInput.isoWithoutTZ();
                        } else {
                            if (!this.canSetTime) {
                                this.model.earliestDateInput.setHoursMinSecFromStr("00:00:00.000", {silent:true, validate: true});
                                this.model.latestDateInput.setHoursMinSecFromStr("24:00:00.000", {silent:true, validate: true});
                            }
                            earliestIsoWithoutTZ = this.model.earliestDateInput.isoWithoutTZ();
                            latestIsoWithoutTZ = this.model.latestDateInput.isoWithoutTZ();
                        }

                        this.disableApply();

                        this.model.workingRange.save(
                                {
                                    earliest: earliestIsoWithoutTZ,
                                    latest: latestIsoWithoutTZ
                                },
                                {
                                    success: function(model) {
                                        var timeRangeSettings = {
                                            'earliest': model.get('earliest_epoch'),
                                            'latest': model.get('latest_epoch'),
                                            'earliest_epoch': model.get('earliest_epoch'),
                                            'latest_epoch': model.get('latest_epoch'),
                                            'earliest_iso': model.get('earliest_iso'),
                                            'latest_iso': model.get('latest_iso'),
                                            'latest_date': new Date(model.get('latest_date').getTime())
                                        };

                                        if (rangeType === 'before_date') {
                                            timeRangeSettings['earliest'] = "";
                                            timeRangeSettings['earliest_date'] = new Date(0);
                                        } else if (rangeType === 'after_date') {
                                            timeRangeSettings['latest'] = 'now';
                                            timeRangeSettings['earliest_date'] = new Date(model.get('earliest_date').getTime());
                                        } else {
                                            //Between
                                            timeRangeSettings['earliest_date'] = new Date(model.get('earliest_date').getTime());
                                        }
                                        this.enableApply();
                                        this.model.timeRange.set(timeRangeSettings);
                                        this.model.timeRange.trigger("applied");
                                    }.bind(this),
                                    error: function(model, error) {
                                        this.enableApply();
                                        //Do we need this?
                                        this.model.latestDateInput.setHoursMinSecFromStr("00:00:00.000", {silent:true, validate: true});
                                    }.bind(this),
                                    //Do we need this?
                                    invalid: function() {
                                        this.model.latestDateInput.setHoursMinSecFromStr("00:00:00.000", {silent:true, validate: true});
                                    }.bind(this)
                                }
                        );
                    }
                },
                syncInternals: function() {
                    var yesterday = new Date(),
                        today = new Date();

                    yesterday.setDate(yesterday.getDate() - 1);
                    if (this.canSetTime) {
                        yesterday.setHours(12, 0, 0, 0);
                    } else {
                        yesterday.setHours(0, 0, 0, 0);
                    }
                    this.model.earliestDateInput.setFromJSDate(yesterday, {validate:true});

                    if (this.canSetTime) {
                        today.setHours(12, 0, 0, 0);
                    } else {
                        today.setHours(0, 0, 0, 0);
                    }
                    this.model.latestDateInput.setFromJSDate(today, {validate: true});
                },
                prepopulateRangeType: function() {
                    var earliestIsAbsolute = this.model.timeRange.isAbsolute('earliest'),
                        hasNoEarliest = this.model.timeRange.hasNoEarliest(),
                        latestIsAbsolute =  this.model.timeRange.isAbsolute('latest');

                    if (!hasNoEarliest && earliestIsAbsolute && latestIsAbsolute) {
                        this.model.rangeSelector.set('range_type', 'between_dates');
                    } else if (hasNoEarliest && latestIsAbsolute) {
                        this.model.rangeSelector.set('range_type', 'before_date');
                    } else if (earliestIsAbsolute && this.model.timeRange.latestIsNow()) {
                        this.model.rangeSelector.set('range_type', 'after_date');
                    }

                },
                prepopulateDates: function() {
                    var earliest = this.model.timeRange.get('earliest_date');

                    if (!this.model.timeRange.hasNoEarliest() && earliest) {
                        this.model.earliestDateInput.setFromJSDate(earliest, {validate: true});
                    }

                    var latest = this.model.timeRange.get('latest_date');
                    if (latest) {
                        var latestDate= new Date(latest.getTime());

                        //Only for between range
                        if (!this.canSetTime && this.model.rangeSelector.get('range_type') === 'between_dates' && latestDate.getHours() == 0) {
                            latestDate.setDate((latestDate.getDate() - 1), {validate: true});
                        }
                        this.model.latestDateInput.setFromJSDate(latestDate, {validate: true});
                    }
                },
                enableApply: function() {
                    this.$(".apply").removeClass('disabled');
                },
                disableApply: function() {
                    this.$(".apply").addClass('disabled');
                },
                supportsRange: function() {
                    var hasNoEarliest = this.model.timeRange.hasNoEarliest(),
                        latestIsNow = this.model.timeRange.latestIsNow(),
                        earliestIsWholeDay = this.model.timeRange.isWholeDay('earliest'),
                        latestIsWholeDay = this.model.timeRange.isWholeDay('latest');
                    if (this.canSetTime) {
                        var earliestIsAbsolute = !hasNoEarliest && this.model.timeRange.isAbsolute('earliest'),
                            latestIsAbsolute = !latestIsNow && this.model.timeRange.isAbsolute('latest');

                        return !(earliestIsWholeDay && latestIsWholeDay) // both earliest and latest must be whole days
                                && ((earliestIsAbsolute && latestIsAbsolute) //between date time range
                                    || ((earliestIsAbsolute && !earliestIsWholeDay) && latestIsNow) //since date time range
                                    || (hasNoEarliest && (latestIsAbsolute && !latestIsWholeDay))); //before date time range
                    } else {
                        return (earliestIsWholeDay && latestIsWholeDay) //between date range
                                || (earliestIsWholeDay && latestIsNow) //since date range
                                || (hasNoEarliest && latestIsWholeDay); //before date range
                    }
                },
                render: function() {
                    this.$el.append(this.children.flashMessages.render().el);
                    this.$el.append(this.children.rangeTypeSelect.render().el);

                    var template = this.compiledTemplate({
                        _:_
                    });
                    this.$el.append(template);

                    this.children.rangePicker.render().prependTo(this.$('.date-range-container'));
                    return this;
                },
                template: '\
                    <div class="form form-inline date-range-container">\
                        <button class="apply btn"><%- _("Apply").t() %></button>\
                    </div>\
                '
        });
    }
);
