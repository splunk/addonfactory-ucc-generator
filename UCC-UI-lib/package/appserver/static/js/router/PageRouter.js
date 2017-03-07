define([
    'lodash',
    'jquery',
    'backbone',
    'routers/Base',
    'uri/route',
    'app/views/pages/InputsPage',
    'app/views/pages/ConfigurationPage'
], function (
    _,
    $,
    Backbone,
    BaseRouter,
    route,
    InputsPageView,
    ConfigurationPageView
) {
    return BaseRouter.extend({
        routes: {
            ':locale/app/:app/:page(/)': '_route',
            '*root/:locale/app/:app/:page(/)': '_routeRooted'
        },
        initialize: function () {
            BaseRouter.prototype.initialize.apply(this, arguments);
            // flag that indicate whether header has been rendered
            this._headerReady = false;
        },

        _renderHeader: function() {
            $('.preload').replaceWith(this.pageView.el);
        },
        /*
         THE ENTRY POINT
         */
        _route: function (locale, app, page, queryString) {
            var args = arguments;
            BaseRouter.prototype.page.apply(this, args);
            this.deferreds.pageViewRendered.done(() => {
                if (!this._headerReady) {
                    this._renderHeader();
                    this._headerReady = true;
                }
                if (page === 'inputs') {
                    this.setPageTitle(_('Inputs').t());
                    const inputsPageView = new InputsPageView();
                    inputsPageView.render();
                    $(".main-section-body").html(inputsPageView.el);
                } else if (page === 'configuration') {
                    this.setPageTitle(_('Configuration').t());
                    const configurationPageView = new ConfigurationPageView();
                    configurationPageView.render();
                    $(".main-section-body").html(configurationPageView.el);
                    configurationPageView.changeTab(queryString);
                }
            });
        },
        _routeRooted: function (root, locale, app, page, queryString) {
            this._route(locale, app, page, queryString);
        },
    });
});
