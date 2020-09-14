define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/Modal'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Modal
    ) {
        return Modal.extend({
                moduleId: module.id,
            
                render: function() {
                    this.$el.html(Modal.TEMPLATE);
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.title);
                    this.$(Modal.BODY_SELECTOR).append(this.options.message);
                    this.$(Modal.BODY_SELECTOR).append('<br/><br/>');
                    this.$(Modal.BODY_SELECTOR).append(_('Bucket: ').t() + this.options.bucketId);
                    this.$(Modal.BODY_SELECTOR).append('<br/><br/>');
                    this.$(Modal.BODY_SELECTOR).append(_('Peer: ').t() + this.options.peer);
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);

                    return this;
                }
            }
        );
    }
);

