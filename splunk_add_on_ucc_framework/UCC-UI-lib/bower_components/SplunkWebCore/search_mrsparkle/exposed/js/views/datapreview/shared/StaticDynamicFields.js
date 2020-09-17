/**
 * Extends Dynamic fields control to accept list of static fields that appear
 * at top of table irrespective of rest of dynamic fields.
 *
 * @param {Object} options
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/DynamicFields'
],
function(
    $,
    _,
    Backbone,
    module,
    DynamicFieldsView
){
    return DynamicFieldsView.extend({
        moduleId: module.id,
        initialize: function() {
            var defaults = {
                staticItems: []
            };
            _.defaults(this.options, defaults);
            DynamicFieldsView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            var items = [];
            _(this.model.attributes).each(function(val,key) {
                if (this.options.prefix && key.indexOf(this.options.prefix) !== 0) {
                    return;
                }
                if (this.options.hideEmpty && (typeof val === 'string' && !val.length)) {
                    return;
                }
                if (_.contains(this.options.staticItems, key)) {
                    return;
                }
                if (!_.contains(this.options.exclude, key)) {
                    items.push([key, val]);
                }
            }.bind(this));

            _(this.options.staticItems).each(function(val, key) {
                items.unshift([val, this.model.get(val)]);
            }.bind(this));

            if (items.length === 0) {
                items.push(['', '']);
            }

            var html = this.templates.templateFields({
                newItemLink: this.options.newItemLink
            });
            this.removeChildren();
            this.$el.html(html);

            _(items).each(function(object, i) {
                var field = $(this.templates.templateField({
                    name: object[0],
                    value: object[1]
                }));
                this.$('.templates').append(field);
            }.bind(this));

            if (this.options.items.length > 0) {
                this.$('.elements').show();
                this.$('.template').show();
            }
            return this;
        }
    });
});
