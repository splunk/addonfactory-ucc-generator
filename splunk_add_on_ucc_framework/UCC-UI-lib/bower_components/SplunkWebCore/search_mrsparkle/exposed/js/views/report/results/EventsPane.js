define([
        'underscore',
        'backbone',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/JobDispatchState',
        'views/report/tablecontrols/Master',
        'views/shared/eventsviewerdrilldown/LazyEventsViewerDrilldown',
        'util/splunkd_utils',
        'uri/route'
    ],
    function(
        _,
        Backbone,
        module,
        BaseModel,
        Base,
        JobDispatchState,
        TableControls,
        LazyEventsViewerDrilldown,
        splunkd_utils,
        route
    ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.model.state = new BaseModel();
                
                this.children.eventControls = new TableControls({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        state: this.model.state
                    },
                    mode: 'events',
                    offsetKey: "display.prefs.events.offset",
                    countKey: "display.prefs.events.count"
                });
                
                this.children.eventsViewer = new LazyEventsViewerDrilldown({
                    model: {
                        result: this.model.result,
                        summary: this.model.summary,
                        searchJob: this.model.searchJob,
                        report: this.model.eventsViewerReport,
                        application: this.model.application,
                        state: this.model.state
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    setLocation: true,
                    selectableFields: false,
                    headerMode: 'dock',
                    headerOffset: 36 // default TableControlsView's height in pixels
                });

                this.children.jobDispatchState = new JobDispatchState({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    mode: 'events'
                });
            },
            startListening: function() {
                //eventViewer field selection
                this.listenTo(this.model.eventsViewerReport, 'eventsviewer:drilldown', function(){
                    var routeString = route.search(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            {data: {
                                earliest: this.model.eventsViewerReport.entry.content.get('dispatch.earliest_time'),
                                latest: this.model.eventsViewerReport.entry.content.get('dispatch.latest_time'),
                                q: this.model.eventsViewerReport.entry.content.get('search')
                            }}
                        );
                    window.location = routeString;
                });
                
                //eventViewer field selection
                this.listenTo(this.model.searchJob.entry.content, 'change:eventCount change:dispatchState', _.debounce(function() {
                    if (this.active) {
                        this.visibility();
                    }
                }, 0));
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                this.ensureDeactivated({deep:true});
                Base.prototype.activate.call(this, clonedOptions);
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
            visibility: function() {
               if (this.model.searchJob.entry.content.get('eventCount') === 0) {
                    this.children.eventControls.deactivate({deep: true}).$el.hide();
                    this.children.eventsViewer.deactivate({deep: true}).$el.hide();
                    this.children.jobDispatchState.activate({deep: true}).$el.show();
                } else {
                    if (this.model.searchJob.entry.content.get('eventAvailableCount') === 0) {
                        this.children.eventControls.deactivate({deep: true}).$el.hide();
                        this.children.eventsViewer.deactivate({deep: true}).$el.hide();
                        this.children.jobDispatchState.activate({deep: true}).$el.show();
                    } else {
                        this.children.eventControls.activate({deep: true}).$el.show();
                        this.children.eventsViewer.load().activate({deep: true}).$el.show();
                        this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                    }
                }
            },
            render: function() {
                if (!this.innerHTML) {
                    this.children.jobDispatchState.render().appendTo(this.$el);
                    this.children.eventControls.render().appendTo(this.$el);
                    this.children.eventsViewer.render().appendTo(this.$el);
                }
                return this;
            }
        });
    }
);
