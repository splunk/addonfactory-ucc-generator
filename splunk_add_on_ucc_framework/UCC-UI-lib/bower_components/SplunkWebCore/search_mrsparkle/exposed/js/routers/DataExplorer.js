define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'controllers/DataExplorerController'
    ],
    function(
        _,
        $,
        BaseRouter,
        DataExplorerController
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Explore Data').t());
                this.fetchUser = true;
                this.enableFooter = false;
                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                $.when(this.deferreds.pageViewRendered).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    this.dataExplorer = new DataExplorerController({model:this.model,
                                                                    collection: this.collection});
                    this.pageView.$('.main-section-body').append(this.dataExplorer.render().el);


                }).bind(this));
            }
        });
    }
);