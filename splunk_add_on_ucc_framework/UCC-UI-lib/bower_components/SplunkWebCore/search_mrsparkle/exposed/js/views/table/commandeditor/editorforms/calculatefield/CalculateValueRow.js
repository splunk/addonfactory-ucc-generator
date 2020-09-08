define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ControlGroup
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.value = new ControlGroup({
                    controlType: 'Spinner',
                    label: _('Value').t(),
                    size: 'small',
                    additionalClassNames: 'calculated-field-spinner',
                    controlOptions: {
                        model: this.model.editorValue,
                        modelAttribute: 'valueInput',
                        updateOnKeyUp: true
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
                this.children.value.render().appendTo(this.$el);
                return this;
            },

            template: '<a href="#" class="commandeditor-group-remove"><i class="icon-x" /></a>'
        });
    }
);