define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageController',
        'models/managementconsole/App',
        'collections/managementconsole/Apps',
        'views/managementconsole/apps/app_listing/GridRow',
        'views/managementconsole/apps/app_listing/ActionCell',
        'views/managementconsole/apps/app_listing/controls/DeleteConfirmationDialog',
        'views/managementconsole/apps/app_listing/controls/RestartingDialog',
        'views/managementconsole/apps/app_listing/controls/SuccessDialog',
        'views/managementconsole/apps/app_listing/NewButtons',
        'views/managementconsole/shared/TopologyProgressControl',
        'helpers/managementconsole/url',
        'views/shared/pcss/basemanager.pcss',
        'views/managementconsole/shared.pcss',
        './PageController.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseController,
        AppModel,
        AppsCollection,
        GridRow,
        ActionCell,
        DeleteConfirmationDialog,
        RestartingDialog,
        SuccessDialog,
        NewButtons,
        TopologyProgressControl,
        urlHelper,
        cssBaseManager,
        cssShared,
        css
    ) {
        return BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                var newAppLinkHref = urlHelper.appBrowserUrl(),
                    appLabel = urlHelper.getUrlParam('appLabel'),
                    appVersion = urlHelper.getUrlParam('appVersion');

                options = $.extend(true, options, {
                    header: {
                        pageTitle: _('Apps').t(),
                        pageDesc: _('A Splunk app is an application that runs on Splunk Enterprise or Splunk Cloud and typically addresses several use cases. It can include Splunk Enterprise knowledge objects such as reports, lookups, and inputs.').t()
                    },
                    learnMoreLink: '', // TODO
                    noEntitiesMessage: _('No apps found.').t(),
                    entitySingular: _('App').t(),
                    entitiesPlural: _('Apps').t(),
                    deleteDialogButtonLabel: _('Uninstall').t(),
                    entityModelClass: AppModel,
                    entitiesCollectionClass: AppsCollection,
                    deferreds: {
                        deployModel: this.model.deployModel.fetch()
                    },
                    grid: {
                        showAppFilter: false,
                        showOwnerFilter: false,
                        showSharingColumn: false,
                        showStatusColumn: false
                    },
                    customViews: {
                        GridRow: GridRow,
                        ActionCell: ActionCell,
                        DeleteDialog: DeleteConfirmationDialog,
                        NewButtons: NewButtons
                    },
                    editLinkHref: newAppLinkHref
                });

                BaseController.prototype.initialize.call(this, options);

                this.children.progressControl = new TopologyProgressControl({
                    buttonHidden: false,
                    taskId: this.model.deployTask.entry.get('name'),
                    model: {
                        topologyTask: this.model.deployTask
                    }
                });

                if (appLabel && appVersion) {
                    this.openSuccessDialog(appLabel, appVersion);
                }
            },

            render: function() {
                BaseController.prototype.render.apply(this, arguments);

                $.when(this.renderDfd).then(function() {
                    this.children.progressControl.render().insertAfter($('.text-name-filter-placeholder'));
                }.bind(this));

                return this;
            },

            showDeleteDialog: function(entityModel) {
                var confirmDialog = new DeleteConfirmationDialog({
                    model: {
                        app: entityModel.clone()
                    },
                    onActionSuccess: function(respond) {
                        this.fetchEntitiesCollection();
                        this.model.deployTask.entry.set('name', respond.entry[0].name);
                        this.openRestartDialog(entityModel);
                    }.bind(this),
                    onHiddenRemove: true,
                    backdrop: 'static'
                });
                $("body").append(confirmDialog.render().el);
                confirmDialog.show();
            },

            saveAppLabelUrlParam: function(appModel) {
                var attr = {
                    appLabel: appModel.getAppLabel(),
                    appVersion: appModel.getVersion()
                };
                urlHelper.replaceState(attr);
            },

            openRestartDialog: function(appModel) {
                this.saveAppLabelUrlParam(appModel);

                var restartDialog = new RestartingDialog({
                    model: {
                        app: appModel,
                        deployTask: this.model.deployTask
                    },
                    onHiddenRemove: true,
                    backdrop: 'static',
                    onTaskCompleted: function() {
                        this.openSuccessDialog(appModel.getAppLabel(), appModel.getVersion());
                    }.bind(this)
                });
                $("body").append(restartDialog.render().el);
                restartDialog.show();
            },

            openSuccessDialog: function(appLabel, appVersion) {
                urlHelper.removeUrlParam('appLabel');
                urlHelper.removeUrlParam('appVersion');

                var successDialog = new SuccessDialog({
                    appLabel: appLabel,
                    appVersion: appVersion,
                    onHiddenRemove: true,
                    backdrop: 'static'
                });
                $("body").append(successDialog.render().el);
                successDialog.show();
            }
        });
    }
);
