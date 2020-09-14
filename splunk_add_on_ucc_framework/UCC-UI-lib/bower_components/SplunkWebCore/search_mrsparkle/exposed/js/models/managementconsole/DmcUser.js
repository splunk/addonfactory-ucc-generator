/**
 * DMC User Model
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/shared/User'
    ],
    function(
        $,
        _,
        Backbone,
        UserModel
    ) {
        return UserModel.extend({
            isForwarderOnly: function() {
                return (this.hasCapability('dmc_manage_forwarders') && !this.hasCapability('dmc_manage_topology'));
            },
            isFullAccess: function() {
                return (this.hasCapability('dmc_manage_forwarders') && this.hasCapability('dmc_manage_topology'));
            },

            canEditDMCOutputs: function () {
                return this.hasCapability('dmc_edit_outputs');
            },

            canEditDMCInputs: function () {
                return this.hasCapability('dmc_edit_inputs');
            },

            canEditDMCForwarders: function () {
                return this.hasCapability('dmc_edit_forwarders');
            },

            canEditForwarderSetup: function() {
                return this.hasCapability('dmc_edit_forwarder_setup');
            },

            canEditForwarderAuth: function() {
                return this.hasCapability('dmc_edit_require_authentication');
            },

            canShowForwarderSetup: function() {
                return this.canEditForwarderSetup() || this.hasCapability('dmc_get_forwarder_setup');
            }
        });
    }
);
