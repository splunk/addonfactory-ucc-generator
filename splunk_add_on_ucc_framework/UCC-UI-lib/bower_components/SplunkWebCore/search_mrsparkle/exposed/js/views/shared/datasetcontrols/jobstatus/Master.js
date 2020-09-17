define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/datasetcontrols/jobstatus/Count',
        'views/shared/datasetcontrols/diversity/Master',
        'views/shared/datasetcontrols/eventlimiting/Master',
        'views/shared/timerangepicker/Master',
        'views/shared/jobstatus/Count',
        'views/shared/ProgressBar',
        'views/shared/jobcontrols/Master',
        './Master.pcss',
        'uri/route',
        'splunk.window',
        'splunk.util',
        'util/splunkd_utils',
        'bootstrap.tooltip'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        CountView,
        DiversityView,
        EventLimitingView,
        TimeRangePicker,
        SummaryCountView,
        ProgressBarView,
        JobStatusControls,
        css,
        route,
        splunkwindow,
        splunkUtil,
        splunkd_utils,
        undefined
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'job-status',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                // Some errors should be shown but are not fatal SPL-107091
                this.fatalErrorTypes = [splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];
                this.renderableErrorTypes = [splunkd_utils.ERROR, splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];

                this.children.count = new CountView({
                    model: {
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob,
                        resultJsonRows: this.model.resultJsonRows
                    },
                    isViewingMode: this.options.isViewingMode
                });

                this.children.diversity = new DiversityView({
                    model: this.model.table.entry.content,
                    rightAlign: true,
                    size: 'small'
                });

                this.children.eventLimiting = new EventLimitingView({
                    model: this.model.table.entry.content,
                    rightAlign: true,
                    size: 'small'
                });

                if (this.options.hasTimeRangePicker) {
                    this.children.summaryTimeRangePicker = new TimeRangePicker({
                        model: {
                            state: this.model.table.entry.content,
                            application: this.model.application,
                            timeRange: this.model.dataSummaryTimeRange,
                            appLocal: this.model.appLocal,
                            user: this.model.user
                        },
                        collection: this.collection.times,
                        className: 'btn-group',
                        timerangeClassName: 'btn-pill',
                        forceTimerangeChange: true,
                        timeRangeAttrNames: {
                            earliest: 'dataset.display.datasummary.earliestTime',
                            latest: 'dataset.display.datasummary.latestTime'
                        },
                        dialogOptions: {
                            showPresetsRealTime: false,
                            showCustomRealTime: false,
                            enableCustomAdvancedRealTime: false
                        }
                    });
                }

                if (!this.options.isViewingMode) {
                    this.children.summaryProgressBar = new ProgressBarView({
                       model: this.model.dataSummaryJob
                    });


                    this.children.summaryJobStatusControls = new JobStatusControls({
                        model: {
                            searchJob: this.model.dataSummaryJob
                        },
                        showJobMenu: false,
                        enableReload: true,
                        attachTooltipTo: $('body')
                    });

                    this.children.summaryCount = new SummaryCountView({
                        model: this.model.dataSummaryJob
                    });
                }
            },

            events: {
                'click a.job_inspector': function(e) {
                    var jobId = $(e.currentTarget).data('job-id');

                    splunkwindow.open(
                        route.jobInspector(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), jobId),
                        'splunk_job_inspector',
                        {
                            width: 870,
                            height: 560,
                            menubar: false
                        }
                    );
                    e.preventDefault();
                },
                'click a.rerun_datasummary': function(e) {
                    e.preventDefault();
                    this.model.dataSummaryJob.trigger('reload');
                }
            },

            startListening: function() {
                if (this.options.isViewingMode || this.model.table.isTableMode()) {

                    this.listenTo(this.model.searchPointJob, "sync error", function(model, response) {
                        this.updateErrorState(model, response, 'searchPoint');
                        this.updateJobControlsVisibility();
                    }.bind(this));
                    this.listenTo(this.model.searchPointJob.control, "error", function(model, response) {
                        this.updateErrorState(model, response, 'searchPoint');
                    }.bind(this));

                    if (!this.options.isViewingMode) {
                        this.listenTo(this.model.currentPointJob, "sync error", function(model, response) {
                            this.updateErrorState(model, response, 'currentPoint');
                        }.bind(this));
                        this.listenTo(this.model.currentPointJob.control, "error", function(model, response) {
                            this.updateErrorState(model, response, 'currentPoint');
                        }.bind(this));
                    }


                } else {
                    if (this.model.dataSummaryJob) {
                        this.listenTo(this.model.dataSummaryJob, "sync error", function(model, response) {
                            this.updateErrorState(model, response, 'dataSummary');
                        }.bind(this));
                        this.listenTo(this.model.dataSummaryJob.control, "error", function(model, response) {
                            this.updateErrorState(model, response, 'dataSummary');
                        }.bind(this));
                    }
                }
            },

            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                this.ensureDeactivated({deep: true});

                var searchPointJobMessages = this.model.searchPointJob.error.get("messages"),
                    currentPointJobMessages, dataSummaryJobMessages;

                if (this.model.currentPointJob) {
                    currentPointJobMessages = this.model.currentPointJob.error.get("messages");
                }

                if (this.model.dataSummaryJob) {
                    dataSummaryJobMessages = this.model.dataSummaryJob.error.get("messages");
                }

                if (this.options.isViewingMode || this.model.table.isTableMode()) {

                    if (this.model.currentPointJob && this.model.dataSummaryJob) {
                        this.hasFatalError = this.model.searchPointJob.entry.content.get("isFailed") ||
                            splunkd_utils.messagesContainsOneOfTypes(searchPointJobMessages, this.fatalErrorTypes) ||
                            this.model.currentPointJob.entry.content.get("isFailed") ||
                            splunkd_utils.messagesContainsOneOfTypes(currentPointJobMessages, this.fatalErrorTypes) ||
                            this.model.dataSummaryJob.entry.content.get("isFailed") ||
                            splunkd_utils.messagesContainsOneOfTypes(dataSummaryJobMessages, this.fatalErrorTypes);

                        this.hasRenderableError = splunkd_utils.messagesContainsOneOfTypes(searchPointJobMessages, this.renderableErrorTypes) ||
                            splunkd_utils.messagesContainsOneOfTypes(currentPointJobMessages, this.renderableErrorTypes) ||
                            splunkd_utils.messagesContainsOneOfTypes(dataSummaryJobMessages, this.renderableErrorTypes);
                    } else {
                        this.hasFatalError = this.model.searchPointJob.entry.content.get("isFailed") ||
                        splunkd_utils.messagesContainsOneOfTypes(searchPointJobMessages, this.fatalErrorTypes);

                        this.hasRenderableError = splunkd_utils.messagesContainsOneOfTypes(searchPointJobMessages, this.renderableErrorTypes);
                    }

                } else {

                    this.hasFatalError = this.model.dataSummaryJob.entry.content.get("isFailed") ||
                        splunkd_utils.messagesContainsOneOfTypes(dataSummaryJobMessages, this.fatalErrorTypes);

                    this.hasRenderableError = splunkd_utils.messagesContainsOneOfTypes(dataSummaryJobMessages, this.renderableErrorTypes);

                }

                this.manageStateOfChildren();

                return BaseView.prototype.activate.call(this, clonedOptions);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.call(this, options);
                }

                BaseView.prototype.deactivate.call(this, options);

                this.$('.alert').remove();

                return this;
            },

            manageStateOfChildren: function() {              
                this.updateJobControlsVisibility();
                if (this.options.isViewingMode || this.model.table.isTableMode()) {
                    if (this.hasFatalError) {
                        this.children.count.deactivate({deep: true}).$el.hide();
                    } else {
                        this.children.count.activate({deep: true}).$el.css('display', 'inline-block');
                    }

                    this.children.summaryCount && this.children.summaryCount.deactivate({deep: true}).$el.hide();
                    this.children.summaryTimeRangePicker && this.children.summaryTimeRangePicker.deactivate({deep: true}).$el.hide();
                    this.children.summaryProgressBar && this.children.summaryProgressBar.deactivate({deep: true}).$el.hide();
                    this.children.summaryJobStatusControls && this.children.summaryJobStatusControls.deactivate({deep: true}).$el.hide();

                } else {
                    this.children.count.deactivate({deep: true}).$el.hide();

                    if (this.hasFatalError) {
                        this.children.summaryCount.deactivate({deep: true}).$el.hide();
                        this.children.summaryJobStatusControls.deactivate({deep: true}).$el.hide();
                        this.children.summaryProgressBar.deactivate({deep: true}).$el.hide();
                    } else {
                        this.children.summaryCount.activate({deep: true}).$el.css('display', 'inline-block');
                        this.children.summaryProgressBar.activate({deep: true}).$el.css('display', 'inline-block');
                        this.children.summaryJobStatusControls.activate({deep: true}).$el.css('display', 'inline-block');
                    }


                    this.children.summaryTimeRangePicker && this.children.summaryTimeRangePicker.activate({deep: true}).$el.css('display', 'inline-block');
                }
            },

            updateErrorState: function(model, response, type) {
                var messages = model.error.get("messages");

                if ((model.entry && model.entry.content && model.entry.content.get("isFailed")) ||
                        splunkd_utils.messagesContainsOneOfTypes(messages, this.fatalErrorTypes)) {
                    this.hasFatalError = true;
                    this.manageStateOfChildren();
                }

                if (splunkd_utils.messagesContainsOneOfTypes(messages, this.renderableErrorTypes)) {
                    this.hasRenderableError = true;
                    this.renderError(messages, model, response, type);
                }
            },

            updateJobControlsVisibility: function() {
                if (this.options.isViewingMode || this.model.table.isTableMode()) {
                    if (this.model.ast.isTransforming()) {
                        this.children.eventLimiting.activate({deep: true}).$el.css('display', 'inline-block');
                        this.children.diversity.deactivate({deep: true}).$el.hide();
                    } else {
                        this.children.eventLimiting.deactivate({deep: true}).$el.hide();
                        this.children.diversity.activate({deep: true}).$el.css('display', 'inline-block');
                    }
                } else {
                    this.children.diversity.deactivate({deep: true}).$el.hide();
                    this.children.eventLimiting.activate({deep: true}).$el.css('display', 'inline-block');
                }
            },

            render: function() {
                if (!this.$el.innerHTML) {
                    this.children.count.render().appendTo(this.$el);
                    this.children.diversity.render().appendTo(this.$el);
                    this.children.eventLimiting.render().appendTo(this.$el);
                    this.children.summaryCount && this.children.summaryCount.render().appendTo(this.$el);
                    this.children.summaryProgressBar && this.children.summaryProgressBar.render().appendTo(this.$el);
                    this.children.summaryJobStatusControls && this.children.summaryJobStatusControls.render().appendTo(this.$el);
                    this.children.summaryTimeRangePicker && this.children.summaryTimeRangePicker.render().appendTo(this.$el);
                }

                if (this.hasRenderableError) {
                    this.renderError();
                } else {
                    this.$('.alert').remove();
                }

                this.manageStateOfChildren();
                return this;
            },

            renderError: function(messages, model, response, type) {
                var searchPointJobId = this.model.searchPointJob.id || _('unknown').t(),
                    currentPointJobId,
                    dataSummaryJobId,
                    errors = [],
                    template,
                    link,
                    id;

                if (this.model.currentPointJob) {
                    currentPointJobId = this.model.currentPointJob.id || _('unknown').t();
                }

                if (this.model.dataSummaryJob) {
                    dataSummaryJobId = this.model.dataSummaryJob.id || _('unknown').t();
                }

                if (splunkd_utils.messagesContainsOneOfTypes(messages, [splunkd_utils.NOT_FOUND]) || (response && response.hasOwnProperty('status') && response.status == 404)) {
                    id = model.id;

                    if (id.indexOf('/control') === (id.length - 8)) {
                        id = id.match(/^.*\/(.*)\/control$/)[1];
                    }

                    if (type === 'searchPoint') {
                        errors.push(splunkUtil.sprintf(_('The search point job "%s" was canceled remotely or expired.').t(), id));
                    } else if (type === 'currentPoint') {
                        errors.push(splunkUtil.sprintf(_('The current point job "%s" was canceled remotely or expired.').t(), id));
                    } else {
                        link = '<a class="rerun_datasummary" href="#">' + _('Rerun Data Summary').t() + '</a>';
                        errors.push(splunkUtil.sprintf(_('The data summary search job "%s" was canceled remotely or expired. %s').t(), id, link));
                    }
                }

                if (this.options.isViewingMode || this.model.table.isTableMode()) {
                    if (this.model.searchPointJob.entry.content.get("isFailed")) {
                        link = '<a class="job_inspector" href="#" data-job-id="' + searchPointJobId + '">' + _('Job Inspector').t() + '</a>';
                        errors.push(splunkUtil.sprintf(_('The search point job has failed due to an error. You may be able view the job in the %s.').t(), link));
                    }

                    if (this.model.currentPointJob && this.model.currentPointJob.entry.content.get("isFailed")) {
                        link = '<a class="job_inspector" href="#" data-job-id="' + currentPointJobId + '">' + _('Job Inspector').t() + '</a>';
                        errors.push(splunkUtil.sprintf(_('The current point job has failed due to an error. You may be able view the job in the %s.').t(), link));
                    }
                } else {
                    if (this.model.dataSummaryJob && this.model.dataSummaryJob.entry.content.get("isFailed")) {
                        link = '<a class="job_inspector" href="#" data-job-id="' + dataSummaryJobId + '">' + _('Job Inspector').t() + '</a>';
                        errors.push(splunkUtil.sprintf(_('The data summary job has failed due to an error. You may be able view the job in the %s.').t(), link));
                    }
                }

                _.each(errors, function(error) {
                    template = _.template(this.errorTemplate, {
                        error: error
                    });
                    this.$el.prepend(template);
                }.bind(this));

                return this;
            },

            errorTemplate: '\
                <div class="alert alert-error job-status-alert">\
                    <i class="icon-alert"></i>\
                    <%= error %>\
                </div>\
            '
        });
    }
);
