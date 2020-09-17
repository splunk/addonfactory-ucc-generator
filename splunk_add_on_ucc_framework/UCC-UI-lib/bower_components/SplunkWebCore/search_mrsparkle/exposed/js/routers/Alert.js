define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'models/Base',
        'models/search/Alert',
        'models/classicurl',
        'collections/services/authorization/Roles',
        'collections/services/admin/Alerts',
        'collections/shared/ModAlertActions',
        'collections/managementconsole/AlertConfigs',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/alertcontrols/dialogs/edit/Master',
        'views/alert/Master',
        'util/splunkd_utils',
        'util/general_utils',
        'helpers/managementconsole/url'
    ],
    function(
        _,
        $,
        BaseRouter,
        BaseModel,
        AlertModel,
        classicurlModel,
        RolesCollection,
        AlertsAdminCollection,
        ModAlertActionsCollection,
        AlertConfigsCollection,
        PermissionsDialog,
        EditDialog,
        AlertView,
        splunkd_utils,
        util,
        urlHelper
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.fetchUser = true;
                this.fetchAppLocals = true;

                // models
                this.alertModel = new AlertModel();
                this.stateModel = new BaseModel();

                // collections
                this.rolesCollection = new RolesCollection();
                this.alertsAdminCollection = new AlertsAdminCollection();
                this.alertActionsCollection = new ModAlertActionsCollection();
                //Set defaults for pagination
                this.alertsAdminCollection.fetchData.set({
                    count: 20,
                    offset: 0
                },{
                    silent:true
                });

                this.alertModel.entry.content.on('change:disabled', this.fetchAlertAdminCollection, this);

                //data init
                this.deferredRoles = this.rolesCollection.fetch();

                //refetch every minute (60000 milliseconds) if enabled
                setInterval(function(){
                    if(!this.alertModel.entry.content.get('disabled')) {
                        this.fetchAlertAdminCollection();
                    }
                }.bind(this), 60000);
            },
            initializeAndRenderAlertView: function() {
                var alertConfig = this.collection.alertConfigsCollection.find(function(model) { 
                    return model.entry.get('name') === this.alertModel.entry.get('name'); 
                }.bind(this));

                if (this.model.serverInfo.isLite() && alertConfig && !util.normalizeBoolean(alertConfig.entry.content.get('enabled_for_light')) ) {
                    window.location.href = urlHelper.pageUrl('error');
                }
                else {
                    this.alertView = new AlertView({
                        model: {
                            state: this.stateModel,
                            savedAlert: this.alertModel,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            roles: this.rolesCollection,
                            alertsAdmin: this.alertsAdminCollection,
                            alertActions: this.alertActionsCollection
                        }
                    });

                    this.pageView.$('.main-section-body').append(this.alertView.render().el);

                    switch(classicurlModel.get('dialog')) {
                        case 'permissions':
                            if (this.alertModel.entry.acl.get('can_change_perms')) {
                                this.showPermissionsDialog();
                            }
                            break;
                        case 'type':
                            this.showEditAlertDialog('type');
                            break;
                        case 'actions':
                            this.showEditAlertDialog('actions');
                            break;
                    }
                }
            },
            showPermissionsDialog: function() {
                this.permissionsDialog = new PermissionsDialog({
                    model: {
                        document: this.alertModel,
                        nameModel: this.alertModel.entry,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.rolesCollection,
                    onHiddenRemove: true,
                    nameLabel: _('Alert').t()
                });

                $("body").append(this.permissionsDialog.render().el);
                this.permissionsDialog.show();

                classicurlModel.save({ dialog: undefined }, { replaceState: true });

            },
            showEditAlertDialog: function(position) {
                this.editAlertDialog = new EditDialog({
                    model:  {
                        alert: this.alertModel,
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        alertActions: this.alertActionsCollection
                    },
                    onHiddenRemove: true
                });

                this.listenTo(this.editAlertDialog, 'shown', function(){
                    this.editAlertDialog.scrollTo(position);
                });

                this.editAlertDialog.render().appendTo($("body"));
                this.editAlertDialog.show();

                classicurlModel.save({ dialog: undefined }, { replaceState: true });
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                // TODO: Add fetch data options - currently doing an unbounded fetch
                this.deferredAlertActionCollection = this.alertActionsCollection.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        search: 'disabled!=1'
                    },
                    addListInTriggeredAlerts: true
                });

                classicurlModel.fetch({
                    success: function(model, response) {
                        var alertModelDeferred = $.Deferred();
                        this.alertModel.set('id', classicurlModel.get('s'));
                        if (this.alertModel.id) {
                            this.alertModel.fetch({
                                success: function(model, response) {
                                    alertModelDeferred.resolve();
                                }.bind(this),
                                error: function(model, response) {
                                    this.alertModel.trigger('error', this.alertModel, response);
                                    alertModelDeferred.resolve();
                                }.bind(this)
                            });
                        } else {
                            var noAlertIdError = splunkd_utils.createSplunkDMessage(
                                splunkd_utils.FATAL,
                                _("No alert was specified.").t());
                            this.alertModel.trigger("error", this.alertModel, noAlertIdError);
                            this.setPageTitle(_('Alert').t());
                            alertModelDeferred.resolve();
                        }
                        $.when(alertModelDeferred).then(function() {
                            var alertAdminFetchDeferred = this.fetchAlertAdminCollection();

                            this.collection.alertConfigsCollection = new AlertConfigsCollection();
                            this.deferreds.alertConfigFetchDeferred = $.Deferred();

                            if (this.model.serverInfo.isLite()) {
                                this.collection.alertConfigsCollection.fetch({
                                    success: function() {
                                        this.deferreds.alertConfigFetchDeferred.resolve();
                                    }.bind(this),
                                    error: function() {
                                        this.deferreds.alertConfigFetchDeferred.resolve();
                                    }.bind(this)
                                });
                            } else {
                                this.deferreds.alertConfigFetchDeferred.resolve();
                            }

                            this.setPageTitle(this.alertModel.entry.get('name')|| _('Alert').t());
                            $.when(alertAdminFetchDeferred, this.deferredRoles, this.deferreds.pageViewRendered, this.deferredAlertActionCollection, this.deferreds.alertConfigFetchDeferred).then(function() {
                                $('.preload').replaceWith(this.pageView.el);
                                this.initializeAndRenderAlertView();
                            }.bind(this));
                        }.bind(this));
                    }.bind(this)
                });
            },
            fetchAlertAdminCollection: function() {
                var alertsUrl = this.alertModel.entry.links.get('alerts');
                if (alertsUrl) {
                    this.alertsAdminCollection.url = this.alertModel.entry.links.get('alerts');
                    return this.alertsAdminCollection.fetch();
                } else {
                    return true;
                }
            }
        });
    }
);
