define(
    [
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal'
    ],
    function(
        _,
        Backbone,
        module,
        Modal
    ){
        return Modal.extend({
            moduleId: module.id,
            events: {
                'click .btn-primary': function(e) {
                    e.preventDefault();
                    this.hide();
                }
            },
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Add Cluster to be Searched").t());
                this.$(Modal.BODY_SELECTOR).append(_('Changes Saved').t());
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                return this;
            }
        });
    }
);

