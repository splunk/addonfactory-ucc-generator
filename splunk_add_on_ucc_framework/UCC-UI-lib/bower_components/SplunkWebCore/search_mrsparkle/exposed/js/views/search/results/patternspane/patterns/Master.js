define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'views/Base',
        'views/search/results/patternspane/patterns/PatternJobState',
        'views/search/results/patternspane/patterns/Regenerate',
        'views/search/results/patternspane/patterns/Table',
        'views/search/results/patternspane/patterns/sidebar/Master',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessagesLegacy',
        'models/search/PatternJob',
        'models/services/search/jobs/Pattern',
        'collections/shared/FlashMessages',
        'splunk.i18n',
        'splunk.util'
    ],
    function($, _, module, BaseModel, Base,  PatternJobState, Regenerate, Table, Sidebar, ControlGroup, FlashMessagesLegacy, PatternJobModel, PatternModel, FlashMessagesCollection, i18n, splunkUtil){
        return Base.extend({
            moduleId: module.id,
            className: 'patterns-container',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.patternJob = new PatternJobModel({}, {delay: PatternJobModel.DEFAULT_POLLING_INTERVAL, processKeepAlive: true, keepAliveInterval: PatternJobModel.DEFAULT_LONG_POLLING_INTERVAL});
                this.model.patternData = new PatternModel();
                this.model.state = new BaseModel();
                this.collection = this.collection || {};
                this.collection.flashMessages = new FlashMessagesCollection();
                
                this.children.patternJobState = new PatternJobState({
                    model: {
                        searchJob: this.model.searchJob,
                        patternJob: this.model.patternJob,
                        patternData: this.model.patternData,
                        application: this.model.application,
                        state: this.model.state
                    }                    
                });
                
                this.children.regenerate = new Regenerate({
                    model: {
                        searchJob: this.model.searchJob,
                        patternJob: this.model.patternJob,
                        patternData: this.model.patternData,
                        state: this.model.state
                    }
                });
                
                this.children.flashMessages = new FlashMessagesLegacy({
                    collection: this.collection.flashMessages
                });

                this.children.sensitivity = new ControlGroup({
                    controlType: 'SyntheticSlider',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'display.page.search.patterns.sensitivity',
                        model: this.model.report.entry.content,
                        steps: [0.9, 0.866, 0.833, 0.8, 0.75, 0.7, 0.6, 0.5, 0.3],
                        enableStepLabels: false,
                        minLabel: _('Smaller').t(),
                        maxLabel: _('Larger').t()
                    }
                });

                this.children.table = new Table({
                    model: {
                        patternJob: this.model.patternJob,
                        patternData: this.model.patternData,
                        state: this.model.state
                    }
                });
                
                this.children.sidebar = new Sidebar({
                    model: {
                        report: this.model.report,
                        patternJob: this.model.patternJob,
                        patternData: this.model.patternData,
                        state: this.model.state,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        searchJob: this.model.searchJob
                    },
                    collection: {
                        times: this.collection.times
                    }
                });
            },
            startListening: function() {
                this.listenTo(this.model.patternJob, 'done', this.fetchPatternData);
                this.listenTo(this.model.patternJob, 'restart', this.startPatternJob);
                this.listenTo(this.model.patternJob.entry.content.custom, 'change:parentEventCount', function() {
                    if (this.model.patternJob.getParentEventCount() < 5000) {
                        this.collection.flashMessages.reset([{
                            type: 'warning',
                            html: splunkUtil.sprintf(_("Less than %s events may produce poor patterns. Try a search in a larger time range or with fewer constraints.").t(), i18n.format_decimal(5000))
                        }]);
                    }
                });
                this.listenTo(this.model.state, 'sidebarHeightUpdated', function(minHeight) {
                    if (this.$el.height() <= minHeight) {
                        this.$el.css('min-height', minHeight + 'px');
                    }
                });
                this.listenTo(this.model.state, 'unselectPattern', function() {
                    this.$el.css('min-height', 'inherit');
                });
            },     
            activate: function() {
                if (this.active) {
                    Base.prototype.activate.apply(this, arguments);
                }
                this.startPatternJob();
                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                var destroyDeferred;
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                this.collection.flashMessages.reset();
                
                Base.prototype.deactivate.apply(this, arguments);

                this.model.state.clear();
                this.clearPattern();
                return this;
            },
            fetchPatternData: function() {
                var id = this.model.patternJob.entry.links.get(PatternJobModel.RESULTS),
                    resultCount = this.model.patternJob.entry.content.get("resultCount");
                if (_.isNumber(resultCount) && (resultCount > 0)) {
                    this.model.patternData.set({id: id});
                    this.model.patternData.safeFetch({
                        data: {
                            count: 100,
                            search: 'search confidence >= 0.5'
                        }
                    });
                }
            },
            clearPattern: function() {
                this.model.patternJob.clear();
                this.model.patternData.clear();
                this.collection.flashMessages.reset();
            },
            startPatternJob: function() {
                if (!this.model.patternJob.isNew()) {
                    this.clearPattern();
                }
                var startJobDeferred = this.model.patternJob.startJob(
                    this.model.searchJob,
                    this.model.application,
                    this.model.report.entry.content.get('display.page.search.patterns.sensitivity'),
                    {data: {provenance: 'UI:Search'}}
                );
                $.when(startJobDeferred).then(function() {
                    this.model.patternJob.startPolling();
                }.bind(this));
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate());
                    this.children.sensitivity.render().appendTo(this.$('.pattern-controls'));
                    this.children.patternJobState.render().appendTo(this.$('.pattern-controls'));
                    this.children.regenerate.render().appendTo(this.$('.pattern-controls'));
                    this.children.flashMessages.render().appendTo(this.$('.pattern-controls'));
                    this.children.table.render().appendTo(this.$('.pattern-controls-and-table'));
                    this.children.sidebar.render().appendTo(this.$el);
                }
                return this;
            },
            template: '\
                <div class="pattern-controls-and-table">\
                    <div class="pattern-controls"></div>\
                </div>\
            '
        });
    }
);
