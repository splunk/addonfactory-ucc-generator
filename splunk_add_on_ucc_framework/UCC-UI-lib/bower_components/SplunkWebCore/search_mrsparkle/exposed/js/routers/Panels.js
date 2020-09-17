/**
 * @author ahebert
 * @date 3/15/15
 *
 * This is the router for the prebuilt panels manager page
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/BaseManager',
        'collections/services/authorization/Roles',
        'collections/services/authentication/Users',
        'views/panels/shared/PageController'
    ],
    function(
        $,
        _,
        Backbone,
        BaseManagerRouter,
        RolesCollection,
        UsersCollection,
        PanelController
    ) {
        return BaseManagerRouter.extend({
            routes: {
                ':locale/manager/:app/data/ui/:page': 'page',
                ':locale/manager/:app/data/ui/:page/': 'page',
                ':locale/manager/:app/data/ui/:page/_new': 'pageNew',
                ':locale/manager/:app/data/ui/:page/_new*splat': 'pageNew',
                ':locale/manager/:app/data/ui/:page/:panel?*splataction=edit': 'pageEdit', // For backwards compatibility edit mode url
                ':locale/manager/:app/data/ui/:page/*splat': 'page',
                '*root/:locale/manager/:app/data/ui/:page': 'pageRooted',
                '*root/:locale/manager/:app/data/ui/:page/': 'pageRooted',
                '*root/:locale/manager/:app/data/ui/:page/_new': 'pageNewRooted',
                '*root/:locale/manager/:app/data/ui/:page/_new*splat': 'pageNewRooted',
                '*root/:locale/manager/:app/data/ui/:page/:panel?*splataction=edit': 'pageEditRooted', // For backwards compatibility edit mode url
                '*root/:locale/manager/:app/data/ui/:page/*splat': 'pageRooted',
                '*splat': 'notFound'
            },

            initialize: function() {
                BaseManagerRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.fetchAppLocals = true;
                this.fetchServerInfo = true;

                this.collection.rolesCollection = new RolesCollection();
                this.deferredRoles = this.collection.rolesCollection.fetch();

                this.collection.usersSearch = new UsersCollection();
                this.collection.users = new UsersCollection();
                this.deferredUsers = this.collection.users.fetch({data: {count: '250'}});
            },

            page: function(locale, app, page, action) {
                BaseManagerRouter.prototype.page.apply(this, arguments);

                this.setPageTitle(_('Prebuilt panels').t());

                $.when(this.deferreds.pageViewRendered, this.deferredRoles, this.deferredUsers).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    if (this.panelController) {
                        this.panelController.detach();
                    }
                    this.panelController = new PanelController({
                        model: this.model,
                        collection: this.collection,
                        router: this
                    });
                    if (action) {
                        // Trigger action from url.
                        this.panelController.model.controller.trigger(action);
                    }
                    this.pageView.$('.main-section-body').append(this.panelController.render().el);
                }).bind(this));
            }
        });
    }
);