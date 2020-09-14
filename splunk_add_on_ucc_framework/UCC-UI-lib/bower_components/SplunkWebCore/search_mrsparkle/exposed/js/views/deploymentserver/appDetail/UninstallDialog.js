define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/dialogs/TextDialog'
    ],
    function(
        $,
        _,
        module,
        TextDialog
    )
    {
        return TextDialog.extend({
            moduleId: module.id,
            className: "modal",
            _text: "",
            initialize: function(options) {
                TextDialog.prototype.initialize.call(this, options);
                // Set default values for the button labels
                this.settings.set("primaryButtonLabel",_("Uninstall").t());
                this.settings.set("titleLabel",_("Uninstall").t());
                this.setText(_("All clients will uninstall this app. <br/> Deploy the app again to reinstall it on clients.").t()); 
            }
        });
    }
);


