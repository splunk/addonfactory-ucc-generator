define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ListPickerControl,
        ControlGroup
        ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.fieldPicker = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListPickerControl},
                    label: _('Field').t(),
                    size: 'small',
                    controlOptions: {
                        listOptions: {
                            items: this.options.listpickerItems,
                            selectedValues: [this.model.editorValue.get('columnGuid')],
                            size: 'small',
                            selectMessage: _('Select a field...').t(),
                            required: true
                        },
                        model: this.model.editorValue,
                        modelAttribute: 'columnGuid',
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.collection.editorValues.remove(this.model.editorValue);
                    this.model.state.trigger('removeRow', this);
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate());
                this.children.fieldPicker.render().appendTo(this.$el);
                return this;
            },

            template: '\
                <a class="commandeditor-group-remove"><i class="icon-x"></i></a>\
            '
        });
    }
);