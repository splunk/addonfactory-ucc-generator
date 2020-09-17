/***
 * Instance collection. Used in topology instances and deployment management.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase',
        'models/managementconsole/topology/Instance',
        'collections/SplunkDsBase'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel,
        InstanceModel,
        SplunkDsBaseCollection
    ) {

        var INSTANCES_TO_UPDATE = {};

        return SplunkDsBaseCollection.extend({
            model: InstanceModel,
            url: '/services/dmc/instances',

            initialize: function(options) {

                this.options = options || {};
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);

                /**
                 * if the collection instance is used in deployment management then we want to listen to the
                 * reset event. This is required to keep track of the instance that user checked/selected for update by
                 * clicking on the checkbox.
                 */
                if (this.options.deploymentManagementMode) {
                    this.on('reset', this.updateModelsEditState.bind(this));
                }
            },

            fetch: function() {
                // Caches the selected instances that are marked for update. A local copy of the instances that are
                // marked for update is kept so that if the user moves to the next page in the table and navigates back,
                // we know the instances that he previously checked.
                if (this.options.deploymentManagementMode) {
                    this.updateEditList();
                }
                return SplunkDsBaseCollection.prototype.fetch.apply(this, arguments);
            },

            getAllInstancesSelectedForUpdate: function() {
                this.updateEditList();
                return _.values(INSTANCES_TO_UPDATE);
            },

            /**
             * Loops through all the instances and caches the instances that are checked/selected for bulk update.
             */
            updateEditList: function() {
                this.each(function(instance) {
                    var instanceId = instance.entry.content.get('instanceId');
                     if (instance.isInstanceMarkedForUpdate()) {
                         INSTANCES_TO_UPDATE[instanceId] = instance;
                     } else if (INSTANCES_TO_UPDATE[instanceId]){
                         delete INSTANCES_TO_UPDATE[instanceId];
                     }
                });
            },

            /**
             *  Deletes all the cache instances and unset the updateTopology flag on instances
             */
            resetEditList: function() {
              INSTANCES_TO_UPDATE = {};
                this.each(function(instance) {
                    instance.setInstanceMarkedForUpdate(false);
                });
            },

            /**
             * After a fetch , checks for the instances that are previously marked for update.
             */
            updateModelsEditState: function() {
                if (!this.options.deploymentManagementMode){
                    return;
                }
                this.each(function(model) {
                    var instanceId = model.entry.content.get('instanceId');
                    if (INSTANCES_TO_UPDATE[instanceId]) {
                        model.setInstanceMarkedForUpdate(true);
                    }
                });
            }
        },
        {
            getDefaultInstancesQuery: function() {
                return {
                    $and: [{"topology":{"$ne":"unassigned"},"$or":[{"topology":"forwarder:member"}]}]
                };
            },
            TABLE_COLUMN_LABELS: {
                SELECT_ALL: {label: _('').t()},
                HOST_NAME: {label: _('Host Name').t()},
                EDIT_ACTIONS: {label: _('Actions').t()},
                DNS_NAME: {label: _('DNS Name').t()},
                CLIENT_NAME: {label: _('Client Name').t()},
                IP_ADDRESS: {label: _('IP Address').t()},
                MACHINE_TYPE: {label: _('Machine Type').t()},
                PHONE_HOME: {label: _('Phone Home').t()},
                VERSION: {label: _('Version').t()},
                SERVER_ROLE: {label: _('Server Role').t()},
                REGISTRATION_STATUS: {label: _('Registration Status').t()},
                DEPLOY_STATUS: {label: _('Deploy Status').t()},
                ACTIONS: {label: _('Actions').t()},
                PENDING_CHANGE: { label: DmcBaseModel.PENDING_COLUMN_NAME }
            }
        });
    }
);