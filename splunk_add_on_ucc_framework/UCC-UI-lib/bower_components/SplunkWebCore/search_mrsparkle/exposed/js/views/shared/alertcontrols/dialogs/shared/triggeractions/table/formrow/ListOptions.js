define(
    [
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(_,
        Backbone,
        module,
        Base,
        ControlGroup
    ) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'form',
            className: 'form-horizontal form-complex',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.severity = new ControlGroup({
                    className: 'control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'alert.severity',
                        model: this.model.alert.entry.content,
                        items: [
                            { label: _('Info').t(), value: 1 },
                            { label: _('Low').t(), value: 2 },
                            { label: _('Medium').t(), value: 3 },
                            { label: _('High').t(), value: 4 },
                            { label: _('Critical').t(), value: 5 }
                        ],
                        toggleClassName: 'btn',
                        labelPosition: 'outside',
                        elastic: true,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    label: _('Severity').t()
                });
            },
            render: function()  {
                this.children.severity.render().appendTo(this.$el);
                return this;
            }
        });
});
