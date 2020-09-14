define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseCommandModel,
        ColumnModel,
        BaseEditorView,
        ListOverlayControl,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-duplicate',
            initializeEmptyRequiredColumn: true,
            
            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                // We check to make sure the current newFieldName is not the name of a field in the table
                if (!this.model.commandPristine.isComplete()) {
                    this.setCollidingFieldNames();
                    if (this.model.command.get('collisionFields') && this.model.command.get('collisionFields').length) {
                        this.model.command.set('newFieldName', '');
                        this.model.command.unset('collisionFields');
                    }
                }

                this.children.field = new ControlGroup({
                    label: _('Field').t(),
                    controlType: 'ListOverlay',
                    controlTypes: { 'ListOverlay': ListOverlayControl },
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.first(),
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
                var requiredColumnId = this.model.command.requiredColumns.first() && this.model.command.requiredColumns.first().id,
                    requiredColumnInCollection = this.model.command.columns.get(requiredColumnId),
                    columnType = requiredColumnInCollection && requiredColumnInCollection.get('type');

                // There can be only one _RAW and only one _TIME typed column in the table
                if (columnType === ColumnModel.TYPES._RAW) {
                    columnType = ColumnModel.TYPES.STRING;
                } else if (columnType === ColumnModel.TYPES._TIME) {
                    columnType = ColumnModel.TYPES.EPOCH_TIME;
                }

                this.addNewField({ type: columnType });
                BaseEditorView.prototype.handleApply.call(this, options);
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.template);

                    this.appendButtons();
                    this.appendAdvancedEditorLink();

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
