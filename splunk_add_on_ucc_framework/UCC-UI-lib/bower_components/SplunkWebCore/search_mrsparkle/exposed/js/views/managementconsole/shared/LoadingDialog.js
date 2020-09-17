/**
 * Created by rtran on 4/7/16.
 */
define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'views/shared/Modal'
], function($, _, module, Backbone, Modal) {
    return Modal.extend({
        moduleId: module.id,

        initialize: function(options) {
            _.defaults(options, {
                onHiddenRemove: true
            });
            Modal.prototype.initialize.call(this, options);
            this.title = this.options.title;
            this.text = this.options.text;
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).text(this.title);
            this.$(Modal.BODY_SELECTOR).text(this.text);

            return this;
        }
    });
});