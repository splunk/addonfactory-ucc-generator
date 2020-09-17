define([
    'jquery',
    'underscore',
    'module',
    'views/shared/PopTart'
], function($, _, module, PopTart) {


    /* This view constructs a simple text dialog of line separated text.
     * options: {
     *  collection: a collection of models of the form: {text: name}
     * }
     *
     * constructs a view of the format:
     *
     *  --------
     *  | name1 |
     *  | name2 |
     *  | name3 |
     *  | name4 |
     *  ---------
     */
    return PopTart.extend({
        moduleId: module.id,

        initialize: function(options) {
            var defaults = {
                mode: 'dialog'
            };

            _.defaults(options, defaults);
            PopTart.prototype.initialize.apply(this, arguments);

            this.listenTo(this.collection, 'reset', this.debouncedRender);
        },

        render: function() {
            this.$el.html(PopTart.prototype.template);
            this.$('.popdown-dialog-body').addClass('body-content');

            this.collection.each(function(item) {
                this.$('.body-content').append(this.compiledItemTemplate({text: item.get('text')}));
            }.bind(this));
            return this;
        },

        compiledItemTemplate: _.template('<div class="list-item"><%- text %></div>')
    });
});
