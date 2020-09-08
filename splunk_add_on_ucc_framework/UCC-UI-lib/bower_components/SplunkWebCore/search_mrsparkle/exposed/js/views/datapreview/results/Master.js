define(
    [
        'underscore',
        'module',
        'models/Base',
        'collections/shared/FlashMessages',
        'views/Base',
        'views/shared/eventsviewer/Master',
        'views/search/results/eventspane/controls/Master',
        'views/shared/FlashMessagesLegacy'
    ],
    function(
        _,
        module,
        BaseModel,
        FlashMessagesCollection,
        BaseView,
        EventsViewer,
        EventControls,
        FlashMessagesView

    ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'search-results-wrapper',
            /**
             * @param {Object} options {
             *     collection: {
             *          sourcetypesCollection: <collections.services.saved.Sourcetypes>
             *     },
             *     model: {
             *         appLocal: <models.services.AppLocal>,
             *         user: <models.services.admin.User>
             *         application: <models.Application>,
             *         sourcetypeModel: <models.services.saved.Sourcetype>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.deferreds = this.options.deferreds;

                // models
                this.model.state = new BaseModel();
                // collections
                this.collection.flashMessages = new FlashMessagesCollection();

                // views
                this.children.eventsViewer = new EventsViewer({
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
                    headerMode: 'static',
                    selectableFields: false,
                    allowRowExpand: false,
                    showWarnings: true,
                    defaultDrilldown: false,
                    highlightExtractedTime: true,
                    allowModalize: false
                });

                this.children.eventControls = new EventControls({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        timeline: this.model.timeline,
                        state: this.model.state
                    },
                    disableDock: true,
                    showDrilldown: false
                });

                this.children.timelineState = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });
            },
            activate: function(options) {
                options || (options = {});
                delete options.deep;
                this.ensureDeactivated({deep:true});
                
                // From views/search/results/Master.js                
                this.model.searchJob.on("prepared", function(){
                    if (this.active) {
                        this.visibility();
                    }
                }, this);

                // From views/search/results/eventspane/Master.js
                this.model.report.entry.content.on('change:display.events.timelineEarliestTime change:display.events.timelineLatestTime', _.debounce(function() {
                    var tl_et = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        tl_lt = this.model.report.entry.content.get('display.events.timelineLatestTime');
                    
                    if(!(!!(tl_et && tl_lt))){
                        this.children.timelineState.$el.hide();
                        if (this.active) {
                            this.visibility();
                        }
                    }
                }.bind(this), 0), this);
                
                this.model.timeline.buckets.on('reset', function() {
                    var tl_et = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        tl_lt = this.model.report.entry.content.get('display.events.timelineLatestTime');
                    
                    if(!!(tl_et && tl_lt) && (this.model.timeline.availableCount(tl_et, tl_lt).length === 0)){
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
                        this.children.timelineState.$el.hide();
                        this.visibility();
                    }
                }, this);

                this.model.report.entry.content.on('change:display.page.search.showFields', function() {
                   this.visibility();
                }, this);

                this.model.searchJob.entry.content.on('change:eventCount change:dispatchState', _.debounce(function() {
                    if (this.active) {
                        this.visibility();

                        if(this.model.searchJob.entry.content.get('dispatchState') === 'DONE'){
                            var eventCount = parseInt(this.model.searchJob.entry.content.get('eventCount'), 10);
                            if(eventCount < 1){
                                this.collection.flashMessages.reset([{
                                    key: 'noresults',
                                    type: 'info',
                                    html: _('No results found. Please change source type, adjust source type settings, or check your source file.').t()
                                }]);
                            }
                        }else{
                            this.collection.flashMessages.reset();
                        }
                    }
                }.bind(this), 0), this);

                this.visibility();
            
                return BaseView.prototype.activate.call(this, options);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                
                BaseView.prototype.deactivate.apply(this, arguments);
                
                this.model.state.off(null, null, this);
                this.model.report.entry.content.off(null, null, this);
                this.model.timeline.buckets.off(null, null, this);
                this.model.searchJob.entry.content.off(null, null, this);
                
                this.model.state.clear();
                return this;
            },
            visibility: function(activation) {
                this.children.timelineState.activate({deep: true});

                if (this.model.searchJob.entry.content.get('eventCount') === 0) {
                    this.children.eventControls.deactivate({deep: true}).$el.hide();
                    this.children.eventsViewer.deactivate({deep: true}).$el.hide();
                } else {
                    if (this.model.searchJob.entry.content.get('eventAvailableCount') === 0) {
                        this.children.eventControls.deactivate({deep: true}).$el.hide();
                        this.children.eventsViewer.deactivate({deep: true}).$el.hide();
                    } else {
                        this.children.eventControls.activate({deep: true}).$el.show();
                        this.children.eventsViewer.activate({deep: true}).$el.show();
                    }
                }
            },
            render: function() {
                this.$el.append(this.children.timelineState.render().el);
                this.$el.append(this.children.eventControls.render().el);
                this.$el.append(this.children.eventsViewer.render().el);
                return this;
            }
        });
    }
);
