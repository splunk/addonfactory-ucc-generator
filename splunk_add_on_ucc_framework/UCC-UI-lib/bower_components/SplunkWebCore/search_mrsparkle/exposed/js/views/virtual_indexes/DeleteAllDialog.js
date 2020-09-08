define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/Modal',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Modal,
        splunkUtil
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            /**
             * @param {Object} options {
        *       model: <models.>,
        *       collection: <collections.services.>
        * }
             */
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.trigger("deleteConfirmed");
                    this.hide();
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Delete Archives").t());
                var html = this.compiledTemplate();
                this.$(Modal.BODY_SELECTOR).append(html);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+ _('Delete').t() + '</a>');
                return this;
            },
            template: '<%- _("Are you sure you want to delete all of the selected Archives?").t() %>'

        });
    });
