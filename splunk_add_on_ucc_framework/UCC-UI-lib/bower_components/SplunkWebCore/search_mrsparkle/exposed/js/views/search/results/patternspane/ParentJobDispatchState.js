define(
    [
        'underscore',
        'module',
        'models/search/Job',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'util/splunkd_utils',
        'splunk.util',
        'splunk.i18n'
    ],
    function(_, module, SearchJobModel, FlashMessagesCollection, FlashMessagesLegacyView, splunkd_utils, splunkUtil, i18n) {
        return FlashMessagesLegacyView.extend({
            moduleId: module.id,
            className: 'message-single',
            /**
             * @param {Object} options {
             *     model: { searchJob: <models.Job>},
             *     mode: <events|results|results_preview|auto> Defaults to events.
             * }
             */
            initialize: function() {
                this.collection = new FlashMessagesCollection();
                this.options.escape = false;
                FlashMessagesLegacyView.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                FlashMessagesLegacyView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.searchJob.entry.content, 'change:dispatchState', this.update);
            },
            activate: function(options) {
                this.ensureDeactivated({deep: true});
                
                FlashMessagesLegacyView.prototype.activate.apply(this, arguments);
                this.update();
                return this;
            },
            events: {
                'click a': function(e) {
                    e.preventDefault();
                    this.model.report.entry.content.set('display.page.search.mode', splunkd_utils.VERBOSE);
                }
            },
            update: function() {
                var dispatchState = this.model.searchJob.entry.content.get('dispatchState'),
                    eventCount = this.model.searchJob.entry.content.get('eventCount'),
                    uneventful = this.model.searchJob.isUneventfulReportSearch(),
                    template;
                
                if (this.model.searchJob.isRealtime()) {
                    this.collection.reset([{
                        type: 'error',
                        html: _('Real-time searches cannot be patterned.').t()
                    }]);
                    return;
                }

                if (dispatchState === SearchJobModel.PARSING || dispatchState === SearchJobModel.QUEUED) {
                    this.collection.reset([{
                        type: 'warning',
                        html: _('Waiting for search to find events...').t()
                    }]);
                    return;
                }
                
                if (uneventful) {
                    template = _.template(this.reportingTemplate, {
                        _: _,
                        adhocSearchLevel: this.model.searchJob.getAdhocSearchMode(),
                        isEventSearch: this.model.searchJob.isEventSearch(),
                        splunkd_utils: splunkd_utils
                    });
                    
                    this.collection.reset([{
                        type: 'warning',
                        html: template
                    }]);
                    return;
                }

                if (dispatchState === SearchJobModel.RUNNING) {
                    if (eventCount && (eventCount < 10000)) {
                        this.collection.reset([{
                            type: 'info',
                            html: splunkUtil.sprintf(_('Waiting for first %s events...').t(), i18n.format_decimal(10000))
                        }]);
                    } else {
                        this.collection.reset([{
                            type: 'warning',
                            html: _('Waiting for search to find events...').t()
                        }]);
                    }
                    return;
                }

                if (dispatchState === SearchJobModel.DONE) {
                    if (eventCount == 0)  {
                        var noEventsMsg = this.model.searchJob.isOverAllTime() || this.model.searchJob.isUneventfulReportSearch() ?
                            _('No results found.').t() :
                            _('No results found. Try expanding the time range.').t();
                        this.collection.reset([{
                            type: 'error',
                            html: noEventsMsg
                        }]);
                    }
                    return;
                }
                
                this.collection.reset();
            },
            reportingTemplate: '\
                <% if (!isEventSearch) { %> \
                    <%- _("Your search did not return any patterns because your search did not return any events.").t() %>\
                <% } else { %>\
                    <% if (adhocSearchLevel == splunkd_utils.FAST) { %>\
                        <%- _("Your search did not return any patterns because you are in the Fast Mode.").t() %>\
                    <% } else if (adhocSearchLevel==splunkd_utils.SMART) { %>\
                        <%- _("Your search did not return any patterns because you are in the Smart Mode.").t() %>\
                    <% } %>\
                    <%= _(\'<a href="#">Search in the Verbose Mode</a> to see the patterns.\').t() %>\
                <% } %>\
            '
        });
    }
);