define([
        'views/shared/apps_remote/dialog/Master',
        'views/apps_local/dialog/Install',
        'views/apps_local/dialog/Error',
        'uri/route'
    ],
    function(
        AppsRemoteMaster,
        InstallView,
        ErrorView,
        route
    ) {
        return AppsRemoteMaster.extend({
            initialize: function(options) {
                AppsRemoteMaster.prototype.initialize.apply(this, arguments);

                this.children.install = new InstallView({
                    model: {
                        appRemote: this.model.appRemote,
                        entryById: this.model.entryById
                    },
                    appType: this.options.appType
                });

                this.children.error = new ErrorView({
                    model: {
                        appRemote: this.model.appRemote,
                        entryById: this.model.entryById,
                        wizard: this.model.wizard,
                        auth: this.model.auth
                    }
                });
            },

            returnToURL: function() {
                return route.appsLocal(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'));
            }
        });
    });
