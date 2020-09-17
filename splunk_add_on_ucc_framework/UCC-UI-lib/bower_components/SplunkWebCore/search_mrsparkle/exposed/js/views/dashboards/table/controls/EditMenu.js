define(
    [
        'underscore',
        'module',
        'jquery',
        'views/Base',
        'views/shared/PopTart',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/dashboards/table/controls/SchedulePDF',
        'views/dashboards/table/controls/EditTitle',
        'views/shared/dialogs/TextDialog',
        'splunk.util',
        'uri/route',
        'views/dashboards/table/controls/CloneDashboard',
        'views/dashboards/table/controls/ConvertDashboard',
        'models/search/Dashboard',
        'models/ACLReadOnly'
    ],
    function(
        _,
        module,
        $,
        BaseView,
        PopTartView,
        PermissionsDialog,
        SchedulePDF,
        EditTitleDialog,
        TextDialog,
        splunkUtils,
        route,
        CloneDialog,
        ConvertDialog,
        DashboardModel,
        ACLReadOnlyModel
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *     model: {
             *         dashboard: <models.services.data.ui.View>,
             *         application: <models.Application>
             *         scheduledView: <models.services.ScheduledView>,
             *         userPref: <models.services.data.UserPrefGeneral>, 
             *         user: <models.service.admin.user>
             *     },
             *     collection: {
             *          roles: <collections.services.authorization.Roles>,
             *          dashboards: <collections.Dashboards>,
             *          appLocalsUnfiltered: <collections.services.AppLocals>
             *     }
             * }
             */
            className: 'dropdown-menu',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.delete': function(e){
                    e.preventDefault();
                    var deleteDialog = new TextDialog({id: "modal_delete"});
                    //override DialogBase dialogShown to put focus on the Delete button
                    deleteDialog.dialogShown =  function() {
                        this.trigger("show");
                        // Apply focus to the first text input in the dialog. [JCS] Doesn't work without doing a debounce. Not sure why.
                        _.debounce(function() {
                            this.$('.btn-primary:first').focus();
                        }.bind(this), 0)();
                        return;
                    };

                    deleteDialog.settings.set("primaryButtonLabel",_("Delete").t());
                    deleteDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                    deleteDialog.settings.set("titleLabel",_("Delete Dashboard").t());
                    deleteDialog.setText(splunkUtils.sprintf(_('Are you sure you want to delete %s?').t(),
                        '<em>' + _.escape(this.model.dashboard.entry.content.get('label')) + '</em>'));

                    var dashboard = this.model.dashboard;
                    deleteDialog.on('click:primaryButton', function(){
                        dashboard.destroy({wait: true}).done(function(){
                            deleteDialog.hide();
                        });
                    }, this);
                    deleteDialog.on("hidden", function(){
                        deleteDialog.remove();
                    }, this);

                    $("body").append(deleteDialog.render().el);
                    deleteDialog.show();
                },
                'click a.edit-permissions': function(e) {
                    e.preventDefault();
                    this.openPermissionsDialog();
                },
                'click a.schedule-pdf': function(e) {
                    e.preventDefault();

                    if ($(e.currentTarget).is('.disabled')) {
                        return;
                    }

                    var scheduledView = this.model.scheduledView;

                    if(scheduledView.isNew()) {
                        var dfd = scheduledView.findByName(this.model.dashboard.entry.get('name'),
                                                         this.model.application.get('app'),
                                                         this.model.application.get('owner')),
                            that = this;
                        dfd.done(function(){
                            that.openSchedulePDFDialog();
                        });
                    } else {
                        this.openSchedulePDFDialog();
                    }
                },
                'click a.edit-title': function(e) {
                    e.preventDefault();
                    var dialog = new EditTitleDialog({
                        model: {
                            dashboardMetadata: this.model.dashboard.meta
                        },
                        onHiddenRemove: true
                    });
                    $("body").append(dialog.render().el);
                    dialog.show();
                },
                'click a.make-home': function(e) {
                    e.preventDefault();
                    this.model.userPref.entry.content.set({
                        'display.page.home.dashboardId': this.model.dashboard.get('id') 
                    });
                    this.model.userPref.save({}, {
                        success: function() {
                            window.location.href = route.home(this.model.application.get('root'), this.model.application.get('locale'));
                        }.bind(this)
                    });
                },
                'click a.clone': function(e) {
                    e.preventDefault();
                    var clone = new DashboardModel();
                    clone.fetch({
                        success: function () {
                            if(this.model.dashboard.entry.content.get('eai:type') === 'html'){
                                clone.setHTML(this.model.dashboard.entry.content.get('eai:data')); 
                            }else{
                                clone.setXML(this.model.dashboard.entry.content.get('eai:data'));
                            }
                            clone.meta.set(this.model.dashboard.meta.toJSON());
                            
                            var cloneDialog = new CloneDialog({
                                model: {
                                    dashboard: clone,
                                    acl: new ACLReadOnlyModel($.extend(true, {}, this.model.dashboard.entry.acl.toJSON())),
                                    application: this.model.application,
                                    appLocal: this.model.appLocal,
                                    state: this.model.state, 
                                    user: this.model.user,
                                    serverInfo: this.model.serverInfo
                                },
                                collection: this.collection,
                                onHiddenRemove: true
                            });

                            cloneDialog.render().show();
                        }.bind(this)
                    });
                },
                'click a.convert-to-html': function(e) {
                    e.preventDefault();

                    var dashboard = new DashboardModel();
                    dashboard.meta.set(this.model.dashboard.meta.toJSON());

                    var convertDialog = new ConvertDialog({
                        model: {
                            dashboard: dashboard,
                            currentDashboard: this.model.dashboard,
                            application: this.model.application,
                            user: this.model.user
                        },
                        collection: this.collection,
                        onHiddenRemove: true

                    });

                    convertDialog.render().show();
                }
            },
            openPermissionsDialog: function() {
                this.children.permissionsDialog = new PermissionsDialog({
                    model: {
                        document: this.model.dashboard,
                        nameModel: this.model.dashboard.entry.content,
                        user: this.model.user, 
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.roles,
                    nameLabel:  "Dashboard",
                    nameKey: 'label',
                    onHiddenRemove: true
                });

                $("body").append(this.children.permissionsDialog.render().el);
                this.children.permissionsDialog.show();
            },
            openSchedulePDFDialog: function() {
                var schedulePDF = new SchedulePDF({
                    model: {
                        scheduledView: this.model.scheduledView,
                        dashboard: this.model.dashboard,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        infoDeliveryAvailable: this.model.infoDeliveryUIControl ? this.model.infoDeliveryUIControl.infoDeliveryAvailable : false
                    },
                    onHiddenRemove: true
                });
                $("body").append(schedulePDF.render().el);
                schedulePDF.show();
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    dashboard: this.model.dashboard.isDashboard(),
                    app: this.model.application.get('app'),
                    view: this.model.dashboard.entry.get('name'),
                    returnTo: encodeURIComponent(window.location.pathname),
                    isPdfServiceAvailable: this.model.state.get('pdf_available'),
                    canWrite: this.model.dashboard.entry.acl.canWrite(),
                    canCangePerms: this.model.dashboard.entry.acl.get('can_change_perms'),
                    canEditHtml: this.model.user.canEditViewHtml(),
                    canMakeHomeDashboard: !this.model.serverInfo.isLite(),
                    removable: this.model.dashboard.entry.links.get('remove') ? true : false,
                    isXML: this.model.dashboard.isXML(),
                    isForm: this.model.dashboard.isForm(),
                    isSimpleXML: this.model.dashboard.isSimpleXML(),
                    isHTML: this.model.dashboard.isHTML(),
                    isHomeDashboard: (this.model.userPref.entry.content.get('display.page.home.dashboardId')===this.model.dashboard.get('id')),
                    isLauncherEnabled: !!this.collection.appLocalsUnfiltered.get('/servicesNS/nobody/system/apps/local/launcher'),
                    userCanSchedulePDF: this.model.user.canSchedulePDF(),
                    viewSchedulable: this.model.dashboard.canSchedulePDF(),
                    infoDeliveryAvailable: this.model.infoDeliveryUIControl ? this.model.infoDeliveryUIControl.infoDeliveryAvailable : false,
                    dashboardType: this.model.dashboard.getViewType(),
                    dashboardLink: route.page(
                           this.model.application.get("root"),
                           this.model.application.get("locale"),
                           this.model.dashboard.entry.acl.get("app"),
                           this.model.dashboard.entry.get('name')
                       ),
                    managerEditSourceLink: route.managerEdit(
                           this.model.application.get("root"),
                           this.model.application.get("locale"),
                           this.model.dashboard.entry.acl.get("app"),
                           ['data', 'ui', 'views', this.model.dashboard.entry.get('name')],
                           this.model.dashboard.id,
                           { data: { ns: this.model.dashboard.entry.acl.get("app"),
                                     redirect_override: window.location.pathname }
                           }
                       ),
                    dashboardId: this.model.dashboard.id
                });

                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(html);
                return this;
            },
            template: '\
                <% if(canWrite && isSimpleXML) { %>\
                    <ul class="first-group">\
                        <% if(isSimpleXML) { %>\
                        <li><a href="<%= dashboardLink %>/edit" class="edit-panels"><%- _("Edit Panels").t() %></a></li>\
                        <% } %>\
                         <% if (!isHTML || canEditHtml) { %>\
                        <li><a href="<%= dashboardLink %>/editxml"><%- _("Edit Source").t() %> <span class="dashboard-source-type"><%= dashboardType %></span></a></li>\
                        <% } %>\
                        <% if (isSimpleXML && canEditHtml) { %>\
                        <li><a href="#" class="convert-to-html"><%- _("Convert to HTML").t() %></a></li>\
                        <% } %>\
                    </ul>\
                <% } %>\
                <% if(canWrite && isHTML && canEditHtml) { %>\
                    <ul class="first-group">\
                        <li><a href="<%= managerEditSourceLink %>"><%- _("Edit Source").t() %> <span class="dashboard-source-type"><%= dashboardType %></span></a></li>\
                    </ul>\
                <% } %>\
                <% if(canCangePerms || (canWrite && isXML) || userCanSchedulePDF) { %>\
                <ul class="second-group">\
                    <% if(isXML && canWrite) { %>\
                    <li>\
                        <a class="edit-title" href="#"><%- _("Edit Title or Description").t() %></a>\
                    </li>\
                    <% } %>\
                    <% if(canCangePerms) { %>\
                    <li>\
                        <a class="edit-permissions" href="#"><%- _("Edit Permissions").t() %></a>\
                    </li>\
                    <% } %>\
                    <% if(userCanSchedulePDF) { %>\
                        <% if(viewSchedulable && infoDeliveryAvailable) { %>\
                        <li>\
                            <a class="schedule-pdf" href="#">\
                                <%- _("Schedule Dashboard Delivery").t() %>\
                            </a>\
                        </li>\
                        <% } else if(viewSchedulable && isPdfServiceAvailable && !infoDeliveryAvailable) { %>\
                        <li>\
                            <a class="schedule-pdf" href="#">\
                                <%- _("Schedule PDF Delivery").t() %>\
                            </a>\
                        </li>\
                        <% } else if(isForm) { %>\
                            <% if(infoDeliveryAvailable) { %>\
                                <li>\
                                    <a class="schedule-pdf disabled" href="#" title="<%- _("You cannot schedule dashboard delivery for a dashboard with form elements.").t() %>">\
                                        <%- _("Schedule Dashboard Delivery").t() %>\
                                    </a>\
                                </li>\
                            <% } else { %>\
                                <li>\
                                    <a class="schedule-pdf disabled" href="#" title="<%- _("You cannot schedule PDF delivery for a dashboard with form elements.").t() %>">\
                                        <%- _("Schedule PDF Delivery").t() %>\
                                    </a>\
                                </li>\
                            <% } %>\
                        <% } else { %>\
                            <li><a href="#" class="edit-schedule-pdf disabled"><%- _("Schedule PDF Delivery").t() %></a></li>\
                        <% } %>\
                    <% } %>\
                </ul>\
                <% } %>\
                <% if (!isHTML || canEditHtml || canWrite) { %>\
                <ul class="third-group">\
                    <% if (canMakeHomeDashboard && isSimpleXML && !isHomeDashboard && isLauncherEnabled) { %>\
                        <li><a href="#" class="make-home"><%- _("Set as Home Dashboard").t() %></a></li>\
                    <% } %>\
                    <% if ((!isHTML || canEditHtml) && app != "system") { %>\
                        <li><a href="#" class="clone"><%- _("Clone").t() %></a></li>\
                    <% } %>\
                    <% if(removable) { %>\
                        <li><a href="#" class="delete"><%- _("Delete").t() %></a></li>\
                    <% } %>\
                </ul>\
                <% } %>\
            '
        });
    }
);