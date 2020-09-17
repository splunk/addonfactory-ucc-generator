/**
 * @author lbudchenko, jszeto
 *
 * This the router for the page at manager/system/vix_index_new. It allows the user to either create a new Hunk virtual index
 * or edit an existing one
 */

define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'models/services/data/vix/Index',
        'models/classicurl',
        'collections/services/data/vix/Providers',
        'views/virtual_indexes/config/IndexSetup'
    ],
    function(
        $,
        _,
        BaseRouter,
        IndexModel,
        ClassicurlModel,
        ProvidersCollection,
        IndexSetupView
        ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.indexModel = new IndexModel();
                this.providersCollection = new ProvidersCollection();
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                ClassicurlModel.fetch({
                    success: function(model, response) {
                        var providersDfd = this.providersCollection.fetch();
                        var indexDfd;

                        $.when(providersDfd).done(_(function() {

                            var id = ClassicurlModel.get('id');
                            if (id) {
                                this.indexModel.set(this.indexModel.idAttribute, id);
                                // TODO [JCS] Move this to a settings model. We shouldn't pollute the index model with this
                                this.indexModel.set({'mode':'edit'}, {silent: true});
                                this.setPageTitle(_('Edit virtual index').t());
                                indexDfd = this.indexModel.fetch();
                            } else {
                                this.indexModel.set({'mode':'new'}, {silent: true});
                                this.setPageTitle(_('New virtual index').t());
                                indexDfd = $.Deferred();
                                indexDfd.resolve();
                            }

                            $.when(indexDfd, this.deferreds.pageViewRendered).done(_(function() {
                                this.indexSetup = new IndexSetupView({
                                    model: {
                                        index: this.indexModel,
                                        application: this.model.application
                                    },
                                    collection: {
                                        providers: this.providersCollection
                                    }
                                });

                                $('.preload').replaceWith(this.pageView.el);
                                this.pageView.$('.main-section-body').append(this.indexSetup.render().el);
                            }).bind(this));
                        }).bind(this));
                    }.bind(this)
                });

            }
        });
    }
);