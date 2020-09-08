define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'views/shared/FlashMessages',
        'uri/route'
     ],
     function(_, module, Base, Modal, FlashMessages, route){
        return Base.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *     model: {
             *         alert: <models.Report>,
             *         user: <models.services.admin.User>, 
             *         application: <models.Application>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.children.flashMessage = new FlashMessages({ model: this.model.alert });
                this.listenTo(this.model.alert, 'change:' + this.model.alert.idAttribute, this.render);
            },
            render: function() {
                var routeToAlert = route.alert(this.model.application.get('root'),
                                     this.model.application.get('locale'),
                                     this.model.application.get("app"),
                                     {data: {s: this.model.alert.id}}),
                    canScheduleSearch = this.model.user.canScheduleSearch(),
                    canWrite = this.model.alert.canWrite(canScheduleSearch, this.model.user.canRTSearch()), 
                    showTimeRangeWarning = this.model.alert.get('did_revert_time_range'); 

                if (showTimeRangeWarning) { 
                    this.model.alert.unset('did_revert_time_range'); //remove this attribute after reading it 
                }

                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Alert has been saved").t());
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    _: _,
                    route: route,
                    applicationModel: this.model.application,
                    alertId: this.model.alert.id,
                    canChangePerms: this.model.alert.entry.acl.get('can_change_perms'),
                    canWrite: canWrite, 
                    showTimeRangeWarning: showTimeRangeWarning, 
                    routeToPermissions: route.alert(this.model.application.get('root'),
                                           this.model.application.get('locale'),
                                           this.model.application.get("app"),
                                           {data: {s: this.model.alert.id, dialog: 'permissions'}}),
                    routeToType: route.alert(this.model.application.get('root'),
                                           this.model.application.get('locale'),
                                           this.model.application.get("app"),
                                           {data: {s: this.model.alert.id, dialog: 'type'}})
                }));
                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CONTINUE);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="' + routeToAlert + '" class="btn btn-primary modal-btn-primary">' + _("View Alert").t() + '</a>');

                return this;
            },
            focus: function() {
                this.$('.btn-primary').focus();
            },
            template: '\
                <div class="alert-success-content-container">\
                    <% if (showTimeRangeWarning) { %>\
                        <div class="alert alert-warning">\
                            <i class="icon-alert"></i>\
                            <%- _("The time range was not updated.  Edit the ").t() %>\
                            <a href="<%- routeToType %>"><%- _("Alert Type").t() %></a>\
                            <%- _(" to modify the time range.").t() %>\
                        </div>\
                    <% } %>\
                    <p>\
                        <span class="alert-success-message">\
                        <% if (canWrite && canChangePerms) { %>\
                            <%- _("You can view your alert, change additional settings, or continue editing it.").t() %>\
                        <% } else { %>\
                            <%- _("You can view your alert, or continue editing it.").t() %>\
                        <% } %>\
                        </span>\
                    </p>\
                    <% if (canWrite && canChangePerms) { %>\
                        <p><%- _("Additional Settings:").t() %></p>\
                        <ul>\
                            <li><a href="<%- routeToPermissions %>"><%- _("Permissions").t() %></a></li>\
                        </ul>\
                    <% } %>\
                </div>\
            '
        });
    }
);
