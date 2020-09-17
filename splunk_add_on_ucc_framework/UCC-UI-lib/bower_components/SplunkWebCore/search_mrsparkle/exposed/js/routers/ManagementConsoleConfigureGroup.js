define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/ManagementconsoleBase',
        'collections/managementconsole/Stanzas',
        'collections/managementconsole/Changes',
        'collections/managementconsole/Groups',
        'collections/managementconsole/Apps',
        'collections/managementconsole/topology/Instances',
        'models/classicurl',
        'models/managementconsole/Group',
        'models/managementconsole/topology/Instance',
        'models/managementconsole/App',
        'models/managementconsole/StanzasMeta',
        'models/services/configs/Spec',
        'models/managementconsole/DmcFetchData',
        'models/managementconsole/ChangesCollectionFetchData',
        'models/managementconsole/topology/Filter',
        'views/managementconsole/configuration/group/Master',
        'helpers/managementconsole/url'
    ],
    function(
        _,
        $,
        Backbone,
        DmcBaseRouter,
        StanzasCollection,
        ChangesCollection,
        GroupsCollection,
        AppsCollection,
        InstancesCollection,
        classicUrlModel,
        GroupModel,
        InstanceModel,
        AppModel,
        StanzasMetaModel,
        ConfSpecModel,
        DmcFetchData,
        ChangesCollectionFetchData,
        FilterModel,
        GroupConfigurationView,
        urlHelper
    ) {
        return DmcBaseRouter.extend({
            initialize: function() {
                DmcBaseRouter.prototype.initialize.apply(this, arguments);

                this.enableFooter = false;

                this.children = this.children || {};

                this.model.state = new Backbone.Model({
                    isStanzaExpanded: false
                });

                this.initializeStanzasCollection();
                this.initializeConfigurationModel();
                this.initializeInstanceModel();
                this.initializeStanzasMetaModel();
                this.initializeConfSpecModel();
                this.initializeConfSpecStanzaModel();
                this.intializeConfSpecDefaultModel();
                this.initializePendingChangesCollection();
            },

            initializeStanzasCollection: function() {
                this.collection.stanzas = new StanzasCollection();
                // Default sort key is name, sort direction is asc
                this._defaultFetchData(
                    this.collection.stanzas,
                    {
                        sortKey: 'name',
                        sortDirection: 'asc',
                        count: 25,
                        offset: 0
                    }
                );
                this.collection.stanzas.fetchData.on('change:type', function(model, value) {
                    urlHelper.replaceState({ type: value });
                    this.model.confSpec.fetchData.set('filename', value);
                    this.model.confStanzaSpec.fetchData.set('filename', value);
                    this.model.confDefaultSpec.fetchData.set('filename', value);
                }.bind(this));
            },

            initializeConfigurationModel: function() {
                var app = this._getApp(),
                    group = this._getGroup();

                this.model.configuration = app ? app : group;
                this.deferreds.configuration = $.Deferred();

                if (this.model.configuration) {
                    this.deferreds.configuration = this.model.configuration.fetch().done(function() {
                        this.initializeType();
                        this.initializeDeployStatusEntities();
                    }.bind(this));
                } else {
                    this.model.configuration = new GroupModel();
                }
            },

            initializeInstanceModel: function() {
                var instanceName = urlHelper.getUrlParam('instance');

                this.model.instance = new InstanceModel();
                this.deferreds.instance = $.Deferred();
                this.deferreds.createStanzas = $.Deferred();

                this._defaultFetchData(
                    this.model.instance,
                    {
                        // Causes instance to be augmented with the related bundles
                        relatedBundles: 1
                    }
                );

                if (instanceName) {
                    this.model.instance.entry.set('name', instanceName);

                    this._defaultFetchData(
                        this.collection.stanzas,
                        {
                            instance: instanceName,
                            // Returns all related bundles by default
                            bundle: '-'
                        }
                    );

                    // In this case we also need to not only the stanzas collection
                    // for the wildcard bundles, but also the stanzas collection
                    // for this instance's bundle, to determine the actions available
                    // (e.g. if the user has "create" capabilities)
                    this.collection.createStanzas = new StanzasCollection();

                    this.deferreds.instance = this.model.instance.fetch().done(function() {
                        this.model.configuration.entry.set('name', this.model.instance.entry.content.get('instanceGroupName'));
                        this.model.configuration.fetch().done(function() {
                            this.initializeType();
                            this.initializeDeployStatusEntities();
                            this.deferreds.configuration.resolve();

                            this._defaultFetchData(
                                this.collection.createStanzas,
                                {
                                    count: 1,
                                    bundle: this.model.configuration.getBundleName()
                                }
                            );
                            this.collection.createStanzas.fetch().done(function() {
                                this.deferreds.createStanzas.resolve();
                            }.bind(this));
                        }.bind(this));
                    }.bind(this));
                } else {
                    this.deferreds.instance.resolve();
                    this.deferreds.createStanzas.resolve();
                }
            },

            initializeStanzasMetaModel: function() {
                this.model.stanzasMeta = new StanzasMetaModel();
                this.deferreds.stanzasMeta = this.model.stanzasMeta.fetch();
            },

            initializeConfSpecModel: function() {
                this.model.confSpec = new ConfSpecModel();
            },

            initializeConfSpecStanzaModel: function() {
                this.model.confStanzaSpec = new ConfSpecModel();
            },

            intializeConfSpecDefaultModel: function() {
                this.model.confDefaultSpec = new ConfSpecModel();
                this._defaultFetchData(
                    this.model.confDefaultSpec,
                    {
                        stanza: 'default'
                    }
                );
            },

            initializeType: function() {
                var type = urlHelper.getUrlParam('type');

                if (type && !this.collection.stanzas.fetchData.has('type')) {
                    this.collection.stanzas.fetchData.set({
                        type: type,
                        bundle: this.collection.stanzas.fetchData.get('bundle') ||
                        this.model.configuration.getBundleName()
                    });
                }
            },

            // Initialize a Pending Changes collection, no initial fetching
            initializePendingChangesCollection: function() {
                var fetchData = new ChangesCollectionFetchData({
                    count: 25,
                    offset: 0,
                    sortKey: 'name',
                    sortDirection: 'desc',
                    query: '{}',
                    state: 'pending'
                });

                this.collection.pendingChanges = new ChangesCollection(null, {
                    fetchData: fetchData
                });
            },

            initializeDeployStatusEntities: function() {
                if (!urlHelper.getUrlParam('instance')) {
                    this.collection.deployStatus = new InstancesCollection();
                    this.collection.deployStatus.fetchData.set(this.model.configuration.getDefaultDeployStatusFetchData());
                }
            },

            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);

                this.setPageTitle(_('Configure Group').t());

                $.when(
                    this.deferreds.pageViewRendered,
                    this.deferreds.stanzasMeta,
                    this.deferreds.configuration,
                    this.deferreds.createStanzas,
                    classicUrlModel.fetch()
                ).done(function() {
                        $('.preload').replaceWith(this.pageView.el);

                        this.children.groupConfiguration = new GroupConfigurationView({
                            model: {
                                configuration: this.model.configuration,
                                instance: this.model.instance,
                                stanzasMeta: this.model.stanzasMeta,
                                state: this.model.state,
                                confSpec: this.model.confSpec,
                                confStanzaSpec: this.model.confStanzaSpec,
                                confDefaultSpec: this.model.confDefaultSpec
                            },
                            collection: {
                                stanzas: this.collection.stanzas,
                                createStanzas: this.collection.createStanzas,
                                pendingChanges: this.collection.pendingChanges,
                                deployStatus: this.collection.deployStatus
                            }
                        });

                        this.pageView.$('.main-section-body').append(this.children.groupConfiguration.render().$el);
                    }.bind(this));
            },

            _getApp: function() {
                var app = null,
                    appName = urlHelper.getUrlParam('app');

                if (appName) {
                    app = new AppModel();
                    app.entry.set('name', appName);
                    this.collection.stanzas.fetchData.set(
                        {
                            bundle: app.getBundleName()
                        },
                        {
                            silent: true
                        }
                    );
                }

                return app;
            },

            _getGroup: function() {
                var group = null,
                    groupName = urlHelper.getUrlParam('group');

                if (groupName) {
                    group = new GroupModel();
                    group.entry.set('name', groupName);
                }

                return group;
            },


            // Set some defaults without causing a fetch
            _defaultFetchData: function(backboneObject, defaults) {
                backboneObject.fetchData.set(defaults, { silent: true });
            }
        });
    }
);