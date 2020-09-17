// displays Splunk input properties for monitor
// @author: lbudchenko
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

            this.children.indexes = new ControlGroup({
                className: 'indexes control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'indexes',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('indexes'),
                help: this.model.getHelpText('indexes')
            });

            this.children.index = new ControlGroup({
                className: 'index control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'index'
                },
                label: this.model.getLabel('index'),
                help: this.model.getHelpText('index')
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
            this.$el.append(this.children.indexes.render().el);
            this.$el.append(this.children.index.render().el);
            this.$el.append(this.children.sourcetype.render().el);
            return this;
        }
    });
});
