define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/commands/InitialData',
        'views/Base',
        'views/shared/FlashMessages',
        'views/table/header/Master',
        'views/table/commandsidebar/Master',
        'views/table/commandeditor/Master',
        'views/table/resultscontainer/Master',
        './Master.pcss'
    ],
    function(
        $,
        _,
        module,
        InitialDataModel,
        BaseView,
        FlashMessagesView,
        HeaderView,
        CommandSidebarView,
        CommandEditorView,
        ResultsContainerView,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'table-builder',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.header = new HeaderView({
                    model: {
                        application: this.model.application,
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob,
                        table: this.model.table,
                        tablePristine: this.model.tablePristine,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        state: this.model.state
                    },
                    collection: {
                        roles: this.collection.roles
                    }
                });

                this.children.commandSidebar = new CommandSidebarView({
                    model: {
                        application: this.model.application,
                        table: this.model.table,
                        state: this.model.state
                    }
                });

                this.children.commandEditor = new CommandEditorView({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        config: this.model.config,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        serverInfo: this.model.serverInfo,
                        table: this.model.table,
                        tableAST: this.model.tableAST,
                        user: this.model.user,
                        currentPointJob: this.model.currentPointJob
                    },
                    collection: {
                        appLocals: this.collection.appLocals,
                        searchBNFs: this.collection.searchBNFs
                    }
                });

                this.children.resultsContainerView = new ResultsContainerView({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        config: this.model.config,
                        currentPointJob: this.model.currentPointJob,
                        dataSummaryJob: this.model.dataSummaryJob,
                        dataSummaryResultJsonRows: this.model.dataSummaryResultJsonRows,
                        dataSummarySummary: this.model.dataSummarySummary,
                        dataSummaryTimeline: this.model.dataSummaryTimeline,
                        dataSummaryTimeRange: this.model.dataSummaryTimeRange,
                        resultJsonRows: this.model.resultJsonRows,
                        searchPointJob: this.model.searchPointJob,
                        state: this.model.state,
                        table: this.model.table,
                        tableAST: this.model.tableAST,
                        user: this.model.user
                    },
                    collection: {
                        times: this.collection.times
                    }
                });

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        table: this.model.table
                    },
                    helperOptions: {
                        postProcess: this.errorPostProcessing
                    }
                });

                // TODO: When everyone moves to activate/deactivate and do not have
                //       activate in initialize, we will not have to do this.
                _.each(this.children, function(child, key) {
                    child.deactivate({ deep: true });
                });
            },

            activate: function(options) {
                var optionsClone = $.extend(true, {}, options || {});
                optionsClone.deep = false;
                
                if (this.active) {
                    return BaseView.prototype.activate.call(this, optionsClone);
                }

                this.manageStateOfChildren();

                return BaseView.prototype.activate.call(this, optionsClone);
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'change:initialDataState', this.manageStateOfChildren);
            },

            manageStateOfChildren: function() {
                this.children.header.activate({ deep: true });
                if (this.model.table.error.get('messages')) {
                    this.children.flashMessages.activate({ deep: true }).$el.show();
                    this.children.commandSidebar.deactivate({ deep: true }).$el.hide();
                    this.children.commandEditor.deactivate({ deep: true }).$el.hide();
                    this.children.resultsContainerView.deactivate({ deep: true }).$el.hide();
                } else {
                    this.children.flashMessages.deactivate({ deep: true }).$el.hide();
                    if (this.model.state.get('initialDataState') === InitialDataModel.STATES.EDITING) {
                        this.children.commandSidebar.deactivate({ deep: true }).$el.hide();
                        this.children.resultsContainerView.deactivate({ deep: true }).$el.hide();
                        this.children.commandEditor.activate({ deep: true });
                    } else {
                        this.children.commandSidebar.activate({ deep: true }).$el.css('display', 'flex');
                        this.children.resultsContainerView.activate({ deep: true }).$el.css('display', 'flex');
                        this.children.commandEditor.activate({ deep: true });
                    }
                }
            },

            errorPostProcessing: function(allMessages) {
                if (allMessages.length) {
                    return [{
                        type: allMessages[0].get('type'),
                        html: _("We cannot find the dataset you are looking for.\nPlease use the navigation above to continue.").t()
                    }];
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate());
                if (this.model.table.error.get('messages')) {
                    this.children.flashMessages.render().appendTo(this.$('.content-container'));
                    this.children.flashMessages.$el.css('display', 'flex');
                } else {
                    this.children.header.render().prependTo(this.$el);
                    this.children.commandSidebar.appendTo(this.$('.content-container'));
                    this.children.commandEditor.appendTo(this.$('.content-container'));
                    this.children.resultsContainerView.render().appendTo(this.$('.content-container'));

                    this.manageStateOfChildren();
                }
                return this;
            },

            template: '\
                <div class="content-container"></div>\
            '
        });
    }
);
