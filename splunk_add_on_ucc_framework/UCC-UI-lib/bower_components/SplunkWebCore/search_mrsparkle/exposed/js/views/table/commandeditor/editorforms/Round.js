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
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-round',
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
                    }
                });

                this.children.decimalPlaces = new ControlGroup({
                    label: _('Decimal places').t(),
                    controlType: 'Spinner',
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'decimalPlaces',
                        updateOnKeyUp: true,
                        integerOnly: true,
                        min: 0,
                        max: 100,
                        placeholder: 0,
                        step: 1
                    }
                });

            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.template);

                    this.appendButtons();

                    this.children.field.render().appendTo(this.$(".commandeditor-section-padded"));
                    this.children.decimalPlaces.render().appendTo(this.$(".commandeditor-section-padded"));
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded"></div>\
            '
        });
    }
);
