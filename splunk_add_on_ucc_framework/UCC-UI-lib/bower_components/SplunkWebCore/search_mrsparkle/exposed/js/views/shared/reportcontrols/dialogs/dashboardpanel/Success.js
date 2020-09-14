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

                this.model.dashboardToSave.entry.on("change:name", function(){
                    var routeToDashboard = route.page(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), this.model.dashboardToSave.entry.get("name")),
                        successText = splunkUtil.sprintf(_('The panel has been created and added to %s. You may now view the dashboard.').t(), this.model.dashboardToSave.entry.get("name"));
                    this.$("a.routeToDashboard").attr("href", routeToDashboard);
                    this.$('p.dashboard-success-message').text(successText);
                }, this);
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Your Dashboard Panel Has Been Created").t());
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary routeToDashboard">' + _("View Dashboard").t() + '</a>');

                return this;
            },
            focus: function() {
                this.$('.btn-primary').focus();
            },
            template: '\
                <p class="dashboard-success-message">\
                </p>\
                '
        });
    }
);
