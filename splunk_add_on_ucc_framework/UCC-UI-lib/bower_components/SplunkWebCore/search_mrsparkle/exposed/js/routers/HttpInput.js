/**
 * This the router for the page at manager/system/http-input.
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/Base',
        'views/inputs/http/PageController'
    ],
    function(
        $,
        _,
        Backbone,
        BaseRouter,
        PageController
        ) {
        return BaseRouter.extend({

            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.fetchAppLocals = true;

                // The controller model is passed down to all subviews and serves as the event bus for messages between
                // the controller and views.
                this.model.controller = new Backbone.Model();
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                this.setPageTitle(_('HTTP Event Collector').t());

                $.when(this.deferreds.pageViewRendered).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    if (this.inputController) {
                        this.inputController.detach();
                    }
                    this.inputController = new PageController({
                        model: this.model,
                        collection: this.collection
                    });
                    this.pageView.$('.main-section-body').append(this.inputController.render().el);
                }).bind(this));
            }
        });
    }
);