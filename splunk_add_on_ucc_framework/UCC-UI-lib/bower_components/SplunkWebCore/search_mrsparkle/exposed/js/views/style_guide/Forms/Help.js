define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'models/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        BaseModel,
        ControlGroup
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.model = new BaseModel();

                this.children.helpView = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'helpInput'
                    },
                    help: 'Some helpful information',
                    label: _('Input with Help Block').t()
                });

                this.children.inputView = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'helpTooltip'
                    },
                    tooltip: 'SURPRISE, A TOOLTIP!',
                    label: _('Input with Tooltip').t()
                });
            },

            render: function() {
                this.eachChild(function(view) {
                    view.render().appendTo(this.$el);
                }, this);

                return this;
            }
        });
    }
);
