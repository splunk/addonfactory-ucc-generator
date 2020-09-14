define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'uri/route',
    'views/shared/apps_remote/apps/app/Master',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/apps/dialog/Master',
    'views/managementconsole/apps/install_app/overrides/shared/apps_remote/apps/app/ConfirmDialog'
], function(
        $,
        _,
        Backbone,
        module,
        route,
        AppView,
        DialogView,
        ConfirmDialog
){
    return AppView.extend({
        moduleId: module.id,
        installMethodKey: 'install_method_distributed',

        initialize: function(options) {
            options = $.extend(true, options, {dialogViewClass: DialogView});
            AppView.prototype.initialize.call(this, options);

            this.listenTo(this.collection.appLocals, 'sync', this.render);
            this.listenTo(this.collection.dmcApps, 'sync', this.render);

            this.model.confirmation = new Backbone.Model();
            this.listenTo(this.model.confirmation, 'installApp', this.showDialog);
        },

        events: $.extend({}, AppView.prototype.events, {
           'click .install-button': function(e) {
               e.preventDefault();

               var confirmDialog = new ConfirmDialog({
                   model: {
                      confirmation: this.model.confirmation,
                      appRemote: this.model.appRemote
                   }
               });

               this.$('body').append(confirmDialog.render().el);
               confirmDialog.show();
           }
        }),

        cloudRender: function(install_method) {
            var appId = this.model.appRemote.get('appid'),
                localApp = this.collection.appLocals.findByEntryName(appId),
                localAppUnfiltered = this.collection.appLocalsUnfiltered.findByEntryName(appId),
                dmcApp = this.collection.dmcApps.findByEntryName(appId),
                // SPL-132754: We also need to check that the localApp is not a "dummy" app
                // We can do this by determining if its version is defined
                // This is not a general solution per se, but it works for all apps that we
                // allow to be installed in the cloud.
                localAppUnfilteredVersion = localAppUnfiltered && localAppUnfiltered.entry.content.get('version');

            
            if (localApp && localApp.entry.links.has('update')) {
                return AppView.prototype.cloudRender.apply(this, arguments);
            } else if (dmcApp && localApp) {
                var appLink = route.prebuiltAppLink(this.model.application.get('root'), this.model.application.get('locale'), appId, '');
                return {
                    buttonText: _('Open App').t(),
                    link: appLink
                };
            } else if (localAppUnfilteredVersion && (localAppUnfiltered || dmcApp)) {
                return {
                    buttonText: _('Already Installed').t(),
                    buttonClass: 'disabled'
                };
            } else {
                switch(install_method) {

                    // This should never happen.
                    // If an app is ever flagged as "simple" in a AppManagement-Cloud
                    // environment, this means that this app should be installable,
                    // but only outside of AppManagement, therefore CloudOps needs to
                    // be invovled --> we resolve this case to 'assisted' here.
                    case 'simple':
                        return AppView.prototype.cloudRender.call(this, 'assisted');

                    // This case is logically the 'simple' case, but specific to
                    // AppManagement-Cloud environments.
                    // This flag indicates that this app is installable by AppManagement
                    // cloud environments but not by other Cloud environments.
                    case 'appmgmt_phase':
                        return AppView.prototype.cloudRender.call(this, 'simple');

                    default:
                        return AppView.prototype.cloudRender.apply(this, arguments);
                }
            }
        }
    });
});
