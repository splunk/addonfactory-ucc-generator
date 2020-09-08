define([
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/shared/JobDispatchState',
        'views/shared/jobstatus/Master',
        'views/report/results/EventsPane',
        'views/report/results/ResultsPane',
        'util/splunkd_utils'
    ],
    function(
        _,
        Backbone,
        module,
        Base,
        FlashMessage,
        JobDispatchState,
        JobStatus,
        EventsPane,
        ResultsPane,
        splunkd_utils
    ){
        return Base.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *      model: {
             *          searchJob: <models.services.search.Job>,
             *          report: <models.search.Report>,
             *          eventsViewerReport: <models.search.Report>
             *          result: <models.services.search.job.ResultsV2>,
             *          summary: summary: <model.services.search.job.SummaryV2>,             
             *          application: <models.Application>,
             *          appLocal: <models.services.AppLocal>,
             *          user: <models.services.admin.User>
             *      },
             *      collection: {
             *          times: <collections.services.data.ui.TimesV2>,
             *          selectedFields: <collections.SelectedFields>,
             *          workflowActions: <collections.services.data.ui.WorkflowActions>
             *       }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR];
                this.searchJobErrorTypes = [splunkd_utils.FATAL];

                //views
                this.children.flashMessage = new FlashMessage({
                    className: 'results-message',
                    model: {
                        searchJob: this.model.searchJob,
                        searchJobControl: this.model.searchJob.control,
                        report: this.model.report,
                        eventsViewerReport: this.model.eventsViewerReport,
                        result: this.model.result,
                        summary: this.model.summary
                    },
                    whitelist: this.errorTypes
                });
                
                this.children.jobDispatchState = new JobDispatchState({
                    mode: 'auto',
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    }
                });

                this.children.eventsPane = new EventsPane({
                    model: {
                        result: this.model.result,
                        summary: this.model.summary,
                        report: this.model.report,
                        eventsViewerReport: this.model.eventsViewerReport,
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                   }
                });

                this.children.resultsPane = new ResultsPane({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        application: this.model.application
                    },
                    flashMessagesHelper: this.options.flashMessagesHelper
                });
            },
            instantiateJobStatus: function() {
                this.children.jobStatus = new JobStatus({
                    model: {
                        searchJob: this.model.searchJob,
                        state: this.model.report.entry.content,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        report: this.model.report,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user 
                    },
                    enableReload: true,
                    enableSearchMode: false,
                    allowDelete: false
                });
                //TODO: remove when views don't call activate in init
                this.children.jobStatus.deactivate({deep:true});
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, 'prepared', function(){
                    if (this.active) {
                        this.manageStateOfChildren();
                    }
                });

                this.listenTo(this.model.searchJob.entry.content, 'change:isFailed', function(){
                    if (this.active) {
                        this.manageStateOfChildren();
                    }
                });

                this.listenTo(this.model.searchJob, 'error', function() {
                    if (this.active) {
                        var isError = splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), this.searchJobErrorTypes);
                        this.setSearchErrorState(isError);
                    }
                });

                this.listenTo(this.model.searchJob.control, 'error', function() {
                    if (this.active) {
                        var isError = splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.control.error.get("messages"), this.searchJobErrorTypes);
                        this.setSearchErrorState(isError);
                    }
                });
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                
                this.ensureDeactivated({deep: true});
                
                if (!this.children.jobStatus) {
                    this.instantiateJobStatus();
                }

                Base.prototype.activate.call(this, clonedOptions); 
                
                if (this.$el.html() && !this.children.jobStatus.$el.html()) {
                    this.children.jobStatus.activate({deep: true}).render().appendTo(this.$('.job-bar'));
                }

                this.manageStateOfChildren();
                var isError = splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), this.searchJobErrorTypes);
                this.setSearchErrorState(isError);
                
                return this;
            }, 
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                
                this.children.jobStatus.remove();
                delete this.children.jobStatus;

                Base.prototype.deactivate.apply(this, arguments);
                
                return this;               
            },
            setSearchErrorState: function(isError) {
                // SPL-111303: If job has the fatal error, add overlay to events/results pane.
                if (isError) {
                    this.children.eventsPane.$el.addClass('report-disabled');
                    this.children.resultsPane.$el.addClass('report-disabled');
                } else {
                    this.children.eventsPane.$el.removeClass('report-disabled');
                    this.children.resultsPane.$el.removeClass('report-disabled');
                }
            },
            manageStateOfChildren: function() {
                var sid = this.model.searchJob.id,
                    jobPreparing = this.model.searchJob.isPreparing(),
                    isReportSearch;
                
                this.children.flashMessage.activate({deep: true});
                this.children.jobStatus.activate({deep: true}).$el.show();

                if (!sid || this.model.searchJob.isFailed()) {
                    if (this.$resultsWrapper) {
                        this.$resultsWrapper.hide();
                    }

                    var omitViews = sid ? ['flashMessage', 'jobStatus'] : ['flashMessage'];
                    //hide and deactivate everything else
                    _.chain(this.children).omit(omitViews).each(function(child) {
                        child.deactivate({deep: true}).$el.hide();
                    });
                    
                    return this;
                }

                if (this.$resultsWrapper) {
                    this.$resultsWrapper.show();
                }

                if (jobPreparing) {
                    this.children.jobDispatchState.activate({deep: true}).$el.show();
                    
                    //hide and deactivate everything else
                    _.chain(this.children).omit(['jobDispatchState', 'jobStatus', 'flashMessage']).each(function(child) {
                        child.deactivate({deep: true}).$el.hide();
                    });
                    
                    return this;
                }

                isReportSearch = this.model.searchJob.isReportSearch();
                this.children.jobDispatchState.deactivate({deep: true}).$el.hide();

                if (isReportSearch) {
                    if (!this.children.resultsPane.active) {
                        this.children.resultsPane.activate().$el.show();
                    }
                    this.children.eventsPane.deactivate().$el.hide();
                } else {
                    if (!this.children.eventsPane.active) {
                        this.children.eventsPane.activate().$el.show();
                    }
                    this.children.resultsPane.deactivate().$el.hide();
                }
                
                return this;
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.template);
                    this.$resultsWrapper = this.$('.results-wrapper');
                    
                    this.children.flashMessage.render().prependTo(this.$el);
                    if (this.children.jobStatus) {
                        this.children.jobStatus.render().appendTo(this.$('.job-bar'));
                    }
                    this.children.jobDispatchState.render().appendTo(this.$resultsWrapper);
                    this.children.eventsPane.render().appendTo(this.$resultsWrapper);
                    this.children.resultsPane.render().appendTo(this.$resultsWrapper);

                    if (this.model.searchJob.isFailed()) {
                        this.$resultsWrapper.hide();
                    }
                }
                
                return this;
            },
            template: '\
                <div class="job-bar"></div>\
                <div class="results-wrapper"></div>\
            '
        });
    }
);
