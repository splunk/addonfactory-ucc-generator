/**
 * @author ahebert
 * @date 3/30/15
 *
 * Success dialog after adding all prebuilt panels from same add-on to a new dashboard.
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/controls/TextControl',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'uri/route',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        TextControl,
        FlashMessage,
        Modal,
        route,
        splunkUtil
    ){
        return Modal.extend({
            moduleId: module.id,

            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.dashboard.entry.on("change:name", function(){
                    this.routeToDashboard = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        this.model.dashboard.entry.get("name"));
                    this.successText = splunkUtil.sprintf(
                            _('Your prebuilt panels have been added to %s. You may now view the dashboard.').t(),
                            this.model.dashboard.entry.get("name"));
                }, this);
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Your dashboard has been created").t());
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate());
                this.$(Modal.FOOTER_SELECTOR).append(
                    '<a href="#" class="btn btn-primary modal-btn-primary routeToDashboard">' + _("View dashboard").t() + '</a>');
                this.$("a.routeToDashboard").attr("href", this.routeToDashboard);
                this.$('p.dashboard-success-message').text(this.successText);

                return this;
            },

            template: '\
                <p class="dashboard-success-message">\
                </p>\
                '
        });
    }
);