define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'collections/shared/FlashMessages',
        'views/Base',
        'views/search/results/eventspane/fieldsviewer/Master',
        'views/shared/eventsviewerdrilldown/LazyEventsViewerDrilldown',
        'views/search/results/eventspane/controls/Master',
        'views/shared/LazyCanvasTimeline',
        'views/shared/controls/ControlGroup',
        'views/search/results/eventspane/VerboseWarning',
        'views/search/results/shared/JobDispatchStateMessage',
        'views/shared/FlashMessagesLegacy',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
            $,
            _,
            module,
            BaseModel,
            FlashMessagesCollection,
            Base,
            FieldsViewer,
            LazyEventsViewerDrilldown,
            EventControls,
            LazyTimeline,
            ControlGroup,
            VerboseWarning,
            JobDispatchState,
            FlashMessagesView,
            splunkd_utils,
            splunkUtil
    ){
        return Base.extend({
            moduleId: module.id,
            className: 'tab-pane events-fields-container',
            /**
             * @param {Object} options {
             *     model: {
             *         event: <models.services.search.job.ResultsV2>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         timeline: <model.services.search.job.TimelineV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>,
             *     }
             *     collection: {
             *         selectedFields: <collections.SelectedFields>,
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     }
             * }
             */
            initialize: function(){
                Base.prototype.initialize.apply(this, arguments);

                //models
                this.model.state = new BaseModel();
                
                this.collection.flashMessages = new FlashMessagesCollection();
                
                this.children.timelineState = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });
                
                //views
                this.children.timeline = new LazyTimeline({
                    className: 'timeline-container',
                    model: {
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.eventControls = new EventControls({
                     model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        timeline: this.model.timeline,
                        state: this.model.state
                    }
                });

                this.children.fieldsViewer = new FieldsViewer({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        summary: this.model.summary,	
                        state: this.model.state
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    }
                });

                this.children.eventsViewer = new LazyEventsViewerDrilldown({
                    model: {
                        result: this.model.result,
                        summary: this.model.summary,
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        state: this.model.state
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    scrollToTopOnPagination: true,
                    headerOffset: 36 // default EventControls' height in pixels
                });
                
                this.children.jobDispatchState = new JobDispatchState({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    mode: 'events'
                });
                
                this.children.verboseWarning = new VerboseWarning({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob
                    }
                });
            },
            startListening: function() {
                  this.listenTo(this.model.state, 'change:isModalized', function() {
                      // Modalizing stops visibility() from being called in order to preserve the events list,
                      // so when we unmodalize, re-trigger visibility() (SPL-91830)
                      if (!this.model.state.get('isModalized')) {
                          this.visibility();
                      }
                  });
                  this.listenTo(this.model.state, 'change:fieldpicker', function() {
                      if (this.model.state.get('fieldpicker')){
                          this.children.eventsViewer.deactivate({deep: true});
                          this.children.timeline.deactivate({deep: true});
                      } else {
                          this.children.eventsViewer.load().activate({deep: true});
                          if (!this.children.timeline.active){
                              this.children.timeline.activate({deep: true}); 
                          }
                          this.children.timeline.render();
                      }
                  });
                  this.listenTo(this.model.report.entry.content, 'change:display.events.timelineEarliestTime change:display.events.timelineLatestTime', _.debounce(function() {
                      var tl_et = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                          tl_lt = this.model.report.entry.content.get('display.events.timelineLatestTime');
                  
                      if (!(!!(tl_et && tl_lt))){
                          this.children.timelineState.$el.hide();
                          if (this.active) {
                              this.visibility();
                          }
                      }
                  }, 0));
                  this.listenTo(this.model.timeline.buckets, 'reset', function() {
                      var tl_et = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                          tl_lt = this.model.report.entry.content.get('display.events.timelineLatestTime');
                  
                      if (!!(tl_et && tl_lt) && (this.model.timeline.availableCount(tl_et, tl_lt).length === 0)){
                          _.chain(this.children).omit(['timeline']).each(function(child) {
                              child.$el.hide();
                          }); 
                          this.children.timelineState.$el.show();
                          
                          this.collection.flashMessages.reset([{
                              key: 'waiting',
                              type: 'info',
                              html: _('No results in current time range.').t()
                          }]);
                      } else {
                          this.collection.flashMessages.reset();
                          this.children.timelineState.$el.hide();
                          this.visibility();
                      }
                  });
                  this.listenTo(this.model.report.entry.content, 'change:display.page.search.showFields', this.visibility);
                  this.listenTo(this.model.searchJob.entry.content, 'change:eventCount change:dispatchState', _.debounce(function() {
                      if (this.active && !this.model.state.get('isModalized')) {
                          this.visibility();
                      }
                  }, 0));
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                this.ensureDeactivated({deep:true});
                Base.prototype.activate.call(this, clonedOptions);
                var tl_et = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                    tl_lt = this.model.report.entry.content.get('display.events.timelineLatestTime');
                
                if (!(!!(tl_et && tl_lt))) {
                    $.when(this.children.timeline.wrappedViewLoaded()).then(function() {
                        this.children.timeline.wrappedView.clearSelectionRange(); 
                    }.bind(this));
                    this.collection.flashMessages.reset();
                }
                
                this.visibility();
                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                
                Base.prototype.deactivate.apply(this, arguments);
                this.model.state.clear();
                return this;
            },
            visibility: function(activation) {
                this.children.timelineState.activate({deep: true}).render();

                if (this.model.searchJob.entry.content.get('eventCount') === 0) {
                    this.children.verboseWarning.deactivate({deep: true}).$el.hide();
                    this.children.fieldsViewer.deactivate({deep: true}).$el.hide();
                    this.children.eventControls.deactivate({deep: true}).$el.hide();
                    this.children.timeline.deactivate({deep: true}).hide();
                    this.children.eventsViewer.deactivate({deep: true}).$el.hide();
                    this.children.jobDispatchState.activate({deep: true}).$el.show();
                } else {
                    if (this.model.searchJob.entry.content.get('eventAvailableCount') === 0) {
                        this.children.fieldsViewer.deactivate({deep: true}).$el.hide();
                        this.children.eventControls.deactivate({deep: true}).$el.hide();
                        this.children.timeline.deactivate({deep: true}).hide();
                        this.children.eventsViewer.deactivate({deep: true}).$el.hide();
                        if (this.model.searchJob.isReportSearch() && (this.model.searchJob.getAdhocSearchMode() !== splunkd_utils.VERBOSE)) {
                            this.children.verboseWarning.activate({deep: true}).render().$el.show();
                            this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                        } else {
                            this.children.verboseWarning.deactivate({deep: true}).$el.hide();
                            this.children.jobDispatchState.activate({deep: true}).$el.show();
                        }
                    } else {
                        this.children.verboseWarning.deactivate({deep: true}).$el.hide();
                        this.children.eventControls.activate({deep: true}).$el.show();
                        this.children.eventsViewer.load().activate({deep: true}).$el.show();
                        this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                        if (this.model.searchJob.entry.content.get('statusBuckets') > 0) {
                            this.children.timeline.load().activate({deep: true}).render().show();
                            if (splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.page.search.showFields'))) {
                                this.$el.addClass('show-fields');
                                this.children.fieldsViewer.activate({deep: true}).$el.show();
                            } else {
                                this.$el.removeClass('show-fields');
                                this.children.fieldsViewer.deactivate({deep: true}).$el.hide();
                            }
                        } else {
                            this.children.timeline.deactivate({deep: true}).hide();
                            this.$el.removeClass('show-fields');
                            this.children.fieldsViewer.deactivate({deep: true}).$el.hide();
                        }
                    }
                }
            },
            render: function() {
                this.children.timeline.render().appendTo(this.$el);
                this.children.timelineState.render().appendTo(this.$el);
                this.children.jobDispatchState.render().appendTo(this.$el);
                this.children.verboseWarning.render().appendTo(this.$el);
                this.children.eventControls.render().appendTo(this.$el);
                this.$el.append('<div class="search-results-wrapper"></div>');
                this.children.fieldsViewer.render().appendTo(this.$('.search-results-wrapper'));
                this.children.eventsViewer.render().appendTo(this.$('.search-results-wrapper'));
                return this;
            }
        });
    }
);
