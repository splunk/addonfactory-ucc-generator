/**
 * This is a simple abstraction of a comfirmation dialog with the following features:
 *  headerTitle: Title for the dialog (default : Confirmation dialog)
 *  buttonTitle: button label (default : Submit)
 *
 *  makeRequest: This method needs to be overridden to make the actual ajax request
 *  getBodyContent: This should return the body of the dialog, default implementation is to compile
 *                  the template
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/Modal'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        FlashMessagesCollection,
        FlashMessagesView,
        Modal
    ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            defaultErrorMessage: _('An error occurred. Please exit and try again later.').t(),
            headerTitle: _('Confirmation Dialog').t(),
            buttonTitle: _('Submit').t(),
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                this.collection.flashMessages = new FlashMessagesCollection();

                this.children.flashMessages = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });
            },

            events: {
                'click .submit-btn': function(e) {
                    e.preventDefault();
                    this.makeRequest();
                }
            },

            /**
             * Override this method to make the actual ajax request
             */
            makeRequest: function() {
                return;
            },

            /**
             * return the body content , override if the body content needs some additional construction.
             * @returns {*}
             */
            getBodyContent: function() {
                return this.compiledTemplate();
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.headerTitle);
                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);
                this.$(Modal.BODY_SELECTOR).append(this.getBodyContent());

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<button class="btn btn-primary modal-btn-primary pull-right submit-btn">' + this.options.buttonTitle + '</button>');
                return this;
            }
        });
    }
);