define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/Table',
        'views/Base',
        'views/shared/dialogs/RiskyCommand',
        'views/shared/datasetcontrols/diversity/Master',
        'views/shared/datasetcontrols/eventlimiting/Master',
        'views/table/initialdata/jobstatus/Count',
        'uri/route',
        'splunk.window',
        'splunk.util',
        'util/splunkd_utils'
    ],
    function(
        _,
        $,
        module,
        TableModel,
        BaseView,
        RiskyCommandDialog,
        DiversityView,
        EventLimitingView,
        CountView,
        route,
        splunkwindow,
        splunkUtil,
        splunkd_utils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'initial-data-job-status',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                // Some errors should be shown but are not fatal SPL-107091
                this.fatalErrorTypes = [splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];
                this.renderableErrorTypes = [splunkd_utils.ERROR, splunkd_utils.FATAL, splunkd_utils.NOT_FOUND];

                this.children.count = new CountView({
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        searchJob: this.model.searchJob
                    }
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
                }
            },

            startListening: function() {
                this.listenTo(this.model.searchJob, 'sync error', this.updateErrorState);
                this.listenTo(this.model.searchJob.control, 'error', this.updateErrorState);
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                var searchJobMessages = this.model.searchJob.error.get('messages');

                this.hasFatalError = this.model.searchJob.entry.content.get('isFailed') ||
                    splunkd_utils.messagesContainsOneOfTypes(searchJobMessages, this.fatalErrorTypes);

                this.hasRenderableError = splunkd_utils.messagesContainsOneOfTypes(searchJobMessages, this.renderableErrorTypes);

                this.manageStateOfChildren();

                return BaseView.prototype.activate.apply(this, arguments);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }

                BaseView.prototype.deactivate.apply(this, arguments);

                this.$('.alert').remove();

                return this;
            },

            manageStateOfChildren: function() {
                if (this.hasFatalError) {
                    this.children.count.deactivate({ deep: true }).$el.hide();
                } else {
                    this.children.count.activate({ deep: true }).$el.css('display', 'inline-block');
                }

                if (this.model.basesearchTableAST.isTransforming()) {
                    this.children.eventLimiting.activate({deep: true});
                    this.children.eventLimiting.$el.css('display', 'inline-block');
                    this.children.diversity.deactivate({deep: true});
                    this.children.diversity.$el.hide();
                } else {
                    this.children.eventLimiting.deactivate({deep: true});
                    this.children.eventLimiting.$el.hide();
                    this.children.diversity.activate({deep: true});
                    this.children.diversity.$el.css('display', 'inline-block');
                }
            },

            updateErrorState: function(model, response) {
                var messages = model.error.get('messages');

                if (splunkd_utils.messagesContainsOneOfTypes(messages, [splunkd_utils.RISKY_COMMAND])) {
                    !this.riskyWarningShown && this.showRiskyWarning();
                }

                if ((model.entry && model.entry.content && model.entry.content.get('isFailed')) ||
                        splunkd_utils.messagesContainsOneOfTypes(messages, this.fatalErrorTypes)) {
                    this.hasFatalError = true;
                }

                if (splunkd_utils.messagesContainsOneOfTypes(messages, this.renderableErrorTypes)) {
                    this.hasRenderableError = true;
                    this.renderError(messages, model, response);
                }

                this.manageStateOfChildren();
            },

            render: function() {
                if (!this.$el.innerHTML) {
                    this.children.count.activate({ deep: true }).render().appendTo(this.$el);
                    this.children.diversity.activate({ deep: true }).render().appendTo(this.$el);
                    this.children.eventLimiting.activate({ deep: true }).render().appendTo(this.$el);
                }

                if (this.hasRenderableError) {
                    this.renderError();
                } else {
                    this.$('.alert').remove();
                }

                return this;
            },
            
            showRiskyWarning: function() {
                this.riskyWarningShown = true;
                this.children.riskyWarningDialog = new RiskyCommandDialog({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    onHiddenRemove: true,
                    hideInvestigateBtn: true,
                    actionableText: _("Do you still want to run the search string?").t()
                });
                this.listenToOnce(this.children.riskyWarningDialog, "runSearch", function() {
                    // continue onwards
                    this.model.state.trigger('revisitPageRoute');
                }.bind(this));
                this.listenToOnce(this.children.riskyWarningDialog, "cancel", function() {
                    // Clear out base SPL
                    this.model.state.trigger('clearBaseSearch');
                }.bind(this));
                this.children.riskyWarningDialog.render().appendTo($("body"));
                this.children.riskyWarningDialog.show();
            },

            renderError: function(messages, model, response) {
                var searchJobId = this.model.searchJob.id || _('unknown').t(),
                    errors = [],
                    template,
                    link,
                    id;

                if (splunkd_utils.messagesContainsOneOfTypes(messages, [splunkd_utils.NOT_FOUND]) ||
                        (response && response.hasOwnProperty('status') && response.status == 404)) {
                    id = model.id;

                    if (id && id.indexOf('/control') === (id.length - 8)) {
                        id = id.match(/^.*\/(.*)\/control$/)[1];

                        errors.push(splunkUtil.sprintf(_('The search job "%s" was canceled remotely or expired.').t(), id));
                    }
                }

                if (this.model.searchJob.entry.content.get('isFailed')) {
                    link = '<a class="job_inspector" href="#" data-job-id=' + searchJobId + '>' + _('Job Inspector').t() + '</a>';
                    errors.push(splunkUtil.sprintf(_('The search job has failed due to an error. You may be able view the job in the %s.').t(), link));
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
