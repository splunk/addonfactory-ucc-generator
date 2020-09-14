define([
    'jquery',
    'underscore',
    'backbone',
    'routers/ManagementconsoleBase',
    'models/managementconsole/DmcFetchData',
    'models/managementconsole/ChangesCollectionFetchData',
    'collections/managementconsole/Changes',
    'collections/managementconsole/Groups',
    'views/managementconsole/outputs/PageController'
], function (
    $,
    _,
    Backbone,
    ManagementconsoleBase,
    FetchData,
    ChangesCollectionFetchData,
    ChangesCollection,
    ServerClassesCollection,
    PageController
) {
    return ManagementconsoleBase.extend({
        initialize: function initialize() {
            ManagementconsoleBase.prototype.initialize.apply(this, arguments);
            this.setPageTitle(_('Outputs').t());
            this.model.controller = new Backbone.Model();

            this.collection.serverclasses = new ServerClassesCollection();
            this.collection.serverclasses.fetchData.set({
                type: 'custom',
                names_only:'true'
            }, { silent: true });
            this.deferreds.serverclasses = this.collection.serverclasses.fetch();

            this.collection.pendingChanges = new ChangesCollection(null, {
                fetchData: new ChangesCollectionFetchData({
                    count: 25,
                    offset: 0,
                    sortKey: 'name',
                    sortDirection: 'desc',
                    query: '{}',
                    state: 'pending'
                })
            });
        },

        page: function page(locale, app, page) {
            ManagementconsoleBase.prototype.page.apply(this, arguments);
            $.when(
                this.deferreds.pageViewRendered,
                this.deferreds.user,
                this.deferreds.serverclasses
            ).done(_(function renderPage() {
                $('.preload').replaceWith(this.pageView.el);

                if (this.pageController) {
                    this.pageController.detach();
                }
                this.pageController = new PageController({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });
                this.pageView.$('.main-section-body').append(this.pageController.render().el);
            }).bind(this));
        }
    });
});
