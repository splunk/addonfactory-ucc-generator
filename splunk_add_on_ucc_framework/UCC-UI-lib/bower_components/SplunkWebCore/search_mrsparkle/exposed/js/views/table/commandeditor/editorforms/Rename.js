define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ListOverlayControl,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-rename',
            initializeEmptyRequiredColumn: true,

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                var requiredColumn = this.model.command.requiredColumns.at(0);

                this.children.field = new ControlGroup({
                    label: _('Field').t(),
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    size: 'small',
                    controlOptions: {
                        model: requiredColumn,
                        modelAttribute: 'id',
                        toggleClassName: 'btn-overlay-toggle',
                        selectMessage: _('Select a field...').t(),
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectMessage: _('Select a field...').t()
                        }
                    },
                    multiselect: false
                });
                
                this.children.newFieldName = new ControlGroup({
                    label: _('New name').t(),
                    controlType: 'Text',
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'newFieldName',
                        updateOnKeyUp: true
                    }
                });
                
            },

            handleApply: function(options) {
                var newFieldName = this.model.command.get('newFieldName'),
                    requiredColumnId = this.model.command.requiredColumns.first() && this.model.command.requiredColumns.first().id,
                    previousCommand = this.model.table.commands.getPreviousCommand(this.model.commandPristine);
                
                if (requiredColumnId) {
                    // Unlike other commands, rename must lookup the original name from the previous command to generateSPL().
                    // handleApply() in Base calls updateSPL() on the working model and the working model cannot get the previous command because it's not in a collection.
                    // Therefore previous command needs to be looked up here and then passed from handleApply() to updateSPL() to generateSPL().
                    options = options || {};
                    options.updateSPLOptions = {
                        previousCommand: previousCommand
                    };

                    this.model.command.columns.reset(previousCommand.columns.toJSON());
                    this.model.command.columns.get(requiredColumnId).set('name', newFieldName);
                }

                BaseEditorView.prototype.handleApply.call(this, options);
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.template);

                    this.appendButtons();

                    this.children.field.render().appendTo(this.$(".commandeditor-section-padded"));
                    this.children.newFieldName.render().appendTo(this.$(".commandeditor-section-padded"));
                }
                
                return this;
            },

            template: '\
                <div class="commandeditor-section-padded"></div>\
            '
        });
    }
);
