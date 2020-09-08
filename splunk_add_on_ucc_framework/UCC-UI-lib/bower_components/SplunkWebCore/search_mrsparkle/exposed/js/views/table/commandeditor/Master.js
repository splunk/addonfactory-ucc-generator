define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/PolymorphicCommand',
        'models/datasets/commands/InitialData',
        'collections/Base',
        'views/Base',
        'views/table/commandeditor/NormalCommandEditor',
        'views/table/commandeditor/AcceleratedWarning',
        'views/table/initialdata/Master',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        PolymorphicCommandModel,
        InitialDataModel,
        BaseCollection,
        BaseView,
        NormalCommandEditorView,
        AcceleratedWarningView,
        InitialDataCommandEditorView
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                this.collection.customAddedFieldPickerItems = new BaseCollection();
                BaseView.prototype.initialize.apply(this, arguments);
                if (this.model.table.isAccelerated()) {
                    this.children.acceleratedWarning = new AcceleratedWarningView({
                        model: {
                            application: this.model.application
                        }
                    });
                }
            },

            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }

                this.initializeCommandModel();
                // We can only create the command editors once this.model.command is present
                this.createCommandEditors();
                BaseView.prototype.activate.call(this, clonedOptions);
                this.render();

                return this;
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'change:initialDataState', this.manageStateOfChildren);
                this.listenTo(this.model.state, 'editorReload', this.reloadEditor);
            },

            initializeCommandModel: function() {
                var commandJSON,
                    workingAttributes = this.model.state.get('workingAttributes');

                this.model.commandPristine = this.model.table.getCurrentCommandModel();
                // Create a true deep copy of the pristine command model to use as the working model
                // (clone() only creates shallow copies of the associated collections, retaining references to the same models as before)
                if (this.model.commandPristine) {
                    this.model.command = new PolymorphicCommandModel({ type: this.model.commandPristine.get('type') });
                    commandJSON = this.model.commandPristine.toJSON();
                    if (workingAttributes) {
                        _.extend(commandJSON, workingAttributes);
                        this.model.state.unset('workingAttributes', { silent: true });
                    }
                    this.model.command.setFromCommandJSON(commandJSON);
                }
            },

            manageStateOfChildren: function() {
                if (this.model.state.get('initialDataState') === InitialDataModel.STATES.EDITING) {
                    this.children.initialDataEditor.activate({ deep: true }).$el.css('display', 'flex');
                    this.children.normalCommandEditor.deactivate({ deep: true }).$el.hide();
                } else {
                    this.children.initialDataEditor.deactivate({ deep: true }).$el.hide();
                    this.children.normalCommandEditor.activate({ deep: true }).$el.css('display', 'flex');

                    if (this.children.acceleratedWarning && !this.warningShown) {
                        this.children.acceleratedWarning.render().appendTo($('body')).show();
                        this.warningShown = true;
                    }
                }
            },

            createCommandEditors: function() {
                if (this.children.initialDataEditor) {
                    this.children.initialDataEditor.deactivate({ deep: true }).remove();
                    delete this.children.initialDataEditor;
                }

                if (this.children.normalCommandEditor) {
                    // We are intentionally not calling remove nor deleting the child reference here
                    // to avoid this.el from being blown away (see NormalCommandEditorView constructor call's el)
                    this.children.normalCommandEditor.deactivate({ deep: true });

                    // We aren't calling remove() on this view as we want to maintain its el, so we must do manual cleanup
                    // so that there are no zombie event listeners and models hanging around.
                    this.children.normalCommandEditor.undelegateEvents();
                    this.children.normalCommandEditor.$el.off();
                    this.children.normalCommandEditor.$el.html('');
                    this.children.normalCommandEditor.invokeOnChildren('remove');
                }

                this.children.initialDataEditor  = new InitialDataCommandEditorView({
                    model: {
                        application: this.model.application,
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        config: this.model.config,
                        state: this.model.state,
                        serverInfo: this.model.serverInfo,
                        table: this.model.table,
                        tableAST: this.model.tableAST,
                        user: this.model.user
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs,
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    }
                });

                this.children.normalCommandEditor = new NormalCommandEditorView({
                    el: this.el,
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        command: this.model.command,
                        commandPristine: this.model.commandPristine,
                        currentPointJob: this.model.currentPointJob,
                        config: this.model.config,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        table: this.model.table,
                        tableAST: this.model.tableAST,
                        user: this.model.user
                    },
                    collection: {
                        appLocals: this.collection.appLocals
                    }
                });
            },

            reloadEditor: function() {
                this.initializeCommandModel();
                this.createCommandEditors();
                this.render();
            },

            render: function() {
                this.children.initialDataEditor.render().appendTo(document.body);
                this.children.normalCommandEditor.render();

                this.manageStateOfChildren();

                return this;
            }
        });
    }
);
