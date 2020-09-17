define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        Base,
        Modal,
        route
    ) {
        return Modal.extend({
            moduleId: module.id,

            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, Modal.prototype.events, {
                "click .cancel-button": function(e) {
                    var datasetsHref = route.datasets(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app')
                    );

                    this.$('.cancel-button').attr('href', datasetsHref);
                }
            }),

            render: function() {
                var header = _('Edit Table').t(),
                    cancelButton = $(Modal.BUTTON_CANCEL),
                    continueButton = $(Modal.BUTTON_CONTINUE);

                cancelButton.addClass('cancel-button');
                cancelButton.removeAttr('data-dismiss');
                continueButton.addClass('continue-button');
                continueButton.addClass('pull-right btn-primary').removeClass('pull-left');

                this.$el.html($(Modal.TEMPLATE));

                this.$(Modal.HEADER_TITLE_SELECTOR).html(header);

                // Add content to body
                $(_.template(this.warningTemplate, {_: _})).appendTo(this.$(Modal.BODY_SELECTOR));
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.FOOTER_SELECTOR).append(continueButton);
                this.$(Modal.FOOTER_SELECTOR).append(cancelButton);

                return this;
            },

            warningTemplate: '\
                <div class="alert alert-warning">\
                    <i class="icon-alert"></i>\
                    <%- _("This table is accelerated. If you edit this table, the Splunk platform will rebuild its acceleration summary after you save it.").t() %>\
                </div>\
            '
        });
    }
);
