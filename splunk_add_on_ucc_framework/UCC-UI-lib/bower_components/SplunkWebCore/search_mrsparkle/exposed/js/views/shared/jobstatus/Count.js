define(['underscore', 'module', 'views/Base', 'util/time', 'splunk.i18n', 'splunk.util'],function(_,module, Base, time_utils, i18n, splunkUtil) {
    return Base.extend({
        className: 'status',
        moduleId: module.id,
        initialize: function(options) {
           Base.prototype.initialize.apply(this, arguments);
            // TODO [JCS] This really should be passed into the model object. But this would break backwards compatibility
            // with other users of this control. Eventually this should get moved to this.model.resultsModel.
            this.resultsModel = options.resultsModel;
            this.activate({skipRender: true});
        },
        startListening: function() {
            this.listenTo(this.model, 'jobProgress prepared sync', this.render);
            this.listenTo(this.model, 'destroy', this.empty);

            if (this.resultsModel) {
                this.listenTo(this.resultsModel, "change", this.render);
            }
        },
        
        activate: function(options) {
            options = options || {};            
            
            if (this.active) {
                return Base.prototype.activate.apply(this, arguments);
            }
            
            if (!options.skipRender) {
                this.render();
            }
            
            return Base.prototype.activate.apply(this, arguments);
        },
        empty: function() {
            this.$el.empty();
            return this;
        },
        render: function() {
            if (this.canvasLoader) {
                this.canvasLoader.kill();
                this.canvasLoader = null;
            }
            
            var progress = _("Starting job...").t(),
                isRealTimeSearch = this.model.entry.content.get("isRealTimeSearch");
            
            if (this.model.isDone()) {
                progress = _("Complete").t();
            } else if (this.model.isFinalizing()) {
                progress = _("Finalizing job...").t();
            } else if (this.model.entry.content.get("isPaused")) {
                progress = _("Paused").t();
            } else if (isRealTimeSearch) {
                progress = _("Real-time").t();
            } else if (this.model.isQueued()) {
                progress = _("Queued").t();
            } else if (this.model.isParsing()) {
                progress = _("Parsing job...").t();
            } else if (this.model.isRunning()) {
                progress = _("Running").t();
            }

            var isEvents = true;

            var eventCount = this.model.entry.content.get("eventCount");

            if (this.resultsModel && !_(this.resultsModel.get("post_process_count")).isUndefined())
                eventCount = this.resultsModel.get("post_process_count");

            if (eventCount == 0 && this.model.entry.content.get("eventSearch") === '') {
                isEvents = false;
                eventCount = this.model.entry.content.get("resultCount");
            }

            eventCount = i18n.format_decimal(eventCount || 0);
            
            var loaderId = 'loader-' + this.cid,
                earliest_iso = this.model.entry.content.get("earliestTime"),
                latest_iso = this.model.latestTimeSafe(),
                template = this.compiledTemplate({
                    progress: progress,
                    // earliestTime is only safe to display if the job is not over all-time
                    earliest_date: this.model.isOverAllTime() ? null : time_utils.isoToDateObject(earliest_iso),
                    latest_date: latest_iso ? time_utils.isoToDateObject(latest_iso) : new Date(0),
                    eventCount: eventCount,
                    isEvents: isEvents,
                    scanCount: i18n.format_decimal(this.model.entry.content.get("scanCount") || 0),
                    model: this.model,
                    loaderId: loaderId,
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
                    <%if (model.entry.content.get("isFinalized")) { %>\
                        <% if(earliest_date) { %>\
                            <%- splunkUtil.sprintf(_("(Partial results for %s to %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(earliest_date)), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } else { %>\
                            <%- splunkUtil.sprintf(_("(Partial results for before %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } %>\
                    <% } else { %>\
                        <% if(earliest_date) { %>\
                            <%- splunkUtil.sprintf(_("(%s to %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(earliest_date)), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } else { %>\
                            <%- splunkUtil.sprintf(_("(before %s)").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                        <% } %>\
                    <% } %>\
                <% } else if (model.isRunning()) { %>\
                    <%= splunkUtil.sprintf(i18n.ungettext("%s of %s event matched", "%s of %s events matched", scanCount), \'<span class="number">\' + eventCount + \'</span>\', \'<span class="number">\' + scanCount + \'</span>\') %>\
                <% } else if (model.entry.content.get("isPaused")) { %>\
                    <i class="icon-warning icon-warning-paused"></i><%- _("Your search is paused.").t() %>\
                <% } else { %>\
                    <%- progress %>\
                <% } %>\
            <% } %>\
        '
    });
});
