define(
    [
        'module',
        'jquery',
        'underscore',
        'views/shared/PopTart',
        'views/shared/documentcontrols/dialogs/TitleDescriptionDialog',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/documentcontrols/dialogs/DeleteDialog',
        'uri/route',
        'bootstrap.modal', 
        'models/search/Dashboard',
        'views/dashboards/table/controls/ConvertDashboard', 
        'views/dashboards/table/controls/CloneDashboard', 
        'views/dashboards/table/controls/SchedulePDF', 
        'views/shared/dialogs/TextDialog', 
        'splunk.util',  
        '../dialog/dashboardtitle', 
        'models/services/ScheduledView', 
        '../../utils',
        'models/ACLReadOnly'

    ],
    function(
        module,
        $,
        _,
        PopTartView,
        TitleDescriptionDialog,
        PermissionsDialog,
        DeleteDialog,
        route,
        bootstrapModal,
        DashboardModel, 
        ConvertDialog, 
        CloneDialog, 
        SchedulePDFDialog, 
        TextDialog, 
        splunkUtils, 
        TitleDialog, 
        ScheduledViewModel, 
        utils,
        ACLReadOnlyModel
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                var defaults = {
                        button: true,
                        showOpenActions: true,
                        deleteRedirect: false
                    };

                _.defaults(this.options, defaults);
            },
            events: {
                'click a.edit-panels': function(e) {
                    e.preventDefault();
                    this.hide(); 
                    this.remove(); 
                    this.model.state.set('edit', true);
                },
                'click a.schedule-pdf': function(e){
                    e.preventDefault();
                    if ($(e.currentTarget).is('.disabled')) {
                        return;
                    }
                    this.hide(); 
                    this.remove(); 

                     var dialog = new SchedulePDFDialog({
                         model: {
                             scheduledView: this.model.scheduledView,
                             dashboard: this.model.dashboard,
                             application: this.model.application, 
                             appLocal: this.model.state.appLocal
                         },
                         onHiddenRemove: true
                     });
                     dialog.render().appendTo($('body'));
                     dialog.show();
                },
                'click a.delete': function(e){
                    e.preventDefault();
                    this.hide(); 
                    this.remove(); 
                    var dialog = new TextDialog({id: "modal-delete-dashboard"});
                    //override DialogBase dialogShown to put focus on the Delete button
                    dialog.dialogShown =  function() {
                        this.trigger("show");
                        // Apply focus to the first text input in the dialog. [JCS] Doesn't work without doing a debounce. Not sure why.
                        _.debounce(function() {
                            this.$('.btn-primary:first').focus();
                        }.bind(this), 0)();
                        return;
                    };
                    dialog.settings.set("primaryButtonLabel",_("Delete").t());
                    dialog.settings.set("cancelButtonLabel",_("Cancel").t());
                    dialog.settings.set("titleLabel",_("Delete").t());
                    dialog.setText(splunkUtils.sprintf(_("Are you sure you want to delete %s?").t(), 
                        '<em>' + _.escape(this.model.state.get('label') !== "" ? this.model.state.get('label') : this.model.dashboard.entry.get('name')) + '</em>'));
                    dialog.render().appendTo(document.body);

                    dialog.once('click:primaryButton', function(){
                        this.model.dashboard.destroy().done(function(){
                            var cur = utils.getPageInfo();
                            utils.redirect(route.page(cur.root, cur.locale, cur.app, 'dashboards'));
                        });
                    }, this);

                    dialog.on("hidden", function(){
                        dialog.remove();
                    }, this);

                    dialog.show();
                },
                'click a.edit-title-desc': function(e){
                    e.preventDefault();
                    this.hide(); 
                    this.remove(); 
                    this.children.titleDialog = new TitleDialog({
                        model: this.model.state,
                        onHiddenRemove: true
                    });
                    $("body").append(this.children.titleDialog.render().el);
                    this.children.titleDialog.show();
                },
                'click a.edit-perms': function(e) {
                    e.preventDefault();
                    this.hide(); 
                    this.remove(); 
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.dashboard,
                            nameModel: this.model.dashboard.entry.content,
                            user: this.model.state.user,
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
                'click a.convert-to-html': function(e) {
                    e.preventDefault();
                    this.hide(); 
                    this.remove(); 
                    var dashboard = new DashboardModel();
                    dashboard.meta.set(this.model.dashboard.meta.toJSON());

                    var convertDialog = this.children.convertDialog = new ConvertDialog({
                        model: {
                            dashboard: dashboard, 
                            currentDashboard: this.model.dashboard,
                            application: this.model.application,
                            user: this.model.state.user
                        },
                        collection: {
                            roles: this.collection.roles
                        },
                        onHiddenRemove: true

                    });

                    $("body").append(convertDialog.render().el);
                    convertDialog.show();
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
                    this.hide();
                    this.remove();
                    var clone = new DashboardModel();
                    clone.fetch({
                        success: function() {
                            if(this.model.dashboard.entry.content.get('eai:type') === 'html'){
                                clone.setHTML(this.model.dashboard.entry.content.get('eai:data'));
                            }else{
                                clone.setXML(this.model.dashboard.entry.content.get('eai:data'));
                            }
                            clone.meta.set(this.model.dashboard.meta.toJSON());

                            var cloneDialog  = this.children.cloneDialog = new CloneDialog({
                                model: {
                                    dashboard: clone,
                                    acl: new ACLReadOnlyModel($.extend(true, {}, this.model.dashboard.entry.acl.toJSON())),
                                    application: this.model.application,
                                    appLocal: this.model.state.appLocal,
                                    state: this.model.state,
                                    user: this.model.state.user,
                                    serverInfo: this.model.serverInfo
                                },
                                collection: {
                                    roles: this.collection.roles
                                },
                                onHiddenRemove: true
                            });
                            $("body").append(cloneDialog.render().el);
                            cloneDialog.show();
                        }.bind(this)
                    });
                }
            },
            render: function() {
                var app = this.model.application.toJSON();
                var renderModel = {
                    dashboard: this.model.dashboard.isDashboard(),
                    editLinkViewMode: route.manager(app.root, app.locale, app.app, ['data','ui','views', app.page], {
                        data: {
                            action: 'edit',
                            ns: app.app,
                            redirect_override: route.page(app.root, app.locale, app.app, app.page)
                        }
                    }),
                    editLinkEditMode: route.manager(app.root, app.locale, app.app, ['data','ui','views', app.page], {
                        data: {
                            action: 'edit',
                            ns: app.app,
                            redirect_override: route.page(app.root, app.locale, app.app, app.page) + '/edit'
                        }
                    }),
                    dashboardType: this.model.dashboard.getViewType(),
                    editable: this.model.state.get('editable'),
                    canWrite: this.model.dashboard.entry.acl.canWrite(),
                    canCangePerms: this.model.dashboard.entry.acl.get('can_change_perms'),
                    canEditHtml: this.model.state.user.canEditViewHtml(),
                    canMakeHomeDashboard: !this.model.serverInfo.isLite(),
                    removable: this.model.dashboard.entry.links.get('remove') ? true : false,
                    isXML: this.model.dashboard.isXML(),
                    isForm: this.model.dashboard.isForm(),
                    isSimpleXML: this.model.dashboard.isSimpleXML(),
                    isLauncherEnabled: !!this.collection.appLocalsUnfiltered.get('/servicesNS/nobody/system/apps/local/launcher'),
                    isHTML: this.model.dashboard.isHTML(),
                    isHomeDashboard: (this.model.userPref.entry.content.get('display.page.home.dashboardId')===this.model.dashboard.get('id')),
                    canSchedulePDF: this.model.state.user.canSchedulePDF() && this.model.dashboard.isSimpleXML(),
                    isPdfServiceAvailable: this.model.state.get('pdf_available'),
                    showAddTRP: !this.model.state.get('default_timerange'),
                    _: _
                };

                var html = this.compiledTemplate(renderModel);
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(html);

                return this;
            },
            template: '\
                    <% if (canWrite && (editable || (!isHTML || canEditHtml) || (isSimpleXML && canEditHtml))) { %>\
                    <ul class="first-group">\
                        <% if(editable) { %>\
                        <li><a href="#" class="edit-panels"><%- _("Edit Panels").t() %></a></li>\
                        <% } %>\
                        <% if (!isHTML || canEditHtml) { %>\
                        <li><a href="<%- editLinkViewMode %>" class="edit-source"><%- _("Edit Source").t() %> <span class="dashboard-source-type"><%= dashboardType %></span></a></li>\
                        <% } %>\
                        <% if (isSimpleXML && canEditHtml) { %>\
                        <li><a href="#" class="convert-to-html"><%- _("Convert to HTML").t() %></a></li>\
                        <% } %>\
                    </ul>\
                    <% } %>\
                    <% if(canCangePerms || (canWrite && isXML) || canSchedulePDF) { %>\
                    <ul class="second-group">\
                        <% if(isXML && canWrite) { %>\
                        <li><a href="#" class="edit-title-desc"><%- _("Edit Title or Description").t() %></a></li>\
                        <% } %>\
                        <% if(canCangePerms) { %>\
                            <li><a href="#" class="edit-perms"><%- _("Edit Permissions").t() %></a></li>\
                        <% } %>\
                        <% if(canSchedulePDF && isPdfServiceAvailable) { %>\
                        <li>\
                        <% if(isForm) {%>\
                            <a class="schedule-pdf disabled" href="#" title="<%- _("You cannot schedule PDF delivery for a dashboard with form elements.").t() %>">\
                        <% } else { %>\
                            <a class="schedule-pdf" href="#">\
                        <% } %>\
                                <%- _("Schedule PDF Delivery").t() %>\
                            </a>\
                        </li>\
                        <% } %>\
                    </ul>\
                    <% } %>\
                    <% if (!isHTML || canEditHtml || canWrite) { %>\
                    <ul class="third-group">\
                        <% if (canMakeHomeDashboard && isSimpleXML && !isHomeDashboard && isLauncherEnabled) { %>\
                        <li><a href="#" class="make-home"><%- _("Set as Home Dashboard").t() %></a></li>\
                        <% } %>\
                        <% if (!isHTML || canEditHtml) { %>\
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





