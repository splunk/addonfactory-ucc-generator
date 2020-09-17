define([
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/report/Title',
        'views/report/ScheduleInfo',
        'views/report/results/Master',
        'views/report/ActionBar',
        'views/report/StateMessage',
        'views/shared/timerangepicker/Master',
        'splunk.util',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        _,
        Backbone,
        module,
        Base,
        FlashMessage,
        Title,
        ScheduleInfo,
        ResultsContainer,
        ActionBar,
        StateMessage,
        TimeRangePicker,
        splunkUtil,
        splunkd_utils,
        css
    ){
        return Base.extend({
            moduleId: module.id,
            className: 'view-report-page',
             /**
             * @param {Object} options {
             *      model: {
             *          result: <models.services.search.job.ResultsV2>,
             *          summary: summary: <model.services.search.job.SummaryV2>,
             *          searchJob: <models.services.search.Job>,
             *          report: <models.search.Report>,
             *          reportPristine: <models.search.Report>,
             *          eventsViewerReport: <models.search.Report>
             *          application: <models.Application>,
             *          timeRange: <models.TimeRange>,
             *          appLocal: <models.services.AppLocal>,
             *          user: <models.services.admin.User>
             *      },
             *      collection: {
             *          times: <collections.services.data.ui.TimesV2>,
             *          selectedFields: <collections.SelectedFields>,
             *          roles: <collections.services.authorization.Roles>,
             *          workflowActions: <collections.services.data.ui.WorkflowActions>
             *       }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR];

                //views
                this.children.flashMessage = new FlashMessage({
                    className: 'report-message',
                    model: {
                        report: this.model.report
                    },
                    whitelist: this.errorTypes
                });
                
                this.children.title = new Title({model: this.model.reportPristine});

                this.children.actionBar = new ActionBar({
                    model: {
                        searchJob: this.model.searchJob,
                        report: this.model.reportPristine,
                        application: this.model.application,
                        timeRange: this.model.timeRange,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles
                    }
                });

                this.children.scheduleInfo = new ScheduleInfo({
                    model: {
                        report: this.model.reportPristine,
                        searchJob: this.model.searchJob
                    },
                    collection: {
                        times: this.collection.times
                    }
                });

                this.children.timeRangePicker = new TimeRangePicker({
                    className: 'controls',
                    model: {
                        state: this.model.report.entry.content,
                        timeRange: this.model.timeRange,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        application: this.model.application
                    },
                    collection: this.collection.times,
                    timerangeClassName: 'btn btn-primary pull-left'
                });

                this.children.resultsContainer = new ResultsContainer({
                    model: {
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        eventsViewerReport: this.model.eventsViewerReport,
                        result: this.model.result,
                        summary: this.model.summary,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    flashMessagesHelper: this.children.flashMessage.flashMsgHelper
                });

                this.children.stateMessage = new StateMessage({
                    model: {
                        report: this.model.reportPristine,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        user: this.model.user
                    }
                });
                
                //TODO: when everyone moves to activate/deactivate and do not have activate in initialize
                //we will not have to do this.
                _.each(this.children, function(child, key){
                    child.deactivate({deep: true});
                });
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                this.ensureDeactivated({deep: true});

                this.isError = splunkd_utils.messagesContainsOneOfTypes(this.model.report.error.get("messages"), this.errorTypes);
                // Activate/Deactivate views
                if (this.model.report.isNew()) {
                    if (!this.isError) {
                        var noReportIdError = splunkd_utils.createSplunkDMessage(
                            splunkd_utils.FATAL,
                            _("No report was specified.").t());
                        this.model.report.trigger('error', this.model.report, noReportIdError);
                        this.isError = true;
                    }
                }

                this.manageStateOfChildren();

                return Base.prototype.activate.call(this, clonedOptions);
            }, 
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                this.isError = false;
                return this;
            },
            manageStateOfChildren: function() {
                if (this.isError){
                    this.children.flashMessage.activate({deep: true}).$el.show();
                    this.children.actionBar.deactivate({deep: true}).$el.hide();
                    this.children.title.deactivate().$el.hide();
                    this.children.timeRangePicker.deactivate({deep: true}).$el.hide();
                    this.children.scheduleInfo.deactivate().$el.hide();
                    this.children.resultsContainer.deactivate({deep: true}).$el.hide();
                    this.children.stateMessage.deactivate().$el.hide();
                } else {
                    var isScheduled = this.model.report.entry.content.get('is_scheduled');

                    this.children.flashMessage.deactivate({deep: true}).$el.hide();
                    this.children.actionBar.activate({deep: true}).$el.show();
                    this.children.title.activate().$el.show();

                    if (isScheduled) {
                        this.children.scheduleInfo.activate().$el.show();
                    } else {
                        this.children.scheduleInfo.deactivate().$el.hide();
                    }

                    if (this.model.report.entry.content.get('disabled')) {
                        this.children.timeRangePicker.deactivate({deep: true}).$el.hide();
                        this.children.resultsContainer.deactivate({deep: true}).$el.hide();
                        this.children.stateMessage.activate().$el.show();
                    } else {
                        // Manage state of time range picker
                        if (!isScheduled &&
                            splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.general.timeRangePicker.show'))) {
                            this.children.timeRangePicker.activate({deep: true}).$el.show();
                        } else {
                            this.children.timeRangePicker.deactivate({deep: true}).$el.hide();
                        }
                        // Manage states of stateMessage and resultsContainer
                        if (isScheduled && this.model.searchJob.isNew()) {
                            this.children.stateMessage.activate().$el.show();
                            this.children.resultsContainer.deactivate({deep: true}).$el.hide();
                        } else {
                            this.children.stateMessage.deactivate().$el.hide();
                            this.children.resultsContainer.activate().$el.show();
                        }
                    }
                }
            },
            render: function() {
                this.$el.html(this.template);
                var $header = this.$('.section-header');
                this.children.flashMessage.render().appendTo($header);
                //Header and Job status views
                this.children.actionBar.render().appendTo($header);
                this.children.title.render().appendTo($header);
                this.children.scheduleInfo.render().appendTo($header);
                this.children.timeRangePicker.render().appendTo($header);
                this.children.resultsContainer.render().appendTo(this.$el);
                this.children.stateMessage.render().appendTo(this.$el);

                return this;
            },
            template: '\
                <div class="section-padded section-header"></div>\
            '
        });
    }
);
