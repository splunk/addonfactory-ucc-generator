// displays Splunk input properties for monitor
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

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.host = new ControlGroup({
                className: 'host control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'host',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('host'),
                tooltip: this.model.getTooltip('host')
            });

            this.children.index = new ControlGroup({
                className: 'index control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'index'
                },
                label: this.model.getLabel('index'),
                tooltip: this.model.getTooltip('index')
            });

            this.children.sourcetype = new ControlGroup({
                className: 'sourcetype control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'sourcetype',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('sourcetype'),
                tooltip: this.model.getTooltip('sourcetype')
            });

        },
        
        render: function () {
            this.$el.append(this.children.host.render().el);
            this.$el.append(this.children.index.render().el);
            this.$el.append(this.children.sourcetype.render().el);
            return this;
        }
    });
});
