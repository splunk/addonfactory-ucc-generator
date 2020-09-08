/**
 * Created by rtran on 2/11/16.
 */
define([
        'module',
        'underscore',
        'jquery',
        'backbone',
        'views/deploymentserver/editServerclass/addClients/SelectedClientsTab',
        'views/managementconsole/server_classes/addClients/ClientsGrid'],
    function(module, _, $, backbone, SelectedClientsTab, ClientsTabGrid) {
        return SelectedClientsTab.extend({
            moduleId: module.id,

            _getClientsTabGrid: function() {
                return ClientsTabGrid;
            }
        });
    }
);