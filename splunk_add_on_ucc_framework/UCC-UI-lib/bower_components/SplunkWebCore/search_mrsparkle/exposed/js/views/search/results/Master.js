define(
    [
        'jquery',
        'module',
        'underscore',
        'views/Base',
        'views/search/results/EventsTab',
        'views/search/results/eventspane/Master',
        'views/search/results/StatisticsTab',
        'views/search/results/statisticspane/Master',
        'views/search/results/VisualizationsPane',
        'views/search/results/patternspane/Master',
        'views/search/results/shared/BaseTab',
        'views/shared/JobDispatchState',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        $,
        module,
        _,
        BaseView,
        EventsTab,
        EventsPane,
        StatisticsTab,
        StatisticsPane,
        VisualizationsPane,
        PatternsPane,
        BaseTab,
        JobDispatchState,
        splunkd_utils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *     model: {
             *         result: <models.services.search.job.ResultsV2>,
             *         summary: <model.services.search.job.SummaryV2>,
             *         timeline: <model.services.search.job.TimelineV2>,
             *         searchJobProxy: <helpers.ModelProxy>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>
             *     },
             *     collections: {
             *         workflowActions: <collections.services.data.ui.WorkflowActions>,
             *         selectedFields: <collections.SelectedFields>,
             *         times: <collections.services.data.ui.Times>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR, splunkd_utils.NOT_FOUND];
                this.searchJobErrorTypes = [splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];

                //blank state messages if the job is not yet reached running or beyond
                this.children.jobDispatchState = new JobDispatchState({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    }
                });

                //event tab
                this.children.eventTab = new EventsTab({
                    model: {
                        report: this.model.report,
                        timeline: this.model.timeline,
                        searchJob: this.model.searchJob
                    }
                });

                this.children.eventsPane = new EventsPane({
                    model: {
                        result: this.model.result,
                        summary: this.model.summary,
                        timeline: this.model.timeline,
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                   }
                });

                //statistics tab
                this.children.statisticsTab = new StatisticsTab({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob
                    }
                });

                //statistics tab pane
                this.children.statisticsPane = new StatisticsPane({
                    id: 'statistics_' + this.cid,
                    model: {
                        report: this.model.report,
                        timeline: this.model.timeline,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        summary: this.model.summary
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields
                    }
                });

                //viz tab
                this.children.visualizationsTab = new BaseTab({
                    model: {
                        report: this.model.report
                    },
                    tab: "visualizations",
                    type: "visualizations",
                    label: _("Visualization").t()
                });

                //viz tab pane
                this.children.visualizationsPane = new VisualizationsPane({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        application: this.model.application,
                        user: this.model.user,
                        summary: this.model.summary
                    }
                });

                if (this.model.user.canPatternDetect()) {
                    //patterns tab
                    this.children.patternsTab = new BaseTab({
                        model: {
                            report: this.model.report
                        },
                        tab: 'patterns',
                        label: _("Patterns").t()
                    });

                    //patterns pane
                    this.children.patternsPane = new PatternsPane({
                        model: {
                            report: this.model.report,
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            times: this.collection.times
                        }
                    });
                }
            },
            startListening: function() {
                this.listenTo(this.model.report.entry.content, 'change:display.page.search.tab', function() {
                    if (this.active) {
                        this.manageStateOfChildren();
                    }
                });
                this.listenTo(this.model.searchJob, 'prepared', function(){
                    if (this.active) {
                        this.manageStateOfChildren();
                    }
                });
                this.listenTo(this.model.searchJob.entry.content, 'change:dispatchState', function() {
                    if (this.active) {
                        var dispatchState = this.model.searchJob.entry.content.get('dispatchState');
                        this.setSearchErrorState(_.isUndefined(dispatchState));
                    }
                });
                this.listenTo(this.model.searchJob, 'sync error', function() {
                    if (this.active) {
                        var isError = this.model.searchJob.entry.content.get("isFailed") || splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), this.searchJobErrorTypes);
                        this.permanentError = isError;
                        this.setSearchErrorState(isError);
                    }
                });
                this.listenTo(this.model.searchJob.control, 'sync error', function() {
                    if (this.active) {
                        var isError = splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.control.error.get("messages"), this.searchJobErrorTypes);
                        this.permanentError = isError;
                        this.setSearchErrorState(isError);
                    }
                });
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                this.ensureDeactivated({deep: true});

                this.permanentError = (splunkd_utils.messagesContainsOneOfTypes(this.model.report.error.get("messages"), this.errorTypes) && this.model.searchJob.isNew()) ||
                    splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), this.searchJobErrorTypes) ||
                    this.model.searchJob.entry.content.get("isFailed");

                BaseView.prototype.activate.call(this, clonedOptions);

                this.manageStateOfChildren();
                this.setSearchErrorState();

                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }

                BaseView.prototype.deactivate.apply(this, arguments);

                this.permanentError = false;

                return this;
            },
            setSearchErrorState: function(isError) {
                var sid = this.model.searchJob.id;
                if (this.permanentError || isError || !sid) {
                    this.children.eventTab.$el.addClass('search-disabled');
                    this.children.statisticsTab.$el.addClass('search-disabled');
                    this.children.visualizationsTab.$el.addClass('search-disabled');

                    if (this.children.patternsTab) {
                        this.children.patternsTab.$el.addClass('search-disabled');
                        this.children.patternsPane.$el.addClass('search-disabled');
                    }

                    this.children.statisticsPane.$el.addClass('search-disabled');
                    this.children.visualizationsPane.$el.addClass('search-disabled');
                    this.children.eventsPane.$el.addClass('search-disabled');
                } else {
                    this.children.eventTab.$el.removeClass('search-disabled');
                    this.children.statisticsTab.$el.removeClass('search-disabled');
                    this.children.visualizationsTab.$el.removeClass('search-disabled');

                    if (this.children.patternsTab) {
                        this.children.patternsTab.$el.removeClass('search-disabled');
                        this.children.patternsPane.$el.removeClass('search-disabled');
                    }

                    this.children.statisticsPane.$el.removeClass('search-disabled');
                    this.children.visualizationsPane.$el.removeClass('search-disabled');
                    this.children.eventsPane.$el.removeClass('search-disabled');
                }
            },
            manageStateOfChildren: function() {
                var tab = this.model.report.entry.content.get('display.page.search.tab'),
                    jobPreparing = this.model.searchJob.isPreparing();

                if (jobPreparing) {
                    this.children.jobDispatchState.activate({deep: true}).$el.show();

                    //hide and deactivate everything else
                    _.chain(this.children).omit(['jobDispatchState', 'jobStatus']).each(function(child) {
                        child.deactivate({deep: true}).$el.hide();
                    });

                    return this;
                } else {
                    this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                    this.children.eventTab.activate({deep: true}).$el.show();
                    this.children.statisticsTab.activate({deep: true}).$el.show();
                    this.children.visualizationsTab.activate({deep: true}).$el.show();
                    if (this.children.patternsTab) {
                        this.children.patternsTab.activate({deep: true}).$el.show();
                    }
                }

                if (tab === 'events') {
                    if (!this.children.eventsPane.active) {
                        this.children.eventsPane.activate().$el.show();
                    }

                    this.children.statisticsPane.deactivate({deep: true}).$el.hide();
                    this.children.visualizationsPane.deactivate({deep: true}).$el.hide();

                    if (this.children.patternsPane) {
                        this.children.patternsPane.deactivate({deep: true}).$el.hide();
                    }
                } else if (tab === 'statistics') {
                    this.children.eventsPane.deactivate({deep: true}).$el.hide();

                    if (!this.children.statisticsPane.active) {
                        this.children.statisticsPane.$el.show();
                        this.children.statisticsPane.activate();
                    }

                    this.children.visualizationsPane.deactivate({deep: true}).$el.hide();

                    if (this.children.patternsPane) {
                        this.children.patternsPane.deactivate({deep: true}).$el.hide();
                    }
                } else if (tab === 'visualizations') {
                    this.children.eventsPane.deactivate({deep: true}).$el.hide();
                    this.children.statisticsPane.deactivate({deep: true}).$el.hide();

                    if (this.children.patternsPane) {
                        this.children.patternsPane.deactivate({deep: true}).$el.hide();
                    }

                    if (!this.children.visualizationsPane.active) {
                        this.children.visualizationsPane.activate().$el.show();
                    }
                } else if (tab === 'patterns' && this.children.patternsTab) {
                    this.children.eventsPane.deactivate({deep: true}).$el.hide();
                    this.children.statisticsPane.deactivate({deep: true}).$el.hide();
                    this.children.visualizationsPane.deactivate({deep: true}).$el.hide();
                    if (!this.children.patternsPane.active) {
                        this.children.patternsPane.activate().$el.show();
                    }
                }

                return this;
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.template);
                    this.children.eventTab.render().appendTo(this.$('.nav-tabs'));

                    if (this.children.patternsTab) {
                        this.children.patternsTab.render().appendTo(this.$('.nav-tabs'));
                    }

                    this.children.statisticsTab.render().appendTo(this.$('.nav-tabs'));
                    this.children.visualizationsTab.render().appendTo(this.$('.nav-tabs'));
                    this.children.jobDispatchState.render().appendTo(this.$('.tab-content'));
                    this.children.statisticsPane.render().appendTo(this.$('.tab-content'));
                    this.children.visualizationsPane.render().appendTo(this.$('.tab-content'));
                    this.children.eventsPane.render().appendTo(this.$('.tab-content'));

                    if (this.children.patternsPane) {
                        this.children.patternsPane.render().appendTo(this.$('.tab-content'));
                    }
                }

                return this;
            },
            template: '\
                <ul class="nav nav-tabs main-tabs"></ul>\
                <div class="tab-content" style="overflow:visible;"></div>\
            '
        });
    }
);
