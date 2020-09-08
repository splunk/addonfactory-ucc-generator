/**
 * @author jszeto
 * @date 2/15/13
 *
 * Displays a label and has a remove button
 *
 * Input:
 *      item {
 *          label {String} - string to display on the button
 *          value {String} - string representing the value of the button
 *      }
 *
 * @fires RemovableItem#removeItem
 *
 * TODO [JCS] Move this into the shared components directory?
 */
define(
    [
        'underscore',
        'views/Base',
        'module'
    ],
    function(
        _,
        BaseView,
        module
        )
    {
        var CONSTS = {VALUE_SELECTOR: ".item", VALUE_ATTR: "data-item-value"};


        return BaseView.extend({
            moduleId: module.id,
            className: 'removable-item',

            events: {
                'click .remove-button': function(e) {
                    e.preventDefault();
                    /**
                     * Remove this item
                     *
                     * @event RemovableItem#removeItem
                     * @param {object} value of the removed item
                     */
                    this.trigger('removeItem',this.item.value);
                }
            },

            /**
             * @constructor
             * }
             */

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                options = options || {};

                _(options).defaults({allowSorting:false});

                this.$el.addClass(options.className);

                this.allowSorting = options.allowSorting;

                this.item = options.item;
            },

            render: function() {
                var html = _(this.template).template({item: this.item, allowSorting: this.allowSorting});
                this.$el.html(html);

                return this;
            },

            template: '\
                <div class="btn-combo item" data-item-value="<%= item.value %>">\
                <div class="btn \
                    <% if (allowSorting) { %>\
                        btn-draggable\
                    <% } %>\
                     item-label" title="<%- item.label %>"><%- item.label %></div>\
                <div class="btn remove-button"><i class="icon-cancel"></i></div>\
                </div>\
                '
        }, CONSTS);

    });




