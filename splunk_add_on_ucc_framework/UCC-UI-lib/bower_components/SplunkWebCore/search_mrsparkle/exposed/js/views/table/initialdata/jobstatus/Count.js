define(
    [
        'underscore',
        'module',
        'views/Base',
        'util/time',
        'splunk.i18n',
        'splunk.util'
    ],
    function(
        _,
        module,
        Base,
        time_utils,
        i18n,
        splunkUtil
    ) {
        return Base.extend({
            className: 'table-count',
            moduleId: module.id,

            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
            },

            startListening: function() {
                this.listenTo(this.model.searchJob, 'jobProgress prepared sync', this.render);
                this.listenTo(this.model.searchJob, 'destroy', this.empty);
                this.listenTo(this.model.resultJsonRows, 'change', this.render);
            },

            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                this.render();

                return Base.prototype.activate.apply(this, arguments);
            },

            empty: function() {
                this.$el.empty();
                return this;
            },

            render: function() {
                var progress = _("Starting search job...").t(),
                    isEvents = true,
                    eventCount = this.model.searchJob.entry.content.get('eventCount'),
                    earliest_iso = this.model.searchJob.entry.content.get('earliestTime'),
                    latest_iso = this.model.searchJob.latestTimeSafe();

                if (this.model.searchJob.isDone()) {
                    progress = _('Search job is complete.').t();
                } else if (this.model.searchJob.isFinalizing()) {
                    progress = _('Finalizing search job...').t();
                } else if (this.model.searchJob.isPaused()) {
                    progress = _('Search job paused').t();
                } else if (this.model.searchJob.isQueued()) {
                    progress = _('Search job queued').t();
                } else if (this.model.searchJob.isParsing()) {
                    progress = _('Parsing search job...').t();
                } else if (this.model.searchJob.isRunning()) {
                    progress = _('Search job running').t();
                }

                if ((eventCount === 0) && (this.model.searchJob.isReportSearch())) {
                    isEvents = false;
                    eventCount = this.model.searchJob.resultCountSafe();
                }

                eventCount = i18n.format_decimal(eventCount || 0);

                this.$el.html(this.compiledTemplate({
                    progress: progress,
                    // earliestTime is only safe to display if the job is not over all-time
                    earliest_date: this.model.searchJob.isOverAllTime() ? null : time_utils.isoToDateObject(earliest_iso),
                    latest_date: latest_iso ? time_utils.isoToDateObject(latest_iso) : new Date(0),
                    eventCount: eventCount,
                    isEvents: isEvents,
                    sampleRatio: this.model.searchJob.isUsingSampling() ? i18n.format_decimal(this.model.searchJob.entry.content.get('sampleRatio')) : null ,
                    model: this.model.searchJob,
                    time_utils: time_utils,
                    i18n: i18n,
                    splunkUtil: splunkUtil,
                    _: _
                }));
                this.$el.attr('data-job-state',  progress); // QA can use this attribute for automated testing

                return this;
            },

            template: '\
            <% if (!model.isNew()) { %>\
                <% if (model.isDone()) { %>\
                    <i class="icon-check"></i>\
                    <% if (isEvents) { %>\
                        <%= splunkUtil.sprintf(i18n.ungettext("%s event", "%s events", eventCount), \'<span class="number">\' + eventCount + \'</span>\') %>\
                    <% } else { %>\
                        <%= splunkUtil.sprintf(i18n.ungettext("%s result", "%s results", eventCount), \'<span class="number">\' + eventCount + \'</span>\') %>\
                    <% } %>\
                    <% if (model.entry.content.get("isFinalized")) { %>\
                        <% if (earliest_date) { %>\
                            <%- splunkUtil.sprintf(_("(Partial results for %s to %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(earliest_date)), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } else { %>\
                            <%- splunkUtil.sprintf(_("(Partial results for before %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } %>\
                    <% } else { %>\
                        <% if (earliest_date) { %>\
                            <%- splunkUtil.sprintf(_("(%s to %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(earliest_date)), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } else { %>\
                            <%- splunkUtil.sprintf(_("(before %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } %>\
                    <% } %>\
                    <% if (sampleRatio) { %>\
                        <span class="ratio"><%- splunkUtil.sprintf(_("Sampled at 1 : %s").t(), sampleRatio) %></span>\
                    <% } %>\
                <% } else { %>\
                    <%- progress %>\
                <% } %>\
            <% } %>\
        '
        });
    });
