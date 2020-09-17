define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/ManagementconsoleBase',
        'routers/DeploymentServerAddClients',
        'models/managementconsole/Group',
        'models/managementconsole/DmcSettings',
        'models/managementconsole/topology/Topology',
        'collections/managementconsole/ClientsPreview',
        'collections/managementconsole/MachineTypes',
        'views/managementconsole/server_classes/addClients/AddClients'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseRouter,
        DeploymentServerAddClientsRouter,
        GroupModel,
        DmcSettingsModel,
        TopologyModel,
        ClientsPreviewCollection,
        MachineTypesCollection,
        DmcAddClientsView
    ) {
        return DeploymentServerAddClientsRouter.extend({
            initialize: function() {
                DeploymentServerAddClientsRouter.prototype.initialize.apply(this, arguments);
                this.deferreds.capabilityChecked = DmcBaseRouter.checkDmcServerStateAndRedirect().deferred;

                this.setPageTitle(_('Edit Server Class').t());
                this.addClientsViewClass = DmcAddClientsView;
                this.enableAppBar = true;
            },

            getServerClassModel: function(fetchedClassicurl) {
                var groupModel = new GroupModel();
                groupModel.entry.set('name', fetchedClassicurl.get('group'));
                return groupModel;
            },

            getClientsPreviewCollection: function() {
                return ClientsPreviewCollection;
            },

            getMachineTypesCollection: function() {
                return MachineTypesCollection;
            },

            page: function(locale, app, page) {
                var args = arguments;
                this.deferreds.capabilityChecked.always(function() {
                    DeploymentServerAddClientsRouter.prototype.page.apply(this, args);
                }.bind(this));
            }
        });
    }
);