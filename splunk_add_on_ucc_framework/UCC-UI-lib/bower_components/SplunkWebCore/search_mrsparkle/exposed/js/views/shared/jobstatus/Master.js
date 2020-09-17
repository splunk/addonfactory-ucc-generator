define(
    [
        'underscore',
        'module',
        'models/classicurl',
        'views/Base',
        'views/shared/jobstatus/Count',
        'views/shared/jobcontrols/Master',
        'views/shared/jobstatus/buttons/Master',
        'views/shared/jobstatus/SearchMode',
        'views/shared/jobstatus/AutoPause',
        'views/shared/jobstatus/samplingmode/Master',
        'views/shared/ProgressBar',
        'uri/route',
        'splunk.window',
        'splunk.util',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(_, module, classicurlModel, Base, Count, Controls, Buttons, SearchMode, AutoPause, SamplingMode, ProgressBar, route, splunkwindow, splunkUtil, splunkd_utils, css) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         state: <models.BaseModel>,
             *         searchJob: <helpers.ModelProxy>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>,
             *         serverInfo: <models.services.server.ServerInfo>
             *         report: <models.Report> (Optional.),
             *         user: <models.shared.User> (Optional - only needed if showJobButtons is true)
             *     },
             *     showControlsAndJobInfo: <Boolean> Controls the display of controls and job info, defaults to true
             *     enableSearchMode: <Boolean> Controls the display of adhoc search mode via bunny button.
             *     enableSamplingMode: <Boolean> Controls the display of sampling editor.
             *     enableReload: <Boolean> Controls if the reload button will be shown when the job is done, defaults to false
             *     allowDelete: <Boolean> Controls if delete job link is displayed.
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                // Some errors should be shown but are not fatal SPL-107091
                this.fatalErrorTypes = [splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];
                this.renderableErrorTypes = [splunkd_utils.ERROR, splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];

                var defaults = {
                    allowDelete: true,
                    showControlsAndJobInfo: true,
                    showControls: true,
                    allowSendBackground: true,
                    allowTouch: false
                };

                _.defaults(this.options, defaults);
                // searchMode
                if (this.options.enableSearchMode) {
                    this.children.searchMode = new SearchMode({
                        model: this.model.state,
                        btnClass: 'btn-mini',
                        rightAlign: true
                    });
                }

                //Sampling Mode
                if (this.options.enableSamplingMode){
                    this.children.samplingMode = new SamplingMode({
                        model: {
                            report: this.model.report,
                            application: this.model.application
                        }
                    });
                }

                if (this.options.showJobButtons !== false) {
                    this.children.buttons = new Buttons({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            report: this.model.report,
                            reportPristine: this.model.reportPristine,
                            serverInfo: this.model.serverInfo,
                            user: this.model.user
                        },
                        hidePrintButton: this.options.hidePrintButton,
                        externalJobLinkPage: this.options.externalJobLinkPage
                    });
                }

                //controls
                if (this.options.showControls) {
                    this.children.controls = new Controls({
                        showJobMenu: this.options.showJobMenu,
                        allowDelete: this.options.allowDelete,
                        allowSendBackground: this.options.allowSendBackground,
                        allowTouch: this.options.allowTouch,
                        enableReload: this.options.enableReload,
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            report: this.model.report,
                            serverInfo: this.model.serverInfo
                        },
                        externalJobLinkPage: this.options.externalJobLinkPage
                    });
                }

                //count
                this.children.count = new Count({model: this.model.searchJob});

                //Progress
                this.children.progress = new ProgressBar({model: this.model.searchJob});

                this.activate();
            },
            initializeAutoPause : function() {
                this.children.autoPause = new AutoPause({
                    model: {
                        searchJob: this.model.searchJob
                    },
                    autoPause: this.options.autoPause
                });
            },
            activate: function(options) {
                if (this.options.autoPause && !this.children.autoPause) {
                    this.initializeAutoPause();
                }

                Base.prototype.activate.call(this, options);
                var messages = this.model.searchJob.error.get("messages");
                this.jobHasFatalError = this.model.searchJob.entry.content.get("isFailed") || splunkd_utils.messagesContainsOneOfTypes(messages, this.fatalErrorTypes);
                this.jobHasRenderableError = splunkd_utils.messagesContainsOneOfTypes(messages, this.renderableErrorTypes);
                this.manageStatOfChildren();

                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.call(this, options);
                }
                // Remove error and this.children.autoPause
                if (this.children.autoPause) {
                    this.children.autoPause.remove();
                    delete this.children.autoPause;
                }
                this.$('.alert-error').remove();

                return Base.prototype.deactivate.call(this, options);
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, "change:id", function() {
                    this.jobHasFatalError = !this.model.searchJob.id;
                    this.manageStatOfChildren();
                });

                this.listenTo(this.model.searchJob, "sync error", this.updateErrorState);

                this.listenTo(this.model.searchJob.control, "error", this.updateErrorState);
            },
            events: {
                'click a.job_inspector': function(e) {
                    splunkwindow.open(
                        route.jobInspector(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), this.model.searchJob.id),
                        'splunk_job_inspector',
                        {
                            width: 870,
                            height: 560,
                            menubar: false
                        }
                    );
                    e.preventDefault();
                }
            },
            manageStatOfChildren: function() {
                if (!this.options.showControlsAndJobInfo || this.jobHasFatalError) {
                    if (this.options.showControls) {
                        this.children.controls.deactivate({deep: true}).$el.hide();
                    }
                    if(this.options.showJobButtons !== false) {
                        this.children.buttons.deactivate({deep: true}).$el.hide();
                    }
                    this.children.count.deactivate({deep: true}).$el.hide();
                    this.children.progress.deactivate({deep: true}).$el.hide();
                } else {
                    if (this.options.showControls) {
                        this.children.controls.activate({deep: true}).$el.show();
                    }
                    if(this.options.showJobButtons !== false) {
                        this.children.buttons.activate({deep: true}).$el.show();
                    }
                    this.children.count.activate({deep: true}).$el.show();
                    this.children.progress.activate({deep: true}).$el.show();
                }
            },
            updateErrorState: function(model, response) {
                var messages = model.error.get("messages");
                if (this.model.searchJob.entry.content.get("isFailed") || splunkd_utils.messagesContainsOneOfTypes(messages, this.fatalErrorTypes)) {
                    this.jobHasFatalError = true;
                    this.manageStatOfChildren();
                }
                if (splunkd_utils.messagesContainsOneOfTypes(messages, this.renderableErrorTypes)) {
                    this.jobHasRenderableError = true;
                    this.renderError(messages, response);
                }
            },
            render: function() {
                if (!this.$el.innerHTML) {
                    if (this.options.autoPause && this.children.autoPause) {
                        this.children.autoPause.render().appendTo(this.$el);
                    }
                    if(this.$('.jobstatus-control-grouping').length === 0) {
                        var rightSideButtons = this.compiledTemplate({});
                        this.$el.append(rightSideButtons);
                    }

                    if (this.options.showControls) {
                        this.children.controls.render().appendTo(this.$('.jobstatus-control-grouping'));
                    }

                    if(this.options.showJobButtons !== false) {
                        this.children.buttons.render().appendTo(this.$('.jobstatus-control-grouping'));
                    }

                    if (this.options.enableSearchMode) {
                        this.children.searchMode.render().appendTo(this.$('.jobstatus-control-grouping'));
                    }

                    this.children.count.render().appendTo(this.$('.jobstatus-status-grouping'));
                    if (this.options.enableSamplingMode) {
                        this.children.samplingMode.render().appendTo(this.$('.jobstatus-status-grouping'));
                    }

                    this.children.progress.render().appendTo(this.$el);
                }

                if (this.jobHasRenderableError) {
                    this.renderError();
                }

                return this;
            },
            renderError: function(messages, response) {
                if (this.$('.alert').html()) {
                    this.$('.alert').remove();
                }

                var link = '<a class="job_inspector" href="#">' + _('Job Inspector').t() + '</a>',
                    id = this.model.searchJob.id || _('unknown').t(),
                    error, template;

                if (splunkd_utils.messagesContainsOneOfTypes(messages, [splunkd_utils.NOT_FOUND]) || (response && response.hasOwnProperty('status') && response.status == 404)) {
                    error = splunkUtil.sprintf(_('The search job "%s" was canceled remotely or expired.').t(), id);
                } else if (this.model.searchJob.entry.content.get("isFailed")) {
                    error = splunkUtil.sprintf(_('The search job has failed due to an error. You may be able view the job in the %s.').t(), link);
                }

                if (error) {
                    template = _.template(this.errorTemplate, {
                        _: _,
                        link: link,
                        splunkUtil: splunkUtil,
                        error: error
                    });
                    this.$el.prepend(template);
                }
                return this;
            },
            template: '\
                <div class="clearfix">\
                    <div class="pull-left jobstatus-status-grouping"></div>\
                    <div class="pull-right jobstatus-control-grouping"></div>\
                </div>\
            ',
            errorTemplate: '\
                <div class="alert alert-error">\
                    <i class="icon-alert"></i>\
                    <%= error %>\
                </div>\
            '
        });
    }
);
