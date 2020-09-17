define([
        'underscore',
        'module',
        'views/Base',
        'views/dataset/Title',
        'views/dataset/results/Master',
        'views/dataset/TaskBar',
        'views/shared/FlashMessages',
        './Master.pcss',
        'util/splunkd_utils'
    ],
    function(
        _,
        module,
        BaseView,
        Title,
        ResultsContainer,
        TaskBar,
        FlashMessages,
        css,
        splunkdUtils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'dataset-viewing-page',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkdUtils.FATAL, splunkdUtils.ERROR];

                this.children.flashMessages = new FlashMessages({
                    className: 'dataset-flash-messages',
                    model: {
                        dataset: this.model.dataset
                    },
                    whitelist: this.errorTypes
                });

                this.children.taskBar = new TaskBar({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        dataset: this.model.dataset,
                        searchJob: this.model.searchJob,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user
                    },
                    collection: {
                        apps: this.collection.apps,
                        roles: this.collection.roles
                    }
                });

                this.children.title = new Title({
                    model: {
                        dataset: this.model.dataset
                    }
                });

                this.children.resultsContainer = new ResultsContainer({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        config: this.model.config,
                        dataset: this.model.dataset,
                        result: this.model.result,
                        resultJsonRows: this.model.resultJsonRows,
                        searchJob: this.model.searchJob,
                        serverInfo: this.model.serverInfo,
                        state: this.model.state,
                        user: this.model.user,
                        ast: this.model.ast
                    },
                    flashMessagesHelper: this.children.flashMessages.flashMsgHelper
                });
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                this.triggerError();
                this.manageStateOfChildren();

                return BaseView.prototype.activate.call(this, clonedOptions);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }

                BaseView.prototype.deactivate.apply(this, arguments);
                this.isError = false;

                return this;
            },

            manageStateOfChildren: function() {
                if (this.isError) {
                    this.children.flashMessages.activate({ deep: true }).$el.show();
                    this.children.taskBar.deactivate({ deep: true }).$el.hide();
                    this.children.title.deactivate({ deep: true }).$el.hide();
                    this.children.resultsContainer.deactivate({ deep: true }).$el.hide();
                } else {
                    this.children.flashMessages.deactivate({ deep: true }).$el.hide();
                    this.children.taskBar.activate({ deep: true }).$el.show();
                    this.children.title.activate({ deep: true }).$el.show();
                    this.children.resultsContainer.activate({ deep: true }).$el.show();
                }
            },

            triggerError: function() {
                var didTriggerError = false;

                this.isError = splunkdUtils.messagesContainsOneOfTypes(this.model.dataset.error.get('messages'), this.errorTypes);

                if (this.model.dataset.isNew() && !this.isError) {
                    var noDatasetIdError = splunkdUtils.createSplunkDMessage(
                        splunkdUtils.FATAL,
                        _('No dataset was specified.').t()
                    );
                    this.model.dataset.trigger('error', this.model.dataset, noDatasetIdError);
                    this.isError = true;
                    didTriggerError = true;
                }

                return didTriggerError;
            },

            render: function() {
                this.$el.html(this.compiledTemplate({}));

                var $header = this.$('.section-header');

                this.children.flashMessages.render().appendTo($header);
                this.children.taskBar.render().appendTo($header);
                this.children.title.render().appendTo($header);
                this.children.resultsContainer.render().appendTo(this.$el);

                return this;
            },

            template: '\
                <div class="section-padded section-header"></div>\
            '
        });
    }
);
