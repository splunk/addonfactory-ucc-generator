define([
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'uri/route'
    ],
    function(
        _,
        module,
        Base,
        Modal,
        FlashMessages,
        route
    ) {
    return Base.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *    model: {
        *        application: <models.Application>,
        *        inmem: <models.Report>
        *    }
        * }
        */
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);
            this.children.flashMessage = new FlashMessages({ model: this.model.inmem });
        },
        events: {
            'click .routeToAlert': function(e) {
                window.location = route.alert(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id}});
                e.preventDefault();
            },
            'click .routeToPermissions': function(e) {
                window.location = route.alert(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'permissions'}});
                e.preventDefault();
            },
            'click .routeToType': function(e) {
                window.location = route.alert(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'type'}});
                e.preventDefault();
            },
            'click .routeToActions': function(e) {
                window.location = route.alert(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'actions'}});
                e.preventDefault();
            },
            'click .openInSearch': function(e) {
                window.location = route.search(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id}});
                e.preventDefault();
            }
        },
        render : function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Alert has been cloned").t());
            this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                model: this.model.inmem,
                _: _,
                route: route,
                applicationModel: this.model.application,
                alertId: this.model.inmem.id
            }));

            this.children.flashMessage.render().appendTo(this.$(Modal.BODY_SELECTOR));
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn openInSearch pull-left">' + _("Open in Search").t() + '</a>');
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary routeToAlert">' + _("View").t() + '</a>');

            return this;
        },
        template: '\
            <p><%- _("You may now view your alert, change additional settings, or edit it.").t() %></p>\
            <p>\
                <%- _("Additional Settings:").t() %>\
                <ul>\
                    <% if (model.entry.acl.get("can_change_perms")) { %>\
                        <li><a href ="#" class="routeToPermissions"><%- _("Permissions").t() %></a></li>\
                    <% } %>\
                    <li><a href ="#" class="routeToType"><%- _("Alert Type").t() %></a></li>\
                    <li><a href ="#" class="routeToActions"><%- _("Actions").t() %></a></li>\
                </ul>\
            </p>\
        '
    });
});
