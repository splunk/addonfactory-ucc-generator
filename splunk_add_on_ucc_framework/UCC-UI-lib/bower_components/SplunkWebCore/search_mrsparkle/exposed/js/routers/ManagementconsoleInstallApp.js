define(
    [
        'jquery',
        'underscore',
        'routers/AppsRemote',
        'views/managementconsole/apps/install_app/overrides/shared/apps_remote/Master',
        'collections/managementconsole/Apps',
        'util/general_utils',
        'jquery.cookie'
    ],
    function(
        $,
        _,
        BaseRouter,
        MasterView,
        DMCAppsCollection,
        GeneralUtils
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = true;

                this.collection.dmcApps = new DMCAppsCollection();

                this.deferreds.dmcApps = $.Deferred();

                this.bootstrapDmcApps();
            },

            createMasterView: function() {
                return new MasterView({
                    model: {
                        application: this.model.application,
                        auth: this.model.auth,
                        metadata: this.model.metadata,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user
                    },
                    collection: {
                        appsRemote: this.collection.appsRemote,
                        appLocals: this.collection.appLocals,
                        messages: this.collection.messages,
                        options: this.collection.options,
                        dmcApps: this.collection.dmcApps,
                        appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                    },
                    hideDock: false
                });
            },

            $whenMasterViewDependencies: function() {
                return $.when(
                    BaseRouter.prototype.$whenMasterViewDependencies.apply(this, arguments),
                    this.deferreds.dmcApps
                );
            },

            // include not 'visible' apps for unfiltered appsLocal collection
            // to determine which apps are installed on the search head
            // otherwise, filter these apps out for original appsLocal collection
            getVisibleApps: function(collection, includeNotVisibleApps) {
                if (includeNotVisibleApps) {
                    return collection.models;
                }

                return BaseRouter.prototype.getVisibleApps.apply(this, arguments);
            },

            bootstrapDmcApps: function() {
                $.when(this.deferreds.serverInfo).done(function() {
                    if (this.model.serverInfo.isCloud()) {
                        this.collection.dmcApps.fetch().always(function() {
                            this.deferreds.dmcApps.resolve();
                        }.bind(this));
                    } else {
                        this.deferreds.dmcApps.resolve();
                    }
                }.bind(this));
            }
        });
    }
);
