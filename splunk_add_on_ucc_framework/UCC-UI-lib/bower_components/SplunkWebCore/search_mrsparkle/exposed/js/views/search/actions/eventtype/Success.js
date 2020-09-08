define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'views/shared/FlashMessages',
        'uri/route',
        'splunk.util'
    ],
    function(_, module, Base, Modal, FlashMessage, route, splunkUtil){
        return Base.extend({
            moduleId: module.id,
            className: 'modal',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.children.flashMessage = new FlashMessage({ model: this.model.state });
            },
            events: {
                'click .modal-footer .btn-primary' : function(e) {
                    this.model.eventType.trigger('close');
                    e.preventDefault();
                }
            },
            render: function() {
                var routeToEventType = route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get("app"),
                        ['saved','eventtypes']
                    ),
                    useSideNav = this.model.user.canUseSidenav(),
                    menuText = (useSideNav) ? _('Navigation menu').t() : _('Settings menu').t();

                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Your Event Type Has Been Created").t());
                
                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));
                
                this.$(Modal.BODY_SELECTOR).append(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil,
                    routeToEventType: routeToEventType,
                    menuText: menuText
                }));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                return this;
            },
            template: '\
                <p>\
                    <%= splunkUtil.sprintf(_(\'You can edit this event type via <a href="%s">Event Types</a> in the %s.\').t(), routeToEventType, menuText) %>\
                </p>\
            '
        });
});
