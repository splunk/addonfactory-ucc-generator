define(['underscore', 'module', 'views/search/results/shared/BaseTab', 'splunk.i18n'], function(_, module, BaseTab, i18n) {
    return BaseTab.extend({
        initialize: function(options){
            options = options || {};
            options.tab = 'events';
            options.type = 'events';
            BaseTab.prototype.initialize.call(this, options);
        },
        startListening: function() {
            this.listenTo(this.model.searchJob.entry.content, 'change:eventCount change:dispatchState', this.debouncedRender);
            this.listenTo(this.model.timeline.buckets, 'reset', this.render);
            BaseTab.prototype.startListening.apply(this, arguments);
        },
        render: function() {
            var length = this.model.searchJob.entry.content.get("eventCount") || 0,
                timelineEarliestTime = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                timelineLatestTime = this.model.report.entry.content.get('display.events.timelineLatestTime');
            
            if (this.model.searchJob.entry.content.get('statusBuckets')>0 && timelineEarliestTime && timelineLatestTime) {
                length = this.model.timeline.totalCount(timelineEarliestTime, timelineLatestTime);
            }
           
            this.$el.html(this.compiledTemplate({
                _: _,
                length: length,
                searchJob: this.model.searchJob,
                i18n: i18n
            }));
            this.toggleActive();
            return this;
        },
        template:'\
            <a href="#" data-tab="events" data-type="events">\
                <% if (searchJob.isNew() || searchJob.entry.content.get("statusBuckets") === 0) { %>\
                    <%- _("Events").t() %>\
                <% } else { %>\
                    <%- _("Events").t() %> (<%= i18n.format_decimal(length) %>)\
                <% } %>\
            </a>\
        '
    });
});
