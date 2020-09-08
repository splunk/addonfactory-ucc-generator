/**
 * Created by rtran on 5/26/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup'
], function($, _, Backbone, module, BaseView, ControlGroup) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'modal-step form-horizontal',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

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
        },

        render: function() {
            this.$el.append(this.children.index.render().el);
        }
    });
});