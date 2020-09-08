define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'models/services/data/vix/Provider',
        'models/classicurl',
        'collections/services/configs/Indexes',
        'views/virtual_indexes/config/ProviderSetup'
    ],
    function(
        $,
        _,
        BaseRouter,
        ProviderModel,
        ClassicurlModel,
        IndexesConfCollection,
        ProviderSetupView
        ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.providerModel = new ProviderModel();
                this.indexesConfCollection = new IndexesConfCollection();
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                this.deferreds.pageViewRendered.done(function() {
                    $('.preload').replaceWith(this.pageView.el);
                }.bind(this));

                ClassicurlModel.fetch({
                    success: function(model, response) {
                        var providerDfd;
                        // Fetch the index
                        var indexesDfd = this.indexesConfCollection.fetch({
                            data: {
                                search: 'name=provider-family*',
                                f: 'name'
                            }
                        });

                        $.when(indexesDfd).done(_(function() {
                            var id = ClassicurlModel.get('id');
                            var mode = ClassicurlModel.get('mode');
                            if (id && mode && mode === 'clone') { // CLONE PROVIDER
                                this.providerModel.set(this.providerModel.idAttribute, id);
                                providerDfd = this.providerModel.fetch();
                                this.mode = 'clone';
                                this.setPageTitle(_('Clone provider').t());
                            } else if (id) { // UPDATE PROVIDER
                                this.providerModel.set(this.providerModel.idAttribute, id);
                                providerDfd = this.providerModel.fetch();
                                this.mode = 'edit';
                                this.setPageTitle(_('Edit provider').t());
                            } else { // CREATE PROVIDER
                                // fetch _new with vix.family set to the first available family name to prepopulate the form
                                this.mode = 'new';
                                var fetchOptions = {};
                                if (this.indexesConfCollection.length && this.indexesConfCollection.at(0).entry.get('name')) {
                                    var familyName = this.indexesConfCollection.at(0).entry.get('name').match(/provider-family:(.*)/)[1];
                                    fetchOptions = {data:{'vix.family':familyName}};
                                }
                                providerDfd = this.providerModel.fetch(fetchOptions);
                                this.setPageTitle(_('Add new provider').t());
                            }

                            $.when(providerDfd, this.deferreds.pageViewRendered).done(_(function() {
                                if (mode && mode === 'clone') {
                                    var clonedModel = this.providerModel.clone();
                                    // Unset name and id on cloned model.
                                    clonedModel.unset('id');
                                    clonedModel.entry.unset('id');
                                    clonedModel.entry.unset('name');
                                    clonedModel.entry.content.unset('name');
                                    this.providerModel = clonedModel;
                                }
                                this.providerSetup = new ProviderSetupView({
                                    model: {
                                        provider: this.providerModel,
                                        application: this.model.application
                                    },
                                    collection: {
                                        indexesConf: this.indexesConfCollection
                                    },
                                    mode: this.mode
                                });

                                // TODO [JCS] Are we doing preloading?
    //                            if (this.shouldRender) {
                                this.providerSetup.render().appendTo(this.pageView.$('.main-section-body'));
    //                            }
                            }).bind(this));
                        }).bind(this));
                    }.bind(this)
                });
            }
        });
    }
);