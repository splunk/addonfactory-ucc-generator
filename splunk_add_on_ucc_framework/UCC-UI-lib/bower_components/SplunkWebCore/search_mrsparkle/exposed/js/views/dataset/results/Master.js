define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/datasetcontrols/jobstatus/Master',
        'views/shared/JobDispatchState',
        'views/shared/FlashMessages',
        'views/shared/datasettable/Master',
        'views/shared/datasetcontrols/diversity/Master',
        'views/shared/datasetcontrols/eventlimiting/Master',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        JobStatus,
        JobDispatchState,
        FlashMessages,
        TableView,
        DiversityControlsView,
        EventLimitingView,
        splunkdUtils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkdUtils.FATAL, splunkdUtils.ERROR];

                this.children.flashMessages = new FlashMessages({
                    model: {
                        ast: this.model.ast
                    },
                    whitelist: this.errorTypes
                });

                this.children.jobStatus = new JobStatus({
                    model: {
                        application: this.model.application,
                        table: this.model.dataset,
                        searchPointJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        resultJsonRows: this.model.resultJsonRows,
                        ast: this.model.ast
                    },
                    hasTimeRangePicker: false,
                    isViewingMode: true
                });

                this.children.table = new TableView({
                    model: {
                        config: this.model.config,
                        dataset: this.model.dataset,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state
                    },
                    editingMode: false,
                    useDock: true
                });
            },

            startListening: function() {
                this.listenTo(this.model.resultJsonRows, 'change', this.manageStateOfChildren);
            },

            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }

                this.manageStateOfChildren();

                return BaseView.prototype.activate.call(this, clonedOptions);
            },

            manageStateOfChildren: function() {
                var isError = splunkdUtils.messagesContainsOneOfTypes(this.model.ast.error.get('messages'), this.errorTypes);

                if (isError) {
                    this.children.flashMessages.activate({ deep: true }).$el.show();
                    this.children.jobStatus.deactivate({ deep: true }).$el.hide();
                    this.children.table.deactivate({ deep: true }).$el.hide();
                    this.children.jobDispatchState && this.children.jobDispatchState.deactivate({ deep: true }).$el.hide();
                } else {
                    this.children.flashMessages.deactivate({ deep: true }).$el.hide();
                    this.children.jobStatus.activate({ deep: true }).$el.css('display', '');
                    this.children.table.activate({ deep: true }).$el.css('display', '');

                    // Job Dispatch State must be removed and reinitialized every time on activate
                    if (this.children.jobDispatchState) {
                        this.children.jobDispatchState.deactivate({ deep: true }).remove();
                        delete this.children.jobDispatchState;
                    }
                    if (!this.model.resultJsonRows.hasRows()) {
                        this.children.jobDispatchState = new JobDispatchState({
                            model: {
                                application: this.model.application,
                                searchJob: this.model.searchJob
                            },
                            mode: this.model.ast.isTransforming() ? 'results' : ''
                        });
                        // If the view has already been rendered, then render and append. Otherwise, allow render() to do it.
                        if (this.$('.results-wrapper').length) {
                            this.children.jobDispatchState.activate({ deep: true }).render().appendTo(this.$('.results-wrapper'));
                        }
                    }
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        containsStar: this.model.dataset.getFlattenedFieldsObj().containsStar
                    }));

                    this.children.jobStatus.render().insertBefore(this.$('.results-wrapper'));
                    this.children.flashMessages.render().appendTo(this.$('.results-wrapper'));
                    this.children.table.render().appendTo(this.$('.results-wrapper'));

                    if (this.children.jobDispatchState) {
                        this.children.jobDispatchState.activate({ deep: true }).render().appendTo(this.$('.results-wrapper'));
                    }
                }

                return this;
            },

            template: '\
                <% if (containsStar) { %>\
                    <div class="alert-warning">\
                        <i class="icon-alert"></i>\
                        <%= _("There may be more fields for this dataset than are displayed here. Open this dataset in Search to explore it further.").t() %>\
                    </div>\
                <% } %>\
                <div class="results-wrapper"></div>\
            '
        });
    }
);
