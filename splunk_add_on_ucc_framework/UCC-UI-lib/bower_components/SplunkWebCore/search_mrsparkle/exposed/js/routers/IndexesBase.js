/**
 * @author jszeto
 * @date 4/7/15
 *
 * Base Router for Index Managers
 *
 *
 */

define(
    [
        'underscore',
        'jquery',
        'routers/BaseManager'
    ],
    function(
        _,
        $,
        BaseManagerRouter
    ) {
        return BaseManagerRouter.extend({
            routes: {
                ':locale/manager/:app/data/:page/*splat#': 'pageList',
                ':locale/manager/:app/data/:page': 'pageList',
                ':locale/manager/:app/data/:page/': 'pageList',
                ':locale/manager/:app/data/:page/_new': 'pageNew',
                ':locale/manager/:app/data/:page/_new*splat': 'pageNew',
                ':locale/manager/:app/data/:page/:index?*splataction=edit': 'pageEdit', // For backwards compatibility edit mode url
                ':locale/manager/:app/data/:page/*splat': 'pageList', // Any other, direct to listing page
                '*root/:locale/manager/:app/data/:page/*splat#': 'pageListRooted',
                '*root/:locale/manager/:app/data/:page': 'pageListRooted',
                '*root/:locale/manager/:app/data/:page/': 'pageListRooted',
                '*root/:locale/manager/:app/data/:page/_new': 'pageNewRooted',
                '*root/:locale/manager/:app/data/:page/_new*splat': 'pageNewRooted',
                '*root/:locale/manager/:app/data/:page/:index?*splataction=edit': 'pageEditRooted', // For backwards compatibility edit mode url
                '*root/:locale/manager/:app/data/:page/*splat': 'pageListRooted', // Any other, direct to listing page
                '*splat': 'notFound'
            },
            initialize: function() {
                BaseManagerRouter.prototype.initialize.apply(this, arguments);
                this.fetchUser = true;
                this.enableAppBar = false;
                this.fetchAppLocals = true;
                this.setPageTitle(_('Manage Indexes').t());
            },
            page: function(locale, app, page, action) {
                BaseManagerRouter.prototype.page.apply(this, arguments);

                $.when(this.deferreds.pageViewRendered, this.deferreds.serverInfo).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    // Pass the collection classes, dialog class and view templates as parameters
                    // so that we can have multiple versions (core/cloud/lite)
                    if (!this.indexesController){
                        this.indexesController = this.createController();
                    }
                    if (action) {
                        // Trigger action from url.
                        this.indexesController.model.controller.trigger(action);
                    }
                    this.pageView.$('.main-section-body').append(this.indexesController.render().el);
                }).bind(this));
            },
            createController: function() {
                throw new Error("You must override the createController function");
            }
        });
    }
);
