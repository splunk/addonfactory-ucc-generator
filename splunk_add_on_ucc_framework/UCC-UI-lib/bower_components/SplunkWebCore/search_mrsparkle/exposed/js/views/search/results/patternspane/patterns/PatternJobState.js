define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/ProgressBar',
        'models/services/search/Job',
        'uri/route',
        'splunk.util',
        'splunk.i18n',
        'splunk.window'
    ],
    function($, _, module, Base, ProgressBar, SearchJob, route, splunkUtil, i18n, splunkWindow){
        return Base.extend({
            moduleId: module.id,
            className: 'pattern-count',
            initialize: function() {
                this.children.progressBar = new ProgressBar({
                    model: this.model.patternJob
                });

                return Base.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.patternJob, 'jobProgress', this.render);
                this.listenTo(this.model.patternJob.entry.content, 'change:dispatchState', this.render);
                this.listenTo(this.model.patternData, 'sync', this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                this.message = '';
                this.render();

                return Base.prototype.activate.apply(this, arguments);
            },
            events: {
                'click .cancel': function(e) {
                    e.preventDefault();
                    this.model.patternJob.handleJobDestroy();
                    this.model.patternJob.entry.content.set('dispatchState', 'CANCELED');
                },
                'click .inspect': function(e) {
                    e.preventDefault();
                    splunkWindow.open(
                        route.jobInspector(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), this.model.patternJob.id),
                        'splunk_job_inspector',
                        {
                            width: 870, 
                            height: 560,
                            menubar: false
                        }
                    );
                },
                'click .restart': function(e) {
                    e.preventDefault();
                    this.model.patternJob.trigger('restart');
                }
            },
            update: function() {
                var dispatchState = this.model.patternJob.entry.content.get('dispatchState'),
                    resultPreviewCount = this.model.patternJob.entry.content.get('resultPreviewCount'),
                    resultsCount = this.model.patternData.results.length;
                
                if (this.model.patternJob.isNew()) {
                    this.message = _('Pattern job is starting...').t();
                    return;
                }
                
                if (this.model.patternJob.isFailed()) {
                    this.message = splunkUtil.sprintf(_('Pattern job failed. %s').t(), '<a href="#" class="inspect" title="' + _("Inspect").t() + '">' + _("Inspect").t() + '</a>');
                    return;
                }
                
                if (dispatchState === SearchJob.QUEUED) {
                    this.message = splunkUtil.sprintf(_('Pattern job is queued... %s').t(), '<a href="#" class="cancel" title="' + _("Cancel").t() + '">' + _("Cancel").t() + '</a>');
                    return;
                }
                
                if (dispatchState === SearchJob.PARSING) {
                    this.message = splunkUtil.sprintf(_('Pattern job is parsing... %s').t(), '<a href="#" class="cancel" title="' + _("Cancel").t() + '">' + _("Cancel").t() + '</a>');
                    return;
                }
                 
                if (dispatchState === SearchJob.RUNNING) {
                    if (resultPreviewCount == 0) {
                        this.message = splunkUtil.sprintf(_('Pattern job is finding patterns... %s').t(), '<a href="#" class="cancel" title="' + _("Cancel").t() + '">' + _("Cancel").t() + '</a>');
                        return;
                    }
                }
                 
                if (dispatchState === SearchJob.FINALIZING) {
                    this.message = splunkUtil.sprintf(_('Pattern job is finalizing... %s').t(), '<a href="#" class="cancel" title="' + _("Cancel").t() + '">' + _("Cancel").t() + '</a>');
                    return;
                }
                 
                if (dispatchState === SearchJob.DONE) {
                    if (resultsCount === 0) {
                        this.message = splunkUtil.sprintf(_('Pattern job found no patterns. %s').t(), '<a href="#" class="restart" title="' + _("Restart").t() + '">' + _("Restart").t() + '</a>');
                        return;
                    }
                }
                
                if (dispatchState === SearchJob.CANCELED) {
                    this.message = splunkUtil.sprintf(_('Pattern job was cancelled. %s').t(), '<a href="#" class="restart" title="' + _("Restart").t() + '">' + _("Restart").t() + '</a>');
                    return;
                }
                
                this.message = '';
            },
            render: function() {
                var resultsCount = this.model.patternData.results.length,
                    totalEvents;
                this.update();
                
                if (resultsCount) {
                    totalEvents = this.model.patternData.results.at(0).getTotalEvents();
                }
                
                this.$el.html(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil,
                    i18n: i18n,
                    resultsCount: resultsCount,
                    totalEvents: totalEvents,
                    showDispatchState: !!this.message || !resultsCount,
                    message: this.message
                }));

                this.children.progressBar.render().appendTo(this.$el);
            },
            template: '\
                <% if (showDispatchState) { %>\
                    <div><%= message %></div>\
                <% } else { %>\
                    <div>\
                        <%\
                            var patterns = splunkUtil.sprintf(i18n.ungettext("%s pattern", "%s patterns", resultsCount), i18n.format_decimal(resultsCount)),\
                                total = splunkUtil.sprintf(i18n.ungettext("%s event", "%s events", totalEvents), i18n.format_decimal(totalEvents));\
                        %>\
                        <%- splunkUtil.sprintf(_("%s based on a sample of %s").t(), patterns, total) %>\
                    </div>\
                <% } %>\
            '
        });
    }
);