define(
    [
        "jquery",
        "underscore",
        "routers/Base",
        "collections/services/appsbrowser/v1/Apps",
        "collections/services/Messages",
        "collections/services/saved/Searches",
        "models/search/Job",
        "models/services/data/UserPrefGeneralDefault",
        'models/services/search/jobs/ResultJsonRows',
        "views/apps_local/Master",
        "views/shared/apps_remote/Error"
    ],
    function(
        $,
        _,
        BaseRouter,
        AppsCollection,
        MessagesCollection,
        SavedSearchesCollection,
        SearchJob,
        UserPrefGeneralDefault,
        ResultJsonRows,
        AppsView,
        ErrorView
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.collection.appRemotes = new AppsCollection();
                this.collection.messages = new MessagesCollection();
                this.model.userPrefGeneralDefault = new UserPrefGeneralDefault();
                this.deferreds.appRemotes = $.Deferred();
                this.deferreds.messages = $.Deferred();
                this.deferreds.userPrefGeneralDefault = $.Deferred();
                this.enableAppBar = false;
                this.fetchFailed = false;
                this.setPageTitle(_("Apps and Add-Ons").t());
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                this.bootstrapAppRemotes();
                this.bootstrapMessages();
                this.bootstrapAllAppsObjectsCounts();
                this.bootstrapUserPrefGeneralDefault();
            },

            pageRender: function() {
                $.when(this.deferreds.appLocals, this.deferreds.appRemotes,
                    this.deferreds.messages, this.deferreds.pageViewRendered).then(function() {
                    if (this.shouldRender) {
                        this.initializeAppsView();
                        $(".preload").replaceWith(this.pageView.el);
                        this.appsView.render().replaceContentsOf($(".main-section-body"));
                    }
                }.bind(this));
            },

            bootstrapAllAppsObjectsCounts: function () {
                this.searchJob = new SearchJob();
                this.model.allAppsObjectCounts = new ResultJsonRows();

                // The result of this search is used in views/apps_local/Master.js and views/apps_local/ObjectsDropDown
                // as well as the installSuccessCallback of views/apps_local/Master.js
                // Make sure to update all locations if this search is ever changed.
                var BASE_USAGE_SEARCH_STRING =
                    "| rest /servicesNS/nobody/-/admin/directory "+
                    "| stats count as adminDirCt by eai:acl.app "+
                    "| append [| rest /services/data/ui/panels "+
                    "| stats count as panelsCt by eai:acl.app] "+
                    "| append [| rest /services/data/indexes "+
                    "| stats count as indexesCt by eai:acl.app] "+
                    "| append [| rest /services/saved/searches " +
                    "| search "+ SavedSearchesCollection.ALERT_SEARCH_STRING + " "+
                    "| stats count as alertsCt by eai:acl.app] " +
                    "| append [| rest /services/saved/searches " +
                    "| search NOT "+ SavedSearchesCollection.ALERT_SEARCH_STRING + " "+
                    "| stats count as reportsCt by eai:acl.app] "+
                    "| stats first(*) as * by eai:acl.app | fillnull";

                var jobPromise = this.searchJob.save({}, {
                    data: {
                        search: BASE_USAGE_SEARCH_STRING
                    }
                });
                jobPromise.done(function () {
                    this.searchJob.registerJobProgressLinksChild(
                        SearchJob.RESULTS,
                        this.model.allAppsObjectCounts,
                        function () {
                            if (this.searchJob.isDone()) {
                                this.model.allAppsObjectCounts.fetch();
                            }
                        },
                        this);
                    this.searchJob.startPolling();
                }.bind(this));

                this.listenTo(this.model.allAppsObjectCounts, "sync", this.pageRender);
            },

            bootstrapAppRemotes: function() {
                $.when(this.deferreds.serverInfo).then(function() {
                    if (this.deferreds.appRemotes.state() != "resolved") {
                        this.collection.appRemotes.setIncludeAll();
                        if (this.model.serverInfo.isLite()) {
                            this.collection.appRemotes.setLite();
                        }
                        var data = {};
                        this.collection.appRemotes.safeFetch({
                            cache: true,
                            data: data,
                            success: function(collection, response) {
                                this.deferreds.appRemotes.resolve();
                            }.bind(this),
                            error: function(collection, response) {
                                // Turn on an error flag to trigger error message on the page.
                                this.fetchFailed = true;
                                this.deferreds.appRemotes.resolve();
                            }.bind(this)
                        });
                    } else {
                        this.collection.appRemotes = undefined;
                        this.deferreds.appRemotes.resolve();
                    }
                }.bind(this));
            },

            bootstrapAppLocals: function() {
                // Base app locals lookup filters out invisible and disabled apps.
                // Override lookup options to include all apps.
                if (this.deferreds.appLocals.state() !== 'resolved') {
                    this.collection.appLocals.fetch({ //fetch all apps in one shot filtering out launcher on success
                        data: {
                            count: -1
                        },
                        success: function(collection, response) {
                            this.deferreds.appLocals.resolve();
                        }.bind(this),
                        error: function(collection, response) {
                            this.deferreds.appLocals.resolve();
                        }.bind(this)
                    });
                } else {
                    this.collection.appLocals = undefined;
                    this.deferreds.appLocals.resolve();
                }
            },

            bootstrapMessages: function() {
                if (this.deferreds.messages.state() !== 'resolved') {
                    this.collection.messages.fetch({
                        success: function(collection, response) {
                            this.deferreds.messages.resolve();
                        }.bind(this),
                        error: function(collection, response) {
                            this.deferreds.messages.resolve();
                        }.bind(this)
                    });
                } else {
                    this.collection.messages = undefined;
                    this.deferreds.messages.resolve();
                }
            },

            bootstrapUserPrefGeneralDefault: function() {
                if (this.deferreds.userPrefGeneralDefault.state() !== 'resolved') {
                    this.model.userPrefGeneralDefault.fetch({
                        data: {
                            app: 'system',
                            owner: this.model.application.get("owner")
                        },
                        success: function(model, response) {
                            this.deferreds.userPrefGeneralDefault.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.userPrefGeneralDefault.resolve();
                        }.bind(this)
                    });
                } else {
                    this.model.userPrefGeneralDefault = undefined;
                    this.deferreds.userPrefGeneralDefault.resolve();
                }
            },

            initializeAppsView: function() {
                if (!this.appsView) {
                    if (this.fetchFailed) {
                        this.appsView = new ErrorView({
                            collection: {
                                appRemotes: this.collection.appRemotes
                            },
                            model: {
                                user: this.model.user
                            }
                        });
                    } else {
                        this.appsView = new AppsView({
                            collection: {
                                appRemotes: this.collection.appRemotes,
                                appLocals: this.collection.appLocals,
                                messages: this.collection.messages
                            },
                            model: {
                                application: this.model.application,
                                user: this.model.user,
                                allAppsObjectCounts: this.model.allAppsObjectCounts,
                                serverInfo: this.model.serverInfo,
                                userPrefGeneralDefault: this.model.userPrefGeneralDefault
                            }
                        });
                    }
                }
            }
        });
    }
);