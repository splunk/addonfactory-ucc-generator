define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'views/shared/FlashMessages'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        FlashMessage
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *   model:{
        *      report: <models.services.SavedSearch>,
        *      reportPristine <models.services.SavedSearch>,
        *      application: <models.Application>,
        *      searchJob: <models.services.search.Job>
        *   }
        * }
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);

            this.model.inmem = this.model.report.clone();
            this.model.inmem.setTimeRangeWarnings(this.model.reportPristine);
            this.children.flashMessage = new FlashMessage({ model: this.model.inmem});

            this.options.routeToReport = this.options.routeToReport;
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .save_and_view': function(e) {
                e.preventDefault();

                var root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    app = this.model.application.get("app");

                this.model.inmem.save({}, {
                    success: function(model, response) {
                        window.location = this.model.inmem.routeToViewReport(root, locale, app, this.model.searchJob.id);
                        this.remove();
                    }.bind(this)
                });

            },
            'click .view': function(e) {
                e.preventDefault();

                var root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    app = this.model.application.get("app");

                this.remove();
                window.location = this.model.inmem.routeToViewReport(root, locale, app, undefined);
            }
        }),
        render: function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save Changes?").t());

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            if (this.model.reportPristine.isAlert()) {
                this.$(Modal.BODY_SELECTOR).append(_("You have made changes to the alert. Would you like to save the changes before viewing the alert?").t());
            } else {
                this.$(Modal.BODY_SELECTOR).append(_("You have made changes to the report. Would you like to save the changes before viewing the report?").t());
            }

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="view btn">' + _("Don't Save & View").t() + '</a>');
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="save_and_view btn btn-primary modal-btn-primary pull-right">' + _('Save & View').t() + '</a>');

            return this;
        }
    });
});
