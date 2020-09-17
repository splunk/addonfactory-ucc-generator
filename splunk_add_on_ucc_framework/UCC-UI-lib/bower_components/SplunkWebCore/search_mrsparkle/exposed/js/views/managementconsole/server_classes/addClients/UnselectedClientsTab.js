/**
 * Created by rtran on 2/11/16.
 */
define([
        'module',
        'underscore',
        'jquery',
        'backbone',
        'views/deploymentserver/editServerclass/addClients/UnselectedClientsTab',
        'views/managementconsole/server_classes/addClients/ClientsGrid'],
    function(module, _, $, backbone, UnselectedClientsTab, ClientsTabGrid) {
        return UnselectedClientsTab.extend({
            moduleId: module.id,

            _getClientsTabGrid: function() {
                return ClientsTabGrid;
            }
        });
    }
);