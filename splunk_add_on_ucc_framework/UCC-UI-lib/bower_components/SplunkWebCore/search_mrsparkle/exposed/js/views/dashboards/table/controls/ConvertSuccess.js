define([
    'jquery',
    'underscore', 
    'module', 
    'views/shared/Modal',
    'uri/route',
    'views/shared/documentcontrols/dialogs/permissions_dialog/Master'
    ],
    function(
        $,
        _, 
        module, 
        Modal, 
        route, 
        PermissionsDialog
    )
{

    return Modal.extend({
        moduleId: module.id,
        options: {
            refreshOnDismiss: false
        },
        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);

            if (this.options.refreshOnDismiss) {
                this.on('hide hidden', function() {
                    window.location.reload();
                });
            }
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .edit-perms': function(e) {
                e.preventDefault();
                var that = this;
                var model = that.model, roles = that.collection.roles;
                _.defer(function(){
                    var permissionsDialog = new PermissionsDialog({
                        model: {
                            document: model.dashboard,
                            nameModel: model.dashboard.entry.content,
                            user: model.user
                        },
                        collection: roles,
                        nameLabel:  "Dashboard",
                        nameKey: 'label',
                        onHiddenRemove: true
                    });

                    if (that.options.refreshOnDismiss) {
                        permissionsDialog.on('hide hidden', function() {
                            window.location.reload();
                        });
                    }

                    $("body").append(permissionsDialog.render().el);
                    permissionsDialog.show();
                });

                if (that.options.refreshOnDismiss) {
                    that.off('hide hidden');
                }

                that.hide();
                that.remove();
            }
        }),
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Dashboard has been converted.").t());
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            var app = this.model.dashboard.entry.acl.get("app");
            var name = this.model.dashboard.entry.get('name');


            var link = route.page(this.model.application.get("root"), this.model.application.get("locale"),
                    app, name);

            // TODO some refactoring could be done here with editdashboard.js "Edit source" button
            var newDashboardLink = route.page(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), this.model.dashboard.entry.get('name')); 
            var editLink = "/manager/" + app + 
                    "/data/ui/views/" + name + 
                    "?action=edit&ns=" +  app + 
                    "&redirect_override=" + encodeURIComponent(newDashboardLink);

            this.$(Modal.BODY_FORM_SELECTOR).append(_.template(this.messageTemplate, {
                dashboardLink: link,
                _: _
            }));

            this.$(Modal.FOOTER_SELECTOR).append(_.template(this.buttonTemplate, {
                dashboardLink: link,
                editLink: editLink,
                _: _
            }));

            this.$(Modal.FOOTER_SELECTOR).append('');
            return this;
        },
        buttonTemplate: '<a href="<%= editLink %>" class="btn edit-panels"><%- _("Edit HTML").t() %></a>' +
                        '<a href="<%= dashboardLink %>" class="btn btn-primary modal-btn-primary"><%- _("View").t() %></a>',
        messageTemplate: '<p><%- _("You may now view your dashboard, change additional settings, or edit the HTML.").t() %></p>' +
                        '<p><%- _("Additional Settings").t() %>:' +
                            '<ul>' +
                                '<li><a href="#" class="edit-perms"><%- _("Permissions").t() %></a></li>' +
                            '</ul>' +
                        '</p>'
    });

});
