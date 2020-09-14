define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/Modal',
        'views/shared/FlashMessages'
    ],
    function(_,
             $,
             module,
             Modal,
             FlashMessages
    ) {
        return Modal.extend({
            moduleId: module.id,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.children.flashMessages = new FlashMessages({ model: this.model.inmem });
            },

            events: _.extend({}, Modal.prototype.events, {
                "click .modal-btn-primary": function(e) {
                    this.submit();
                    e.preventDefault();
                }
            }),

            render: function() {
                var cancelButton = $(Modal.BUTTON_CANCEL);
                    cancelButton.addClass('pull-right').removeClass('pull-left');
                // Modal template
                this.$el.html(Modal.TEMPLATE);

                // Add header title
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save Table Dataset").t());

                // Add flash message to body
                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));

                // Add content to body
                $(_.template(this.warningTemplate, {_: _})).appendTo(this.$(Modal.BODY_SELECTOR));

                // Add footer buttons

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.$(Modal.FOOTER_SELECTOR).append(cancelButton);

                return this;
            },

            submit: function() {
                this.model.inmem.save({}, {
                    success: this.options.callbackFn
                });
            },

            warningTemplate: '\
                <div class="alert alert-warning">\
                    <i class="icon-alert"></i>\
                    <ul class="save-warning-text">\
                        <li><%- _("Save this table dataset so you can visualize it in Pivot.").t() %></li>\
                        <li><%- _("If you save this dataset, any changes that you have made will propagate to datasets extended from it.").t() %></li>\
                    </ul>\
                </div>\
            '
        });
    }
);