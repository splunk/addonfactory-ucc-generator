define(
    [
        'jquery',
        'underscore',
        'module',
        'collections/datasets/Columns',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/table/commandeditor/editorforms/split/Delimiter',
        'views/table/commandeditor/editorforms/split/FieldRows',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        ColumnsCollection,
        BaseEditorView,
        ListOverlayControl,
        DelimiterView,
        FieldRowsView,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-split',
            initializeEmptyRequiredColumn: true,

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.fieldPicker = new ControlGroup({
                    label: _('Original field').t(),
                    controlType: 'ListOverlay',
                    controlTypes: { 'ListOverlay': ListOverlayControl },
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.first(),
                        modelAttribute: 'id',
                        toggleClassName: 'btn-overlay-toggle',
                        selectMessage: _('Select a field...').t(),
                        attachOverlayTo: '.commandeditor-form-split',
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectMessage: _('Select a field...').t()
                        }
                    }
                });

                this.children.delimiter = new DelimiterView({
                    model: {
                        command: this.model.command
                    }
                });

                this.children.newFields = new FieldRowsView({
                    model: {
                        command: this.model.command
                    }
                });
            },

            handleApply: function(options) {
                this.addNewFields();
                BaseEditorView.prototype.handleApply.apply(this, arguments);
            },

            render: function() {
                var $mainSection;
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    $mainSection = this.$('.commandeditor-section');

                    this.children.fieldPicker.activate({deep:true}).render().appendTo($mainSection);
                    this.children.delimiter.activate({deep: true}).render().appendTo($mainSection);
                    this.children.newFields.activate({deep: true}).render().appendTo($mainSection);

                    this.appendButtons();
                }
                return this;
            },

            template: '\
                <div class="commandeditor-section commandeditor-section-padded"></div>\
            '
        });
    }
);