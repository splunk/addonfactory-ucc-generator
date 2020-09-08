// The Review step simply instantiates the review view.
// @author: nmistry
define([
    'module',
    'views/Base',
    'views/managementconsole/data_inputs/shared/Review'
], function (
    module,
    BaseView,
    Review
) {

    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'modal-step form-horizontal',

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.review = new Review({
                model: this.model
            });
        },

        render: function () {
            this.$el.append(this.children.review.render().el);
            return this;
        }

    });
});
