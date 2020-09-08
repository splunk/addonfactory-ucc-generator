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
        ListPickerControl
        ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group-sortable',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.children.fieldPicker = new ListPickerControl({
                    listOptions: {
                        items: this.options.fieldPickerItems,
                        selectedValues: [this.options.selectedValue],
                        size: 'small',
                        multiselect: false,
                        selectMessage: _('Select a field...').t()
                    },
                    model: this.model,
                    modelAttribute: 'id',
                    toggleClassName: '',
                    className: ListPickerControl.prototype.className + ' commandeditor-group-label',
                    size: 'small'
                });
                
                this.children.row = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    size: 'small',
                    controlClass: 'controls-fill',
                    controlOptions: {
                        modelAttribute: 'order',
                        model: this.model,
                        items: [
                            {
                                label: _('Ascending').t(),
                                value: 'ascending'
                            },
                            {
                                label: _('Descending').t(),
                                value: 'descending'
                            }
                        ]
                    }
                });
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.trigger('removeRow', { id: this.model.id });
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({}));

                this.children.fieldPicker.render().appendTo(this.$el);
                this.children.row.render().appendTo(this.$el);

                this.$el.attr('id', this.model.id);

                return this;
            },

            template: '\
                <a class="commandeditor-group-remove"><i class="icon-x"></i></a>\
            '
        });
    }
);