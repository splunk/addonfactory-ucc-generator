/**
 * @author jszeto
 * @date 9/30/14
 *
 * This the router for the page at manager/system/archive_new. It allows the user to either create one or more archive
 * indexes
 */

define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'models/services/data/vix/Index',
        'models/services/configs/SearchLimit',
        'collections/services/data/vix/Archives',
        'collections/services/data/vix/Providers',
        'collections/services/data/Indexes',
        'views/virtual_indexes/config/ArchiveSetup'
    ],
    function(
        $,
        _,
        BaseRouter,
        IndexModel,
        LimitsConf,
        ArchivesCollection,
        ProvidersCollection,
        SplunkIndexesCollection,
        ArchiveSetupView
        ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.indexModel = new IndexModel();
                this.providersCollection = new ProvidersCollection();
                this.splunkIndexes = new SplunkIndexesCollection();
                this.allArchives = new ArchivesCollection();
                this.limits = new LimitsConf();
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                // Fetch the providers, splunk indexes and archives
                var providersDfd = this.providersCollection.fetch();
                this.splunkIndexes.fetchData.set({count: -1, search:'isInternal=false AND isVirtual=false'}, {silent:true});
                this.allArchives.fetchData.set({count: -1}, {silent:true});
                var splunkIndexesDfd = this.splunkIndexes.fetch();
                var allArchivesDfd = this.allArchives.fetch();
                var limitsDfd = this.limits.fetch();

                this.setPageTitle(_('New Archive').t());
                $.when(providersDfd, splunkIndexesDfd, allArchivesDfd, limitsDfd,
                       this.deferreds.pageViewRendered).done(_(function() {
                    this.indexSetup = new ArchiveSetupView({
                        model: {
                            application: this.model.application,
                            limits: this.limits
                        },
                        collection: {
                            providers: this.providersCollection,
                            allArchives: this.allArchives,
                            splunkIndexes: this.splunkIndexes
                        }
                    });

                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.indexSetup.render().el);
                }).bind(this));

            }
        });
    }
);