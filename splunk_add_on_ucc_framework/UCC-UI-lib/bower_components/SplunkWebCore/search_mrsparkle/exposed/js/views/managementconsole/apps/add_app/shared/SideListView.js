/**
 * Created by rtran on 2/23/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/managementconsole/SharedInputList.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    css
) {
    return BaseView.extend({
        tagName: 'div',
        className: 'input_list',
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.collection = new Backbone.Collection(this.options.items);
            this.modelAttribute = this.options.modelAttribute;
            this.defaultValue = this.options.defaultValue;
            this.compiledItemTemplate = _.template(this.itemTemplate);

            // if attribute isn't already defined, assign it the default value
            if (!this.model.get(this.modelAttribute)) {
                this.model.set(this.modelAttribute, this.defaultValue);
            }
        },

        events: {
            'click .input_item': function(e) {
                this.select($(e.currentTarget));
            }
        },

        _removePrevSelected: function() {
            this.$('.input_item.selected').removeClass('selected');
        },

        select: function($tab) {
            var value = $tab.data('value');
            this._removePrevSelected();

            $tab.addClass('selected');
            this.model.set(this.modelAttribute, value);
        },

        render: function() {
            this.collection.each(function(listItem) {
                var $listWrapElem = $(this.compiledItemTemplate(listItem.toJSON()));
                if ($listWrapElem.find('.input_item').data('value') === this.model.get(this.modelAttribute)) {
                    $listWrapElem.find('.input_item').addClass('selected');
                }
               this.$el.append($listWrapElem);
            }, this);

            return this;
        },

        itemTemplate: '<a class="link-wrap">\
            <div class="input_item" data-value="<%- value %>">\
                <div class="input_type"><%- label %></div>\
                <div class="input_desc"><%- desc %></div>\
            </div>\
        </a>'
    });
});