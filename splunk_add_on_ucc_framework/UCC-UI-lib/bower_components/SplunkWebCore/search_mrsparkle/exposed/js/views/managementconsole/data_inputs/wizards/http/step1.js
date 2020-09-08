// displays general & advanced script inputs
// @author: lbudchekno
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

            this.children.name = new ControlGroup({
                className: 'name control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry,
                    modelAttribute: 'name'
                },
                label: this.model.getLabel('name'),
                help: this.model.getHelpText('name'),
                enabled: this.model.isNew()
            });

            this.children.source = new ControlGroup({
                className: 'source control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'source',
                    placeholder: this.model.getPlaceholder('source')
                },
                label: this.model.getLabel('source'),
                tooltip: this.model.getTooltip('source')
            });

            this.children.description = new ControlGroup({
                className: 'description control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'description',
                    placeholder: this.model.getPlaceholder('description')
                },
                label: this.model.getLabel('description'),
                tooltip: this.model.getTooltip('description')
            });

            this.children.useAck = new ControlGroup({
                className: 'useack control-group',
                controlType: 'SyntheticCheckbox',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'useACK',
                    model: this.model.entry.content
                },
                label: this.model.getLabel('useACK'),
                tooltip: this.model.getTooltip('useACK')
            });
        },

        render: function () {
            this.$el.html(_.template(this.template, {}));

            var general = this.$('.general-section');

            general.append(this.children.name.render().el);
            general.append(this.children.source.render().el);
            general.append(this.children.description.render().el);
            general.append(this.children.useAck.render().el);

            return this;
        },

        template: '<div>' +
        '<div class="general-section"></div>' +
        '</div>'
    });
});
