define(
    [
         'jquery',
         'underscore',
         'backbone',
         'module',
         'views/shared/Modal',
         'views/shared/FlashMessages',
         'util/splunkd_utils'
     ],
     function($, _, Backbone, module, Modal, FlashMessages, splunkd_utils){
        return Modal.extend({
            /**
             * @param {Object} options {
                    model:  <models.services.search.Job>
             *  }
             */
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                this.children.flashMessages = new FlashMessages({ model: this.model });
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.destroy({
                        success: function(model, response) {
                            this.hide();
                            this.model.unset("id");
                        }.bind(this),
                        error: function(model, response) {
                            if (response.status == splunkd_utils.NOT_FOUND) {
                                this.hide();
                                this.model.unset("id");
                            }
                        }.bind(this)
                    });
                    
                    e.preventDefault();
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Delete Job").t());

                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_FORM_SELECTOR).append("<p>" + _("Are you sure that you want to delete this job?").t() + "</p>");

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DELETE);

                return this;
            }
        });
    }
);
