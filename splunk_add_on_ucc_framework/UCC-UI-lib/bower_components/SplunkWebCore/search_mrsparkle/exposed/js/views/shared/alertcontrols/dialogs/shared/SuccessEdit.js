define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'uri/route',
        'splunk.util'
     ],
     function(_, module, Base, Modal, route, splunkUtil){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            focus: function() {
                this.$('.btn-primary').focus();
            },
            render: function() {
                var routeToTriggeredAlerts = route.triggeredAlerts(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get("app")
                );
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Alert has been saved.").t());

                this.$(Modal.BODY_SELECTOR).append(this.compiledTemplate({
                    _: _,
                    triggeredAlertsAnchor: '<a href="' + routeToTriggeredAlerts +'" >' + _("Triggered Alerts").t() +'</a>',
                    splunkUtil: splunkUtil
                }));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                return this;
            },
            template: '\
                <p>\
                    <%= splunkUtil.sprintf(_("View triggered alerts via %s").t(), triggeredAlertsAnchor) %>\
                </p>\
            '
       });
    }
);
