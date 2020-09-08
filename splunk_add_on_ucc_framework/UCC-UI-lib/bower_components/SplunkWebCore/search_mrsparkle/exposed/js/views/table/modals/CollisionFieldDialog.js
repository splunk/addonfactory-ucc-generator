define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/Modal'
    ],
    function(
        _,
        $,
        module,
        Modal
    ) {
        return Modal.extend({
            moduleId: module.id,
            BUTTON_OK: '<a href="#" class="btn btn-primary pull-right" data-dismiss="modal">' + _('OK').t() + '</a>',

            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
            },
            
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_SELECTOR).html('');
                this.$(Modal.BODY_SELECTOR).html(this.options.message);
                this.$(Modal.FOOTER_SELECTOR).append(this.BUTTON_OK);

                return this;
            }
        });
    }
);