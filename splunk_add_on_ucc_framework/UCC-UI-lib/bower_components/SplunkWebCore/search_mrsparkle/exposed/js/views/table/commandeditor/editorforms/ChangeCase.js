define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/commands/Base',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseCommandModel,
        BaseEditorView,
        ListOverlayControl,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-changecase',
            initializeEmptyRequiredColumn: true,
            
            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);
                this.children.fieldPicker = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    label: _('Field').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.at(0),
                        modelAttribute: 'id',
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectedValues: this.model.command.requiredColumns.pluck('id'),
                            selectMessage: _('Select a field...').t()
                        },
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.caseRadio = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    size: 'small',
                    controlClass: 'controls-fill',
                    label: _('Case').t(),
                    controlOptions: {
                        modelAttribute: 'toUpper',
                        model: this.model.command,
                        items: [
                            {
                                label: _('abc').t(),
                                value: false
                            },
                            {
                                label: _('ABC').t(),
                                value: true
                            }
                        ]
                    }
                });
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.template);

					this.children.fieldPicker.render().appendTo(this.$('.commandeditor-section'));
					this.children.caseRadio.render().appendTo(this.$('.commandeditor-section'));
                	this.appendButtons();
                    this.appendAdvancedEditorLink();
				}
                return this;
            },

            template: '<div class="commandeditor-section commandeditor-section-padded"> </div>'
        });
    }
);
