// displays step1 for tcp/udp inputs
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup'
], function (
    _,
    $,
    backbone,
    module,
    BaseView,
    ControlGroup
) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'modal-step form-horizontal',

        events: {
            'click .toggle-advanced-settings': 'toggleAdvanced'
        },

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.portno = new ControlGroup({
                className: 'portno control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry,
                    modelAttribute: 'name'
                },
                label: this.model.getLabel('name'),
                tooltip: this.model.getTooltip('name'),
                help: this.model.getHelpText('name'),
                enabled: this.model.isNew()
            });

            this.children.acceptFrom = new ControlGroup({
                className: 'acceptFrom control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'acceptFrom',
                    placeholder: this.model.getPlaceholder('acceptFrom')
                },
                label: this.model.getLabel('acceptFrom'),
                tooltip: this.model.getTooltip('acceptFrom'),
                help: this.model.getHelpText('acceptFrom')
            });
        },

        render: function () {
            this.$el.html('');
            this.$el.append(this.children.portno.render().el);
            this.$el.append(this.children.acceptFrom.render().el);
            return this;
        }
    });
});
