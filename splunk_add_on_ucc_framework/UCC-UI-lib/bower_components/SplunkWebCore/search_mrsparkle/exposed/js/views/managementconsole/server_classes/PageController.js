define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageController',
        'models/managementconsole/Group',
        'collections/managementconsole/Groups',
        'collections/managementconsole/topology/Instances',
        'views/shared/dialogs/TextDialog',
        'views/managementconsole/server_classes/ActionCell',
        'views/managementconsole/server_classes/GridRow',
        'views/managementconsole/server_classes/MoreInfo',
        'views/managementconsole/server_classes/AddEditDialog',
        'views/managementconsole/shared/NewButtons',
        'views/managementconsole/shared/DeleteConfirmationDialog',
        'splunk.util',
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
        GroupModel,
        GroupsCollection,
        InstancesCollection,
        TextDialog,
        ActionCell,
        GridRow,
        MoreInfo,
        AddEditDialog,
        NewButtons,
        DeleteConfirmationDialog,
        splunkUtil,
        cssShared,
        manangementConsoleCss,
        css
    ) {
        return BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {

                options = $.extend(true, options, {
                    header: {
                        pageTitle: _('Server Classes').t(),
                        pageDesc: _('Server classes facilitate the management of a set of forwarders as a single unit. A server class can group forwarders by application, operating system, data type to be indexed, or any other feature of a Splunk Enterprise deployment.').t()
                    },
                    learnMoreLink: '', // TODO
                    noEntitiesMessage: _('No server classes found.').t(),
                    entitySingular: _('Server Class').t(),
                    entitiesPlural: _('Server Classes').t(),
                    deleteDialogButtonLabel: _('Delete').t(),
                    entityModelClass: GroupModel,
                    entitiesCollectionClass: GroupsCollection,
                    deferreds: {
                        pendingChanges: this.collection.pendingChanges.fetch()
                    },
                    grid: {
                        showAppFilter: false,
                        showOwnerFilter: false,
                        showSharingColumn: false,
                        showStatusColumn: false
                    },
                    nameFilterAttribute: 'query',
                    customViews: {
                        ActionCell: ActionCell,
                        GridRow: GridRow,
                        MoreInfo: MoreInfo,
                        AddEditDialog: AddEditDialog,
                        DeleteDialog: DeleteConfirmationDialog,
                        NewButtons: NewButtons
                    }
                });

                BaseController.prototype.initialize.call(this, options);

                // Opens the create dialog if the state is passed from the router
                if (this.model.state.get('createDialogOpen')) {
                    this.onEditEntity();
                }
            }
        });
    }
);