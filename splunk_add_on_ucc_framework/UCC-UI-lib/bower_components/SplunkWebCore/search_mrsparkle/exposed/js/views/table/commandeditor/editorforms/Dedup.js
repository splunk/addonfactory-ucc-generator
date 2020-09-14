define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Master'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ListPicker
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-removedup',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.listPicker = new ListPicker({
                    items: this.getFieldPickerItems(),
                    selectedValues: this.model.command.requiredColumns.pluck('id'),
                    multiselect: true,
                    multiselectMessage: _('Select fields...').t(),
                    size: 'small',
                    required: true
                });
            },

            render: function() {
               if (!this.$el.html()) {
                   $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                   this.children.listPicker.activate().render().appendTo(this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR));
                   this.appendButtons();
                }
                return this;
            },

            startListening: function() {
                BaseEditorView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.children.listPicker, 'selectionDidChange', this.handleSelectionChange);
            },

            handleSelectionChange: function() {
                this.model.command.resetRequiredColumns(this.children.listPicker.getSelectedValues());
            }
        });
    }
);