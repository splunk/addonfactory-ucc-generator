/**
 * @author jszeto
 * @date 2/19/13
 *
 * Simple view class used to display a list of items in a table
 *
 * Inputs:
 *      collection {Collection} - collection of items of any type
 *      labelAttribute {String} - attribute name for the item's label
 *      valueAttribute {String} - attribute name for the item's value
 *
 *  @fires SelectItemPopdown#itemSelected
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'module'
    ],
    function(
        $,
        _,
        Backbone,
        Base,
        module
        )
    {
        return Base.extend({
                moduleId: module.id,
                className: "select-item-popdown dropdown-menu ",

                events: {
                    'click .item-button': function(e) {
                        e.preventDefault();
                        /**
                         * Item has been selected
                         *
                         * @event SelectItemPopdown#itemSelected
                         * @param {object} value of the selected item
                         */
                        this.trigger("itemSelected",this.resolveItemValue(e.currentTarget));
                    }
                },

                // Helper function to figure out the value of the clicked item
                resolveItemValue: function(elem) {
                    return $(elem).closest('.item').attr('data-item-value');
                },

                initialize: function(options) {
                    Base.prototype.initialize.call(this, options);

                    this.collection.on("add remove reset", this.debouncedRender, this);

                    options = options || {};

                    _(options).defaults({valueAttribute:"value", labelAttribute:"label"});

                    this.valueAttribute = options.valueAttribute;
                    this.labelAttribute = options.labelAttribute;
                },

                render : function() {
                    var html = _(this.template).template({items: this.collection,
                                                          valueAttribute: this.valueAttribute,
                                                          labelAttribute: this.labelAttribute});
                    this.$el.html(html);
                },

                template: '\
                    <div class="arrow" style="margin-left: -91px;"></div>\
                    <ul>\
                        <% items.each(function(item) { %>\
                            <li class="item" data-item-value="<%- item.get(valueAttribute) %>">\
                                <a href="#" class="item-button"> <%- item.get(labelAttribute) %></a>\
                            </li>\
                        <% }); %>\
                    </ul>\
            '

            }
        );}
);
