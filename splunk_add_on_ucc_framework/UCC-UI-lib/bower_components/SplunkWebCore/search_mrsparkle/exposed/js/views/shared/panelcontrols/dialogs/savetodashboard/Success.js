/**
 * @author ahebert
 * @date 3/29/15
 *
 * Modal step after the prebuilt panel is added to a dashboard.
 *
 * Inspired from views/shared/reportcontrols/dialogs/dashboardpanel/Success.js
 */
define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'uri/route',
        'splunk.util'
    ],
    function(
        _, 
        module, 
        Base, 
        Modal, 
        route, 
        splunkUtil
    ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.dashboardToSave.entry.on("change:name", function(){
                    var routeToDashboard = route.page(
                        this.model.application.get('root'), 
                        this.model.application.get('locale'), 
                        this.model.application.get('app'), 
                        this.model.dashboardToSave.entry.get("name")),
                        successText = splunkUtil.sprintf(
                            _('%s has been added to %s. You may now view the dashboard.').t(),
                                this.model.panel.entry.get('name'),
                                this.model.dashboardToSave.entry.get("name"));
                    this.$("a.routeToDashboard").attr("href", routeToDashboard);
                    this.$('p.dashboard-success-message').text(successText);
                }, this);
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Your prebuilt panel has been added").t());
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate());
                this.$(Modal.FOOTER_SELECTOR).append(
                    '<a href="#" class="btn btn-primary modal-btn-primary routeToDashboard">' + _("View dashboard").t() + '</a>');

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
