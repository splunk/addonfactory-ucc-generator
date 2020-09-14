define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/table/commandeditor/listpicker/Control'
    ],
    function(
        _,
        module,
        BaseView,
        ControlGroup,
        ListOverlayControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'rangemap-field-controls',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.fieldPicker = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    label: _('Based on values of').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.at(0),
                        modelAttribute: 'id',
                        listOptions: {
                            items: this.options.fieldPickerItems,
                            selectedValues: this.model.command.requiredColumns.pluck('id'),
                            selectMessage: _('Select a field...').t()
                        },
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.newValue = new ControlGroup({
                    controlType: 'Text',
                    label: _('New range field name').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'newFieldName',
                        updateOnKeyUp: true
                    }
                });

                this.children.defaultValue = new ControlGroup({
                    controlType: 'Text',
                    label: _('Default value').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'defaultValue',
                        updateOnKeyUp: true
                    }
                });
            },

            render: function() {
                this.children.fieldPicker.render().appendTo(this.$el);
                this.children.newValue.render().appendTo(this.$el);
                this.children.defaultValue.render().appendTo(this.$el);
                return this;
            }

        });
    }
);