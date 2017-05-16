import {getFormattedMessage} from 'app/util/messageUtil';
import CreateInputPage from 'app/views/pages/CreateInputPage';
import {configManager} from 'app/util/configManager';
import NavigatorModel from 'app/models/NavigatorModel';
import {PAGE_STYLE} from 'app/constants/pageStyle';

const INPUT_PAGE = 'inputs';
const CONFIGURATION_PAGE = 'configuration';

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

            var navigatorModel = new NavigatorModel({
                application: this.model.application
            });
            this.model = _.extend(this.model, {
                application: this.model.application,
                navigator: navigatorModel
            });

            // Navigator change event
            this.model.navigator.on('change:url', (model, nextUrl) =>  {
                this.navigate(nextUrl, {trigger: true, replace: false});
            });
        },

        _renderHeader: function () {
            $('.preload').replaceWith(this.pageView.el);
        },

        _parseQueryString: function (queryString) {
            let params = {};
            if (!_.isString(queryString)) {
                return params;
            }
            let queryParts = decodeURI(queryString).split(/&/g);
            _.each(queryParts, (value) => {
                let parts = value.split('=');
                if (parts.length >= 1) {
                    let val;
                    if (parts.length === 2){
                        val = parts[1];
                    }
                    params[parts[0]] = val;
                }
            });
            return params;
        },

        /*
            Get input configuration
        */
        _getComponent: function (service) {
            let services = configManager.unifiedConfig.pages.inputs.services;
            return _.find(services, s => {
                return s.name === service;
            });
        },

        _clearFooter: function () {
            $("footer[role=contentinfo]").remove();
        },

        _getInputView: function (params) {
            if (!_.isEmpty(params) && params.service && params.action) {
                let component = this._getComponent(params.service);
                if (!_.isUndefined(component) &&
                        component['style'] === PAGE_STYLE) {
                    return new CreateInputPage({
                        component: component,
                        navModel: this.model,
                        mode: params.action,
                        model: this.model.dataModel,
                        dispatcher: this.inputsPageView.dispatcher
                    });
                }
            }
            return this.inputsPageView;
        },

        /*
         THE ENTRY POINT
         */
        _route: function (locale, app, page, queryString) {
            let args = arguments,
                params = this._parseQueryString(queryString);
            this.model.navigator.set({params}, {silent: true});
            BaseRouter.prototype.page.apply(this, args);
            this.deferreds.pageViewRendered.done(() => {
                if (!this.inputsPageView) {
                    this.inputsPageView = new InputsPageView({
                        navModel: this.model
                    });
                }
                if (!this._headerReady) {
                    this._renderHeader();
                    this._headerReady = true;
                }
                this._clearFooter();
                if (page === INPUT_PAGE) {
                    this.setPageTitle(getFormattedMessage(116));
                    this.currentView = this._getInputView(params);
                    $(".main-section-body").html(this.currentView.render().$el);
                } else if (page === CONFIGURATION_PAGE) {
                    this.setPageTitle(getFormattedMessage(117));
                    const configurationPageView = new ConfigurationPageView();
                    configurationPageView.render();
                    $(".main-section-body").html(configurationPageView.el);
                    configurationPageView.changeTab(queryString);
                }
            });
        },

        _routeRooted: function (root, locale, app, page, queryString) {
            this.model.application.set({
                root: root
            }, {silent: true});
            this._route(locale, app, page, queryString);
        }
    });
});
