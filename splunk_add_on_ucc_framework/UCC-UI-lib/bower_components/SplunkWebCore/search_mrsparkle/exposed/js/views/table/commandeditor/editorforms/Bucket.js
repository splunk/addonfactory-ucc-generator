define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/ControlGroup',
        'models/datasets/commands/Bucket'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ListOverlayControl,
        SyntheticSelectControl,
        ControlGroup,
        BucketCommand
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-bucket',
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

                this.children.timeControl = new ControlGroup({
                    size: 'small',
                    label: _('Time span').t(),
                    controlClass: 'input-append',
                    controls: [
                        {
                            type: 'Text',
                            model: this.model.command,
                            options: {
                                model: this.model.command,
                                modelAttribute: 'timeCount',
                                toggleClassName: 'btn',
                                size: 'small',
                                updateOnKeyUp: true
                            }
                        },
                        {
                            type: 'SyntheticSelect',
                            model: this.model.command,
                            options: {
                                model: this.model.command,
                                modelAttribute: 'timeScaleUnit',
                                size: 'small',
                                updateOnKeyUp: true,
                                menuWidth: 'narrow',
                                save: false,
                                toggleClassName: 'btn',
                                items: BucketCommand.TIME_SCALE_UNITS,
                                popdownOptions: {
                                    detachDialog: true
                                }
                            }
                        }
                    ]
                });
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    this.appendButtons();

                    this.children.field.render().appendTo(this.$(".commandeditor-section-padded"));
                    this.children.timeControl.render().appendTo(this.$(".commandeditor-section-padded"));
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded"></div>\
            '
        });
    }
);
