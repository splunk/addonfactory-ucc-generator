/**
 * @author jszeto
 * @date 8/5/13
 *
 * Dialog that allows the user to create a new Server Class
 *
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'splunk.util',
        'models/services/deploymentserver/DeploymentServerClass',
        'views/shared/dialogs/TextInputDialog',
        'module'
    ],
    function(
        $,
        _,
        Backbone,
        splunkUtil,
        DeploymentServerClass,
        TextInputDialog,
        module
        )
    {
        return TextInputDialog.extend({
                moduleId: module.id,

                initialize: function(options) {
                    // We need to pass a model to the TextInputDialog initialize function
                    this.serverClassModel = new DeploymentServerClass();

                    _.defaults(options, {modelAttribute: "name",
                                         updateModel: true,
                                         label: _("Name").t(),
                                         model: this.serverClassModel.entry.content});

                    TextInputDialog.prototype.initialize.call(this, options);

                    this.settings.set("primaryButtonLabel", _("Save").t());
                    this.settings.set("cancelButtonLabel", _("Cancel").t());
                    this.settings.set("titleLabel", _("New Server Class").t());

                    // TODO [JCS] We really shouldn't be reaching in. Instead, we should add API to TextInputDialog to
                    // specify models to listen for error.
                    this.children.flashMessagesView.flashMsgHelper.register(this.serverClassModel);
                },

                primaryButtonClicked: function() {
                    if (this.serverClassModel.entry.content.set({}, {validate:true})) {
                        var resultXHR = this.serverClassModel.save({}, {data: { app: 'system' }});
                        if (resultXHR) {
                            resultXHR.done(_(function() {
                                this.hide();
                                this.trigger("action:createdServerClass", this.serverClassModel);
                            }).bind(this));
                        }
                    }
                }
            }
        );}
);
