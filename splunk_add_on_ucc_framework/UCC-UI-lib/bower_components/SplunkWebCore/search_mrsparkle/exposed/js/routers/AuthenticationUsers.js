define(
[
    'jquery',
    'underscore',
    'collections/services/authentication/Users',
    'models/shared/EAIFilterFetchData',
    'routers/BaseListings',
    'views/authentication_users/Master'
],
function(
    $,
    _,
    UsersCollection,
    EAIFilterFetchData,
    BaseListingsRouter,
    UsersView
){
    return BaseListingsRouter.extend({

        initialize: function() {
            BaseListingsRouter.prototype.initialize.apply(this, arguments);

            this.setPageTitle(_('Manage Accounts').t());
            this.enableAppBar = false;

            // models
            this.model.metadataModel = new EAIFilterFetchData({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 0,  // no pagination for Splunk Light, just load all users
                offset: 0,
                ownerSearch: "*",
                visible: false
            });
            this.model.metadataModel.on('change', this.fetchListCollection, this);

            // collections
            this.collection.users = new UsersCollection();
        },

        initializeAndRenderViews: function() {
            this.usersView = new UsersView({
                model: this.model,
                collection: this.collection,
                deferreds: this.deferreds
            });
            this.pageView.$('.main-section-body').html(this.usersView.render().el);
        },

        fetchListCollection: function() {
            var search = this.model.metadataModel.getCalculatedSearch();

            this.collection.users.fetch({
                data: {
                    search: search,
                    app: "-",
                    owner: "-",
                    sort_dir: this.model.metadataModel.get('sortDirection'),
                    sort_key: this.model.metadataModel.get('sortKey').split(','),
                    sort_mode: ['auto', 'auto'],
                    count: this.model.metadataModel.get("count"),
                    offset: this.model.metadataModel.get("offset")
                }
            });
        }

    });

});
