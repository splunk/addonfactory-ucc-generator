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
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-fill-values',
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
                    },
                    multiselect: false
                });

                this.children.defaultValue = new ControlGroup({
                    controlType: 'Text',
                    size: 'small',
                    label: _("Default value").t(),
                    controlClass: 'controls-fill',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'fillValue',
                        updateOnKeyUp: true,
                        placeholder: '0'
                    }
                });

                this.children.fillType = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    size: 'small',
                    controlClass: 'controls-fill',
                    label: _('Fill type').t(),
                    controlOptions: {
                        modelAttribute: 'fillType',
                        model: this.model.command,
                        items: [
                            {
                                label: _('Fill null').t(),
                                value: 'null'
                            },
                            {
                                label: _('Fill empty').t(),
                                value: 'empty'
                            },
                            {
                                label: _('Fill both').t(),
                                value: 'both'
                            }
                        ]
                    }
                });
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));

                this.$sectionField = this.$('.commandeditor-section-field');
                this.children.listPicker.render().appendTo(this.$sectionField);
                this.children.defaultValue.render().appendTo(this.$sectionField);
                this.children.fillType.render().appendTo(this.$sectionField);
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
