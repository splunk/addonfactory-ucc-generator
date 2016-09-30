/*global define,$*/
define([
    'underscore',
    'views/shared/controls/CheckboxGroup',
    'views/shared/controls/SyntheticCheckboxControl'
], function (
    _,
    CheckboxGroup,
    SyntheticCheckboxControl
) {
    return CheckboxGroup.extend({
        setItems: function (items, render) {
            this._checkboxes = [];
            render = render || true;
            this.options.items = items;
            _.each(this.options.items, function (value) {
                var syntheticCheckboxControl = new SyntheticCheckboxControl({
                    model: this._selections,
                    modelAttribute: value.value,
                    label: _($.trim(value.label) || value.value || '').t()
                });
                this._checkboxes.push(syntheticCheckboxControl);
            }, this);
            render && this.render();
        },
        render: function () {
            this.$el.empty();
            _.each(this._checkboxes, function (checkbox) {
                checkbox.render().appendTo(this.$el);
                checkbox.delegateEvents();
            }, this);

            this.$el.addClass(this.options.direction || 'horizontal');
            return this;
        }
    });
});
