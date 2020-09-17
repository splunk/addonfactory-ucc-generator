define(['jquery',
        'underscore', 
        'backbone',
        'views/Base', 
        'module', 
        'models/shared/Cron',
        'models/shared/TimeRange',
        'util/time',
        'util/string_utils',
        'splunk.i18n',
        'splunk.util'
        ], function($, _, Backbone, BaseView, module, Cron, TimeRange, timeUtil, stringUtil, i18n, splunkUtil) {
    return BaseView.extend({
        /**
         * @param {Object} options {
         *      model: {
         *          report: <models.search.Report>,
         *          searchJob: <models.search.Job>
         *      },
         *      collection: {
         *          times: <collections.services.data.ui.TimesV2>
         *       }
         * }
         */
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.timeRange = new TimeRange();
            this.timeRangeDeferred = $.Deferred();
        },

        activate: function(options) {
            this.timeRangeDeferred = this.model.timeRange.save({
                'earliest': this.model.report.entry.content.get('dispatch.earliest_time'),
                'latest': this.model.report.entry.content.get('dispatch.latest_time')
            });

            this.render();

            return BaseView.prototype.activate.call(this, options);
        },

        startListening: function() {
            this.listenTo(this.model.report.entry.content, 'change:cron_schedule change:is_scheduled', this.debouncedRender);
        },

        getScheduleInfo: function() {
            if (this.model.report.entry.content.get('is_scheduled')) {
                var cronModel = Cron.createFromCronString(this.model.report.entry.content.get('cron_schedule'));
                switch(cronModel.get('cronType')) {
                    case 'hourly':
                        return splunkUtil.sprintf(_("This scheduled report runs hourly, at %s minutes past the hour.").t(), cronModel.get('minute'));
                    case 'daily':
                        return splunkUtil.sprintf(_("This scheduled report runs daily, at %s:00.").t(), cronModel.get('hour'));
                    case 'weekly':
                        return splunkUtil.sprintf(_("This scheduled report runs weekly, %s at %s:00.").t(),
                                cronModel.getDayOfWeekName(),
                                cronModel.get('hour'));
                    case 'monthly':
                        return splunkUtil.sprintf(_("This scheduled report runs monthly, on day %s at %s:00.").t(),
                                cronModel.get('dayOfMonth'),
                                cronModel.get('hour'));
                    case 'custom':
                        return splunkUtil.sprintf(_("This scheduled report runs on cron schedule %s.").t(), cronModel.getCronString());
                }
            }
        },

        getTimeRangeInfo: function() {
            var earliestDate = this.model.timeRange.get('earliest_date'),
                latestDate = this.model.timeRange.get('latest_date'),
                earliestIsAbsolute =  !this.model.timeRange.hasNoEarliest() && this.model.timeRange.isAbsolute('earliest'),
                earliestIsWholeDay = this.model.timeRange.isWholeDay('earliest'),
                latestIsNow = this.model.timeRange.latestIsNow(),
                latestIsAbsolute = !latestIsNow && this.model.timeRange.isAbsolute('latest'),
                latestIsWholeDay = this.model.timeRange.isWholeDay('latest');

            //Check if earliest and latest are absolute
            if (earliestIsAbsolute && latestIsAbsolute && (!earliestIsWholeDay || !latestIsWholeDay)) {
                return splunkUtil.sprintf(_("Its time range is from %s through %s.").t(), i18n.format_datetime(earliestDate), i18n.format_datetime(latestDate));
            } else if (this.model.timeRange.hasNoEarliest() && latestIsAbsolute && !latestIsWholeDay) {
                return splunkUtil.sprintf(_("Its time range is before %s.").t(), i18n.format_datetime(latestDate));
            } else if (earliestIsAbsolute && !earliestIsWholeDay && latestIsNow) {
                return splunkUtil.sprintf(_("Its time range is since %s.").t(), i18n.format_datetime(earliestDate));
            } else {
                return splunkUtil.sprintf(_("Its time range is %s.").t(),
                    stringUtil.firstToLower(this.model.timeRange.generateLabel(this.collection.times))
                );
            }
        },

        getJobPublishedInfo: function() {
            if (!this.model.searchJob.isNew()) {
                var jobPublishedTime = (new Date(this.model.searchJob.entry.get('published'))).getTime() / 1000;
                return splunkUtil.sprintf(_("The following results were generated %s.").t(), timeUtil.convertToRelativeTime(jobPublishedTime));
            }
        },

        render: function() {
            $.when(this.timeRangeDeferred).then(function() {
                this.$el.html(this.compiledTemplate({
                    scheduleInfo: this.getScheduleInfo(),
                    timeRangeInfo: this.getTimeRangeInfo(),
                    jobPublishedInfo: this.getJobPublishedInfo()
                }));
            }.bind(this));
            
            return this;
        },

        template: '\
            <i class="icon-clock"></i><%- scheduleInfo%> <%- timeRangeInfo%> <%- jobPublishedInfo%>\
        '
    });
});