define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/commands/InitialData',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/initialdata/IndexesAndSourcetypesListGroup',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        InitialDataModel,
        BaseEditorView,
        IndexesAndSourcetypesListGroup,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-initial-data',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                if (this.model.table.commands.at(0).columns.length) {
                    this.model.command.set({
                        fieldsChosen: this.model.table.commands.at(0).columns.pluck('name').join(', ')
                    });
                }

                this.children.selectedMethod = new ControlGroup({
                    controlType: 'Text',
                    label: _('Selected method:').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'selectedMethod'
                    }
                });

                switch (this.model.command.get('selectedMethod')) {
                    case InitialDataModel.METHODS.DATASET:
                        this.children.chosenDataset = new ControlGroup({
                            controlType: 'Text',
                            label: _('Selected dataset:').t(),
                            size: 'small',
                            controlOptions: {
                                model: this.model.command,
                                modelAttribute: 'selectedDatasetDisplayName'
                            }
                        });

                        break;
                    case InitialDataModel.METHODS.INDEXES_AND_SOURCETYPES:
                        this.children.chosenIndexesAndSourcetypes = new IndexesAndSourcetypesListGroup({
                            collection: this.model.command.editorValues
                        });

                        break;
                    case InitialDataModel.METHODS.SEARCH:
                        this.children.search = new ControlGroup({
                            controlType: 'Textarea',
                            label: _('Search:').t(),
                            size: 'small',
                            controlOptions: {
                                model: this.model.command,
                                modelAttribute: 'baseSPL'
                            }
                        });

                        break;
                }

                this.children.fieldsChosen = new ControlGroup({
                    controlType: 'Textarea',
                    label: _('Fields chosen:').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'fieldsChosen'
                    }
                });
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .commandeditor-edit:not(.disabled)': function(e) {
                    e.preventDefault();
                    this.model.state.set('initialDataState', InitialDataModel.STATES.EDITING);
                }
            }),

            activate: function(options) {
                if (this.active) {
                    BaseEditorView.prototype.activate.apply(this, arguments);
                }

                if (!this.model.command.isComplete()) {
                    this.model.state.set('initialDataState', InitialDataModel.STATES.EDITING);
                }

                return BaseEditorView.prototype.activate.apply(this, arguments);
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));

                this.children.selectedMethod.render().appendTo(this.$(".commandeditor-section-padded"));
                this.children.selectedMethod.disable();

                if (this.children.chosenDataset) {
                    this.children.chosenDataset.render().appendTo(this.$(".commandeditor-section-padded"));
                    this.children.chosenDataset.disable();
                }

                if (this.children.chosenIndexesAndSourcetypes) {
                    this.children.chosenIndexesAndSourcetypes.render().appendTo(this.$(".commandeditor-section-padded"));
                }

                if (this.children.search) {
                    this.children.search.render().appendTo(this.$(".commandeditor-section-padded"));
                    this.children.search.disable();
                }

                this.children.fieldsChosen.render().appendTo(this.$(".commandeditor-section-padded"));
                this.children.fieldsChosen.disable();

                this.$el.append(BaseEditorView.BUTTON_EDIT);

                return this;
            },

            template: '<div class="commandeditor-section-padded"></div>'
        });
    }
);
