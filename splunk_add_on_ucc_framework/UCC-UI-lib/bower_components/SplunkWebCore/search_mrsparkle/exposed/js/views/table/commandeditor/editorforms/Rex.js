define(
    [
        'jquery',
        'underscore',
        'module',
        'collections/datasets/Columns',
        'views/table/commandeditor/editorforms/Base',
        'views/table/modals/regexbuilder/Master',
        'views/shared/controls/ControlGroup',
        'models/datasets/commands/Base'
    ],
    function(
        $,
        _,
        module,
        ColumnsCollection,
        BaseEditorView,
        RegexBuilderView,
        ControlGroup,
        BaseCommandModel
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-rex',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                if (this.model.command.isNew()) {
                    this.createRegexBuilderModal();
                } else {
                    this.showTableBuilder();
                }

                this.children.newFieldName = new ControlGroup({
                    controlType: 'Text',
                    label: _('Extracted Field Name').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'newFieldName'
                    }
                });

                this.children.startAfterLabel = new ControlGroup({
                    controlType: 'Text',
                    label: _('Start After...').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'regExpStarting'
                    }
                });

                this.children.extractLabel = new ControlGroup({
                    controlType: 'Text',
                    label: _('Extract...').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'regExpExtraction'
                    }
                });

                this.children.stopBeforeLabel = new ControlGroup({
                    controlType: 'Text',
                    label: _('Stop Before...').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'regExpStopping'
                    }
                });
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .commandeditor-edit:not(.disabled)': function() {
                    this.children.regexBuilder = new RegexBuilderView({
                        model: {
                            command: this.model.command,
                            commandPristine: this.model.commandPristine,
                            resultJsonRows: this.model.resultJsonRows,
                            table: this.model.table,
                            application: this.model.application,
                            currentPointJob: this.model.currentPointJob
                        },
                        fieldName: this.model.command.getFieldNameFromGuid(this.model.command.requiredColumns.first().id),
                        isEditing: true
                    });

                    this.children.regexBuilder.activate({ deep: true }).render().$el.appendTo('body');
                }
            }),

            startListening: function(options) {
                this.listenTo(this.model.command, 'handleApply', this.handleApply);
                this.listenTo(this.model.command, 'commandAborted', this.handleAbort);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseEditorView.prototype.deactivate.apply(this, arguments);
                }
                BaseEditorView.prototype.deactivate.apply(this, arguments);

                if (this.children.regexBuilder) {
                    this.children.regexBuilder.deactivate({ deep: true }).remove();
                }

                this.showTableBuilder();

                return this;
            },

            handleApply: function(options) {
                this.addNewField();
                this.showTableBuilder();
                BaseEditorView.prototype.handleApply.apply(this, arguments);
            },

            handleAbort: function() {
                if (!this.model.command.isComplete()) {
                    // If the command is not yet complete, then remove it from the commands collection
                    this.model.table.commands.remove(this.model.table.commands.last());
                } else {
                    // If the command is complete, then we discard the working changes
                    this.model.command.setFromCommandJSON(this.model.commandPristine.toJSON());
                }
                this.showTableBuilder();
            },

            // Have to hide main contents when opening modal and reshow them when closing modal due to Chrome bug
            // that displays scrollbars for command history and scroll table wrapper even when Modal is opened over them.
            showTableBuilder: function() {
                $('.table-builder').css('display', 'flex');
            },

            hideTableBuilder: function() {
                $('.table-builder').hide();
            },

            createRegexBuilderModal: function() {
                var selectedColumnGuid = this.model.table.selectedColumns.at(0).get('id'),
                    fieldName = this.model.table.getCurrentCommandModel().getFieldNameFromGuid(selectedColumnGuid),
                    requiredColumnPresent = this.model.command.requiredColumns.first() && this.model.command.requiredColumns.first().id;

                if (requiredColumnPresent) {
                    if (this.children.regexBuilder)  {
                        this.children.regexBuilder.deactivate({ deep: true }).remove();
                    }

                    this.children.regexBuilder = new RegexBuilderView({
                        model: {
                            command: this.model.command,
                            commandPristine: this.model.commandPristine,
                            resultJsonRows: this.model.resultJsonRows,
                            table: this.model.table,
                            application: this.model.application,
                            currentPointJob: this.model.currentPointJob
                        },
                        fieldName: fieldName
                    });

                    this.children.regexBuilder.activate({ deep: true }).render().$el.appendTo('body');
                    this.hideTableBuilder();
                }
            },

            toggleEditButton: function() {
                var $editButton = this.$('.commandeditor-edit');

                if (this.isError) {
                    $editButton.addClass('disabled');
                } else {
                    $editButton.removeClass('disabled');
                }
            },

            render: function() {
                var requiredColumnPresent = this.model.command.requiredColumns.first() && this.model.command.requiredColumns.first().id;
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _,
                    helpLink: this.getHelpLink('learnmore.about.regex')
                }));

                this.children.stopBeforeLabel.render().prependTo(this.$(".commandeditor-section-padded"));
                this.children.extractLabel.render().prependTo(this.$(".commandeditor-section-padded"));
                this.children.startAfterLabel.render().prependTo(this.$(".commandeditor-section-padded"));
                this.children.newFieldName.render().prependTo(this.$(".commandeditor-section-padded"));

                this.children.newFieldName.disable();
                this.children.startAfterLabel.disable();
                this.children.extractLabel.disable();
                this.children.stopBeforeLabel.disable();

                this.$el.append(BaseEditorView.BUTTON_EDIT);
                this.toggleEditButton();

                this.appendAdvancedEditorLink();
                if (!requiredColumnPresent) {
                    this.$('.advanced-editor-link').addClass('disabled');
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded">\
                    <a class="external commandeditor-help-link" target="_blank" href=<%- helpLink %>><%- _("Learn more").t() %></a>\
                </div>\
            '
        });
    }
);