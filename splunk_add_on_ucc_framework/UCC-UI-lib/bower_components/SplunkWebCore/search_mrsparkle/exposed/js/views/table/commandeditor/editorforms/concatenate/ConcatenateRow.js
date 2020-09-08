define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/TextControl',
        'views/table/commandeditor/listpicker/Control'
    ],
    function(
        _,
        module,
        BaseView,
        TextControl,
        ListPickerControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group-sortable',
            attributes: function() {
                return {
                    'id': this.model.id
                };
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                if (_.isUndefined(this.model.get('text'))) {
                    this.children.fieldPicker = new ListPickerControl({
                        listOptions: {
                            items: this.options.fieldPickerItems,
                            selectedValues: [this.model.get('columnGuid')],
                            size: 'small',
                            multiselect: false,
                            selectMessage: _('Select a field...').t()
                        },
                        model: this.model,
                        modelAttribute: 'columnGuid',
                        toggleClassName: '',
                        className: ListPickerControl.prototype.className + ' commandeditor-group-label',
                        size: 'small'
                    });
                } else {
                    this.children.concatenateString = new TextControl({
                        model: this.model,
                        modelAttribute: 'text',
                        updateOnKeyUp: true,
                        placeholder: _('insert string...').t(),
                        trimLeadingSpace: false,
                        trimTrailingSpace: false,
                        additionalClassNames: 'concatenate-string'
                    });
                }
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.trigger('removeRow', { id: this.model.id });
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate());

                if (this.children.fieldPicker) {
                    this.children.fieldPicker.render().appendTo(this.$el);
                } else {
                    this.children.concatenateString.render().appendTo(this.$el);
                }

                return this;
            },

            template: '\
                <a class="commandeditor-group-remove"><i class="icon-x"></i></a>\
            '
        });
    }
);