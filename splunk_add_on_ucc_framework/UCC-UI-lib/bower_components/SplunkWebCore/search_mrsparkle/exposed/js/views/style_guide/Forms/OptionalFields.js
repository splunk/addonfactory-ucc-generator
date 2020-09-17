define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/controls/ControlGroup',
        '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseModel,
        BaseView,
        ControlGroup,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'form-horizontal',
            initialize: function() {
                BaseView.prototype.initialize.apply(this,arguments);

                this.children.inputView = new ControlGroup({
                    controlType: 'Text',
                    className: 'control-group',
                    controlOptions: {
                        modelAttribute: 'optionalText',
                        placeholder: _('Optional').t()
                    },
                    label: _('Optional Input').t()
                });

                this.children.textFieldView = new ControlGroup({
                    controlType: 'Textarea',
                    className: 'control-group',
                    controlOptions: {
                        modelAttribute: 'optionalTextArea',
                        placeholder: _('Optional').t()
                    },
                    label: _('Optional Text Area').t()
                });
            },
            render: function() {
                // Renders each child view
                this.eachChild(function(view) {
                     view.render().appendTo(this.$el);
                }, this);
                return this;
            }
        });
    }
);
