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
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-remove-non-numerical-values',
            initializeEmptyRequiredColumn: true,

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.listPicker = new ControlGroup({
                    label: _('Field').t(),
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
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
                    }
                });
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));

                this.children.listPicker.render().appendTo(this.$('.commandeditor-section-field'));
                this.appendButtons();
                this.appendAdvancedEditorLink();
                return this;
            },

            template: '\
                <div class="commandeditor-section-padded commandeditor-section-field"></div>\
            '
        });
    }
);
