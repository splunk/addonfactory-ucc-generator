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
            this.listenTo(this.model.searchPointJob, 'jobProgress prepared sync', this.render);
            this.listenTo(this.model.searchPointJob, 'destroy', this.empty);

            if (this.model.currentPointJob) {
                this.listenTo(this.model.currentPointJob, 'jobProgress prepared sync', this.render);
                this.listenTo(this.model.currentPointJob, 'destroy', this.empty);
            }
            
            this.listenTo(this.model.resultJsonRows, "change", this.render);
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
            var progress = this.options.isViewingMode ? _("Starting search job...").t() : _("Starting search point job...").t(),
                currentPointIsNew = !!this.model.currentPointJob && this.model.currentPointJob.isNew(),
                isEvents = true,
                modelToRender, eventCount;
            
            // If the current point job has not yet started,
            // or the search point is the current point, then give info about the
            // search point job
            
            if (!this.model.currentPointJob || (this.model.searchPointJob.id === this.model.currentPointJob.id)) {
                currentPointIsNew = true;
            }
            
            if (currentPointIsNew || this.options.isViewingMode) {
                modelToRender = this.model.searchPointJob;
                
                if (this.model.searchPointJob.isDone()) {
                    if (this.options.isViewingMode) {
                        progress = _("Search job is complete.").t();
                    } else {
                        progress = _("Search point job is complete.").t();
                    }
                } else if (this.model.searchPointJob.isFinalizing()) {
                    if (this.options.isViewingMode) {
                        progress = _("Finalizing search job...").t();
                    } else {
                        progress = _("Finalizing search point job...").t();
                    }
                } else if (this.model.searchPointJob.isPaused()) {
                    if (this.options.isViewingMode) {
                        progress = _("Search job paused").t();
                    } else {
                        progress = _("Search point job paused").t();
                    }
                } else if (this.model.searchPointJob.isQueued()) {
                    if (this.options.isViewingMode) {
                        progress = _("Search job queued").t();
                    } else {
                        progress = _("Search point job queued").t();
                    }
                } else if (this.model.searchPointJob.isParsing()) {
                    if (this.options.isViewingMode) {
                        progress = _("Parsing search job...").t();
                    } else {
                        progress = _("Parsing search point job...").t();
                    }
                } else if (this.model.searchPointJob.isRunning()) {
                    if (this.options.isViewingMode) {
                        progress = _("Search job running").t();
                    } else {
                        progress = _("Search point job running").t();
                    }
                }
            } else {
                modelToRender = this.model.currentPointJob;
                
                if (this.model.currentPointJob.isDone()) {
                    progress = _("Current point job is complete.").t();
                } else if (this.model.currentPointJob.isFinalizing()) {
                    progress = _("Finalizing current point job...").t();
                } else if (this.model.currentPointJob.isPaused()) {
                    progress = _("Current point job paused").t();
                } else if (this.model.currentPointJob.isQueued()) {
                    progress = _("Current point job queued").t();
                } else if (this.model.currentPointJob.isParsing()) {
                    progress = _("Parsing current point job...").t();
                } else if (this.model.currentPointJob.isRunning()) {
                    progress = _("Current point job running").t();
                }
            }
            
            eventCount = modelToRender.entry.content.get("eventCount");
            
            if (eventCount === 0) {
                if (this.model.currentPointJob && this.model.currentPointJob.isReportSearch()) {
                    isEvents = false;
                    eventCount = this.model.currentPointJob.resultCountSafe();
                } else if (this.options.isViewingMode && modelToRender.entry.content.get("eventSearch") === '') {
                    isEvents = false;
                    eventCount = modelToRender.entry.content.get("resultCount");
                }
            }
            
            eventCount = i18n.format_decimal(eventCount || 0);

            var earliest_iso = this.model.searchPointJob.entry.content.get("earliestTime"),
                latest_iso = this.model.searchPointJob.latestTimeSafe(),
                template = this.compiledTemplate({
                    progress: progress,
                    // earliestTime is only safe to display if the job is not over all-time
                    earliest_date: this.model.searchPointJob.isOverAllTime() ? null : time_utils.isoToDateObject(earliest_iso),
                    latest_date: latest_iso ? time_utils.isoToDateObject(latest_iso) : new Date(0),
                    eventCount: eventCount,
                    isEvents: isEvents,
                    sampleRatio: this.model.searchPointJob.isUsingSampling() ? i18n.format_decimal(this.model.searchPointJob.entry.content.get('sampleRatio')) : null ,
                    model: modelToRender,
                    time_utils: time_utils,
                    i18n: i18n,
                    splunkUtil: splunkUtil,
                    _: _
                });
            this.$el.html(template);
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
