define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/search/Report',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'uri/route',
    'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        ReportModel,
        Modal,
        FlashMessage,
        route,
        splunkUtil
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *       model: {
        *           report: <models.Report> (Optional, if you pass in a dataset instead),
        *           dataset: <models.datasets.PolymorphicDataset> (Optional, if you pass in a report instead),
        *           application: <models.Application>,
        *           controller: <Backbone.Model> (Optional)
        *       },
        *       {Boolean} deleteRedirect: (Optional) Whether or not to redirect to reports page after delete. Default is false.
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);

            this.children.flashMessage = new FlashMessage({
                model: this.model.report || this.model.dataset
            });
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                var deleteDeferred;

                if (this.model.report) {
                    deleteDeferred = this.model.report.destroy({wait: true});
                } else {
                    deleteDeferred = this.model.dataset.destroy({wait: true});
                }

                $.when(deleteDeferred).then(function() {
                    this.hide();
                    if (this.model.controller) {
                        this.model.controller.trigger('refreshEntities');
                    }
                    if (this.options.deleteRedirect) {
                        if (this.model.report) {
                            if (this.model.report.isAlert()) {
                                window.location = route.alerts(this.model.application.get("root"), this.model.application.get("locale"), this.model.application.get("app"));
                            } else {
                                window.location = route.reports(this.model.application.get("root"), this.model.application.get("locale"), this.model.application.get("app"));
                            }
                        } else {
                            window.location = route.datasets(this.model.application.get("root"), this.model.application.get("locale"), this.model.application.get("app"));
                        }

                    }
                }.bind(this));

                e.preventDefault();
            }
        }),
        render : function() {
            this.$el.html(Modal.TEMPLATE);

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            if (this.model.report) {
                if (this.model.report.isAlert()) {
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Delete Alert").t());
                } else {
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Delete Report").t());
                }
                this.$(Modal.BODY_SELECTOR).append('<span>' + splunkUtil.sprintf(_('Are you sure you want to delete %s?').t(), '<em>' + _.escape(this.model.report.entry.get('name')) + '</em>') + '</span>');
            } else {
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Delete Dataset").t());
                this.$(Modal.BODY_SELECTOR).append('<span>' + splunkUtil.sprintf(_('Are you sure you want to delete %s?').t(), '<em>' + _.escape(this.model.dataset.getFormattedName()) + '</em>') + '</span>');
            }

            
            

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);

            this.$(Modal.FOOTER_SELECTOR).append(this.compiledTemplate({
                _: _
            }));

            return this;
        },
        template: '\
            <a href="#" class="btn btn-primary"><%- _("Delete").t() %></a>\
        '
    });
});
