define(
    [
        'jquery',
        'underscore',
        'module',
        'models/classicurl',
        'views/Base',
        'views/virtual_indexes/ArchiveTab',
        'views/virtual_indexes/IndexesTab',
        'views/virtual_indexes/ProvidersTab',
        'views/virtual_indexes/UserImpersonationTab',
        'views/virtual_indexes/DeleteDialog',
        'views/virtual_indexes/EditArchiveDialog',
        'views/virtual_indexes/EditCutoffDialog',
        'views/virtual_indexes/NoLicense',
        'contrib/text!views/virtual_indexes/Master.html',
        'uri/route',
        'bootstrap.tab',
        './Master.pcss',
        './shared.pcss'
    ],
    function(
        $,
        _,
        module,
        classicurlModel,
        BaseView,
        ArchiveTabView,
        IndexesTabView,
        ProvidersTabView,
        UserImpersonationTabView,
        DeleteDialog,
        EditArchiveDialog,
        EditCutoffDialog,
        NoLicenseView,
        MasterTemplate,
        route,
        bootstrapTab,
        css,
        cssShared
        ){
        return BaseView.extend({
            moduleId: module.id,
            template: MasterTemplate,
            /**
             * @param {Object} options {
             *
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.showVixTab = this.model.user.canUseVirtualIndexes();

                this.listenTo(this.collection.providers.paging, "change:total", this.updateProvidersCount);
                this.listenTo(this.collection.indexes.paging, "change:total", this.updateIndexesCount);
                this.listenTo(this.collection.archives.paging, "change:total", this.updateArchiveCount);

                if (this.showVixTab) {
                    this.children.indexesTabView = new IndexesTabView({
                        collection: this.collection,
                        model: this.model
                    });
                }  else {
                    this.children.indexesTabView = new NoLicenseView({
                        model: {
                            application: this.model.application
                        }
                    });
                }
                this.children.archiveTabView = new ArchiveTabView({
                    collection: this.collection,
                    model: this.model
                });
                this.children.providersTabView = new ProvidersTabView({
                    collection: this.collection,
                    model: this.model,
                    showVixTab: this.showVixTab
                });
                this.children.userImpersonationTabView = new UserImpersonationTabView({
                    collection: this.collection,
                    model: this.model,
                    userImpersonationDfd: this.options.userImpersonationDfd,
                    splunkUsersDfd: this.options.splunkUsersDfd
                });

                this.children.deleteDialog = new DeleteDialog({
                    model: this.model
                });

                this.collection.providers.on('deleteRequest', function(victimModel) {
                    this.children.deleteDialog = new DeleteDialog({
                        collection: this.collection.providers,
                        model: victimModel,
                        onHiddenRemove: true,
                        type: "provider"
                    });
                    $('body').append(this.children.deleteDialog.render().el);
                    this.children.deleteDialog.show();
                }, this);
                this.collection.indexes.on('deleteRequest', function(victimModel) {
                    this.children.deleteDialog = new DeleteDialog({
                        collection: this.collection.indexes,
                        model: victimModel,
                        onHiddenRemove: true,
                        type: "index"
                    });
                    $('body').append(this.children.deleteDialog.render().el);
                    this.children.deleteDialog.show();
                }, this);
                this.collection.archives.on('deleteRequest', function(victimModel) {
                    this.children.deleteDialog = new DeleteDialog({
                        collection: this.collection.archives,
                        model: victimModel,
                        onHiddenRemove: true,
                        type: "archive"
                    });
                    $('body').append(this.children.deleteDialog.render().el);
                    this.children.deleteDialog.show();
                }, this);

                this.collection.indexes.on('search', this.onSearch, this);
                this.collection.archives.on('search', this.onSearch, this);
                this.collection.archives.on('editArchive', this.onEditArchive, this);
                this.collection.archives.on('editCutoffSec', this.onEditArchiveCutoff, this);

            },
            events: {
                'click #providers-tab a': function() {
                    classicurlModel.save({t: 'providers'});
                },
                'click #indexes-tab a': function() {
                    classicurlModel.save({t: 'indexes'});
                },
                'click #archive-tab a': function() {
                    classicurlModel.save({t: 'archives'});
                },
                'click #impersonation-tab a': function() {
                    classicurlModel.save({t: 'impersonation'});
                }
            },
            updateProvidersCount: function(){
                var el = this.$el.find('.provider_count');
                el.text(this.collection.providers.paging.get("total"));
            },
            updateIndexesCount: function(){
                var el = this.$el.find('.indexes_count');
                el.text(this.collection.indexes.paging.get("total"));
            },
            updateArchiveCount: function(){
                var el = this.$el.find('.archive_count');
                el.text(this.collection.archives.paging.get("total"));
            },
            makeDocLink: function(location) {
                return route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    location
                );
            },
            onSearch: function(search) {
                var url = route.search(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'search',
                    {
                        data: {
                            q: 'index='+search
                        }
                    }
                );
                window.open(url,'_blank');
            },
            onEditArchive: function(archive) {
                this.children.editDialog = new EditArchiveDialog({
                    model: {archive: archive}
                });
                $('body').append(this.children.editDialog.render().el);
                this.children.editDialog.show();
            },
            onEditArchiveCutoff: function(archive) {
                this.children.editCutoffDialog = new EditCutoffDialog({
                    model: {archive: archive,
                            application: this.model.application,
                            limits: this.model.limits}
                });
                $('body').append(this.children.editCutoffDialog.render().el);
                this.children.editCutoffDialog.show();
            },

            render: function() {
                var urlDfd = $.Deferred();
                classicurlModel.fetch({
                    success: function(model, response) {
                        var t = classicurlModel.get('t');
                        urlDfd.resolve({t:t});
                    }
                });

                var html = this.compiledTemplate({
                    provider_count: this.collection.providers.paging.get("total"),
                    indexes_count: this.collection.indexes.paging.get("total"),
                    archive_count: this.collection.archives.paging.get("total"),
                    docLink: this.makeDocLink('manager.virtualindex.dashboard'),
                    showVixTab: this.showVixTab
                    }),
                $html = $(html);

                // open tab requested by the url
                $.when(urlDfd).done(function(args) {
                    if ($html.filter('.nav-tabs').find('a[href="#vix_'+args.t+'"]').length == 0) {
                        $html.find('#vix_providers').addClass('active');
                        return;
                    }
                    $html.filter('.nav-tabs').find('a[href="#vix_'+args.t+'"]').tab('show');
                    $html.find('#vix_'+args.t).addClass('active');
                });

                this.options.dataModelsDfd.done(function() {
                    $html.find('#vix_indexes').append(this.children.indexesTabView.render().el);
                }.bind(this));
                $.when(this.options.limitsDfd, this.options.archiveAttemptDfd).done(function() {
                    $html.find('#vix_archives').append(this.children.archiveTabView.render().el);
                }.bind(this));

                $html.find('#vix_providers').append(this.children.providersTabView.render().el);
                $html.find('#vix_impersonation').append(this.children.userImpersonationTabView.render().el);
                this.$el.html($html);

                return this;
            }

        });
    }
);
