/**
 * @author jszeto
 * @date 6/14/13
 *
 * Subclass that displays a dialog to edit the permissions of a DataModel. This adds some logic to display a warning message
 * about acceleration and permissions.
 *
 * Inputs:
 *
 *     model: {
 *         document {models/services/datamodel/DataModel}
 *         nameModel {models/services/datamodel/DataModel.entry.content} the model that contains the nameKey attribute
 *         user {models/services/authentication/User}
 *     }
 *     collection {collections/services/authorization/Roles}
 *     nameLabel {string} Label for name
 *     nameKey {string} Key for name found in nameModel
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/ACLReadOnly',
    'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
    'util/splunkd_utils'
],
    function(
        $,
        _,
        Backbone,
        module,
        ACLReadOnlyModel,
        BasePermissionsDialog,
        splunkd_utils
        ) {
        return BasePermissionsDialog.extend({
            moduleId: module.id,

            WARN_MSG_ID: "_WARN_ACCELERATION_MSG_",

            initialize: function(options) {
                BasePermissionsDialog.prototype.initialize.apply(this, arguments);

                // Add logic to display a warning message if the DataModel is accelerated and we have set the sharing
                // to user.
                this.model.inmem.on('change:sharing', function() {
                    if (this.model.inmem.get("sharing") === splunkd_utils.USER &&
                        this.model.document.entry.content.acceleration.get("enabled")) {
                        this.children.flashMessage.flashMsgHelper.addGeneralMessage(this.WARN_MSG_ID, {
                            type: splunkd_utils.WARNING,
                            html: _("Private models cannot be accelerated. Submitting this form will remove the acceleration.").t()
                        });
                    } else {
                        this.children.flashMessage.flashMsgHelper.removeGeneralMessage(this.WARN_MSG_ID);
                    }
                }, this);
            }
        });
    });