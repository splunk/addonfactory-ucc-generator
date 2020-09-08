define(
[
    'jquery',
    'backbone',
    'underscore',
    'routers/Base'
],
function(
    $,
    Backbone,
    _,
    BaseRouter
) {
    return BaseRouter.extend({
        routes: {
            ':locale/manager/:app/*page': 'page',
            '*root/:locale/manager/:app/*page': 'pageRooted' //TODO
        },
        initialize: function(options) {
            BaseRouter.prototype.initialize.apply(this, arguments);
            this.fetchAppLocals = true;
            this.deferreds.basePageRendered = new $.Deferred();
            this.enableAppBar = false;
        },
        page: function(locale, app, page) {
            BaseRouter.prototype.page.apply(this, arguments);
            $.when(this.deferreds.pageViewRendered).done(function() {
                $('.preload').replaceWith(this.pageView.el);
                this.deferreds.basePageRendered.resolve();
            }.bind(this));
            return this;
        }
    });
});
