/**
 * Router for All Configurations page
 * @author nmistry
 * @date 09/08/2016
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'routers/Base',
    'collections/services/authentication/Users',
    'collections/services/authorization/Roles',
    'views/bulkreassign/PageController'
], function(
    $,
    _,
    Backbone,
    BaseRouter,
    UsersCollection,
    RolesCollection,
    PageController
) {
    return BaseRouter.extend({

        initialize: function() {
            BaseRouter.prototype.initialize.apply(this, arguments);
            this.enableAppBar = false;
            this.fetchAppLocals = true;
            this.fetchServerInfo = true;

            // The controller model is passed down to all subviews and
            // serves as the event bus for messages between the controller and views.
            this.model.controller = new Backbone.Model();

            this.collection.usersSearch = new UsersCollection();
            this.collection.users = new UsersCollection();
            this.deferreds.users = this.collection.users.fetch({
                data: {
                    count: 5,
                    search: 'roles=*'
                }
            });

            this.collection.rolesCollection = new RolesCollection();
            this.deferreds.roles = this.collection.rolesCollection.fetch();
            this.deferreds.classicurl = this.model.classicurl.fetch();
        },

        page: function(locale, app, page) {
            BaseRouter.prototype.page.apply(this, arguments);

            this.setPageTitle(_('Reassign Knowledge Objects').t());

            $.when(
                this.deferreds.pageViewRendered,
                this.deferreds.classicurl,
                this.deferreds.users,
                this.deferreds.roles
            ).done(_(function() {
                $('.preload').replaceWith(this.pageView.el);

                if (this.pageController) {
                    this.pageController.detach();
                }
                this.pageController = new PageController({
                    model: this.model,
                    collection: this.collection
                });
                this.pageView.$('.main-section-body').append(this.pageController.render().el);
            }).bind(this));
        }
    });
});
