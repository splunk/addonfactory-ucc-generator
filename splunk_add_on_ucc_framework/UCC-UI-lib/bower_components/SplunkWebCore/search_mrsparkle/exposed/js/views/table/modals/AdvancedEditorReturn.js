define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/Modal'
    ],
    function(_,
             $,
             module,
             Modal
    ) {
        return Modal.extend({
            moduleId: module.id,
            BUTTON_RETURN: '<a href="#" class="btn btn-primary modal-btn-return modal-btn-primary">' + _('Return').t() + '</a>',

            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-return': function(e) {
                    e.preventDefault();
                    this.model.state.trigger('returnToPrevious');
                    this.remove();
                }

            }),
            
            render: function() {
                // Modal template
                this.$el.html(Modal.TEMPLATE);

                // Add header title
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Return to Simple Editor").t());
                this.$(Modal.BODY_SELECTOR).html(_("Warning: Any edits made in the advanced editor may be lost.").t());

                // Add footer buttons
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(this.BUTTON_RETURN);

                return this;
            }
        });
    }
);