define(
    [
        'jquery',
        'underscore',
        'models/classicurl',
        'models/services/data/vix/IndexActions',
        'models/services/configs/SearchLimit',
        'models/search/Report',
        'collections/services/data/vix/Archives',
        'collections/services/data/vix/Providers',
        'collections/services/data/vix/Indexes',
        'collections/services/datamodel/DataModels',
        'collections/services/configs/Indexes',
        'collections/services/admin/conf-impersonations',
        'collections/services/authentication/Users',
        'views/virtual_indexes/Master',
        'views/virtual_indexes/NoLicense',
        'routers/Base'
    ],
    function(
        $,
        _,
        classicurlModel,
        IndexActions,
        LimitsConf,
        ReportModel,
        ArchivesCollection,
        ProviderCollection,
        IndexCollection,
        DataModelCollection,
        IndexesConfCollection,
        UserImpersonationCollection,
        SplunkUsers,
        VixMasterView,
        NoLicenseView,
        BaseRouter
        ) {
        return BaseRouter.extend({

            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Virtual indexes').t());
                this.enableAppBar = false;
                this.fetchUser = true;
                this.fetchServerInfo = true;

                this.indexesConfCollection = new IndexesConfCollection();
                this.deferreds.indexesConfCollection = this.indexesConfCollection.fetch({
                    data: {
                        search: 'name=provider-family*',
                        f: 'name'
                    }
                });
            },

            loadMainPage: function() {
                // providers: paginated list of providers on the providers page.
                // providersAll: all of the providers, used for determining max bandwidth for archived indexes.
                this.providers = new ProviderCollection();
                this.indexes = new IndexCollection();
                this.archives = new ArchivesCollection();
                this.providersAll = new ProviderCollection();
                this.indexActions = new IndexActions();
                this.userImpersonationCollection = new UserImpersonationCollection();
                this.splunkUsers = new SplunkUsers();
                this.limits = new LimitsConf();
                this.dataModels = new DataModelCollection();
                this.archiveAttempt = new ReportModel();

                this.deferreds.providers = $.Deferred();
                this.deferreds.providersAll = $.Deferred();
                this.deferreds.userImpersonation = $.Deferred();
                this.deferreds.splunkUsers = $.Deferred();
                this.deferreds.limitsDfd = $.Deferred();
                this.deferreds.dataModelsDfd = $.Deferred();
                this.deferreds.archiveAttemptDfd = $.Deferred();

                this.userImpersonationCollection.fetch().done(function() {
                    this.deferreds.userImpersonation.resolve();
                }.bind(this));
                this.splunkUsers.fetch().done(function() {
                    this.deferreds.splunkUsers.resolve();
                }.bind(this));

                this.providers.fetchData.set({'count': 10}, {silent:true});
                this.indexes.fetchData.set({'count': 10}, {silent:true});
                this.deferreds.indexes = this.indexes.fetch();
                this.providers.fetch().done(function() {
                    this.deferreds.providers.resolve();
                }.bind(this));

                this.providersAll.fetchData.set({count:-1}, {silent:true});
                this.providersAll.fetch().done(function() {
                    this.deferreds.providersAll.resolve();
                }.bind(this));

                this.archives.fetchData.set({count: 10}, {silent:true});
                this.deferreds.archives = this.archives.fetch();
                
                this.limits.fetch().done(function () {
                    this.deferreds.limitsDfd.resolve();
                }.bind(this));

                this.dataModels.fetchData.set({
                    owner: '-',
                    count: 0,
                    offset:0
                }, {silent:true});
                this.dataModels.fetch().done(function() {
                    this.deferreds.dataModelsDfd.resolve();
                }.bind(this));

                // Fetch the scheduled search that kicks off archive attempts.
                this.archiveAttempt.set('id', ReportModel.buildId(ReportModel.ARCHIVE_KICKOFF_SEARCH_ID, 'splunk_archiver', 'nobody'));
                this.deferreds.archiveAttemptDfd = this.archiveAttempt.fetch({data: {app: 'splunk_archiver', owner: 'nobody'}});

                this.providers.on('deleteApproved', function(victimModel) {
                    victimModel.destroy().done(_(function() {
                        this.providers.fetch();
                        this.providersAll.fetch().done(function() {
                            this.deferreds.providersAll.resolve();
                        }.bind(this));
                    }).bind(this));
                }, this);
                this.indexes.on('deleteApproved', this.onDeleteApproved, this);
                this.indexes.on('disableRequest', function(model) {this.onRequestChange(model, false);}, this);
                this.indexes.on('enableRequest', function(model) {this.onRequestChange(model, true);}, this);

                this.archives.on('deleteApproved', this.onDeleteApproved, this);
                this.archives.on('disableRequest', function(model) {this.onRequestChange(model, false);}, this);
                this.archives.on('enableRequest', function(model) {this.onRequestChange(model, true);}, this);

                this.masterView = new VixMasterView({
                    model: {
                        application: this.model.application,
                        limits: this.limits,
                        user: this.model.user,
                        archiveAttempt: this.archiveAttempt
                    },
                    collection: {
                        providers: this.providers,
                        indexes: this.indexes,
                        archives: this.archives,
                        providersAll: this.providersAll,
                        userImpersonation: this.userImpersonationCollection,
                        splunkUsers: this.splunkUsers,
                        dataModels: this.dataModels
                    },
                    providersDfd: this.deferreds.providers,
                    providersAllDfd: this.deferreds.providersAll,
                    userImpersonationDfd: this.deferreds.userImpersonation,
                    splunkUsersDfd: this.deferreds.splunkUsers,
                    limitsDfd: this.deferreds.limitsDfd,
                    dataModelsDfd: this.deferreds.dataModelsDfd,
                    archiveAttemptDfd: this.deferreds.archiveAttemptDfd
                });
            },

            fetchCollections: function() {
                this.providers.fetch();
                this.indexes.fetch();
                this.archives.fetch();
            },

            onRequestChange: function(victimModel, enable) {
                var links = victimModel.entry.links;
                var actionURL = links.get(enable ? 'enable' : 'disable');

                if (actionURL) {
                    this.indexActions.set('id',actionURL);
                    this.indexActions.save().done(_(function () {
                        this.fetchCollections();
                    }).bind(this));
                }
            },

            onDeleteApproved: function(victimModel) {
                victimModel.destroy().done(_(function() {
                    this.fetchCollections();
                }).bind(this));
            },

            loadNoLicense: function() {
                this.masterView = new NoLicenseView({
                    model: {
                        application: this.model.application
                    }
                });
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                this.deferreds.pageViewRendered.done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);
                }).bind(this));

                $.when(this.deferreds.pageViewRendered, this.deferreds.indexesConfCollection).done(_(function() {
                    if (this.indexesConfCollection.length > 0) {
                        this.loadMainPage();
                    } else {
                        this.loadNoLicense();
                    }
                    this.pageView.$('.main-section-body').append(this.masterView.render().el);
                }).bind(this));



            }
        });
    }
);
