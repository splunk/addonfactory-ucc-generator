define(function(require) {
    var routerUtils = require('util/router_utils');
    var Backbone = require('backbone');
    var $ = require('jquery');
    var _ = require('underscore');
    var utils = require('../utils');
    var pdfUtils = require('util/pdf_utils');
    var console = require('util/console');
    var route = require('uri/route');
    var sharedModels = require('../sharedmodels');
    var splunkd_utils = require('util/splunkd_utils');
    var SplunkUtil = require('splunk.util');
    var protections = require('../protections');
    var Reports = require('collections/search/Reports');
    var DashboardModel = require('./dashboardmodel');
    var DashboardRouter = require('./router');
    require('util/ajax_no_cache');

    protections.enableCSRFProtection($);
    protections.enableUnauthorizationRedirection($, SplunkUtil.make_url('account/login'), '/account/logout');


    // Singleton dashboard controller that sets up the router and holds a model representing the state of the dashboard
    var DashboardController = function() {
        if (window.__splunkjs_router_disabled__ !== true) {
            this.readyDfd = $.Deferred();
            this.readyDeps = [];
            var model = this.model = new Backbone.Model();
            this.collection = {};

            // Set up the shared models/collections
            var app = this.model.app = sharedModels.get("app");
            var appLocal = this.model.appLocal = sharedModels.get("appLocal");

            var user = this.model.user = sharedModels.get("user");
            var userPref = this.model.userPref = sharedModels.get("userPref");
            var times = this.collection.times = sharedModels.get("times");
            var serverInfo = this.model.serverInfo = sharedModels.get("serverInfo");
            var searchBNFs = this.collection.searchBNFs = sharedModels.get("searchBNFs");

            this._onViewModelLoadDfd = $.Deferred();
            var view = this.model.view = new DashboardModel();
            this.model.view.fetch({
                url: route.splunkdNS(app.get('root'), app.get('locale'), app.get('owner'), app.get('app'), [view.url, app.get('page')].join('/'))
            }).done(this._onViewModelLoad.bind(this));
            pdfUtils.isPdfServiceAvailable().always(function(available) {
                model.set('pdf_available', available);
            });

            //this.model.on('change:edit', this.router.updateUrl, this.router);
            this.on('addInput', this.model.view.addInput, this.model.view);

            //if (window.__splunkjs_router_disabled__ !== true) {
            this.router = new DashboardRouter({
                model: this.model,
                app: app,
                serverInfo: serverInfo
            });
            routerUtils.start_backbone_history();
            this.onReady(function() {
                model.trigger('ready');
            });
        } else {
            this._onViewModelLoadDfd = $.Deferred().resolve();
            this.readyDfd = $.Deferred();
            this.readyDeps = [];
            this.model = new Backbone.Model();
            this.collection = {};
            this.model.view = new DashboardModel();
            // Provide placeholder for router property since it's used by the URLTokenModel to listen for route changes
            this.router = {
                on: function() {}
            };
        }
    };
    _.extend(DashboardController.prototype, Backbone.Events, {
        _populateSharedModels: function(sharedModels){
            // Set up the shared models/collections
            this.model.app = sharedModels.get("app");
            this.model.appLocal = sharedModels.get("appLocal");

            this.model.user = sharedModels.get("user");
            this.model.userPref = sharedModels.get("userPref");
            this.collection.times = sharedModels.get("times");
            this.model.serverInfo = sharedModels.get("serverInfo");
            this.collection.searchBNFs = sharedModels.get("searchBNFs");
        },
        _onViewModelLoad: function() {
            console.trace('controller _onViewModelLoad');
            var model = this.model;
            model.set('editable', model.view.isEditable() && model.view.entry.acl.canWrite());
            if (model.view.isXML()) {
                model.set('label', this.model.view.getLabel());
                model.set('description', this.model.view.getDescription());
                model.on('change:label change:description', function() {
                    model.view.setLabelAndDescription(model.get('label'), model.get('description'));
                    model.view.save();
                    this.updatePageTitle();
                }, this);
                model.set('rootNodeName', model.view.getRootNodeName());
                model.view.on('change:rootNodeName', function(m, rootTagName) {
                    model.set('rootNodeName', rootTagName);
                });
            }
            this._onViewModelLoadDfd.resolve(this.model.view);
            this.updatePageTitle();
        },
        onViewModelLoad: function(cb, scope) {
            console.trace('controller onViewModelLoad');
            this._onViewModelLoadDfd.done(cb.bind(scope || null));
        },
        getStateModel: function() {
            console.trace('controller getStateModel');
            return this.model;
        },
        isEditMode: function() {
            console.trace('controller isEditMode');
            return this.model.get('edit') === true;
        },
        addReadyDep: function(dfd) {
            console.trace('controller addReadyDep');
            // Wrap the given deferred object into a new one, which always resolves when the original one is 
            // resolved or rejected.
            var wrapperDfd = $.Deferred();
            dfd.always(_.bind(wrapperDfd.resolve, wrapperDfd));
            this.readyDeps.push(wrapperDfd);
        },
        onReady: function(callback) {
            console.trace('controller onReady');
            var dashboardReady = $.when(this.readyDfd, this._onViewModelLoadDfd);
            if (callback) {
                dashboardReady.then(callback);
            }
            return dashboardReady;
        },
        ready: function() {
            console.trace('controller ready');
            var readyDfd = this.readyDfd;
            console.log('Waiting for %d dependencies before signaling dashboard readiness', this.readyDeps.length);
            $.when.apply($, this.readyDeps).then(function() {
                console.log('Dashboard is ready');
                readyDfd.resolve();
            });
        },
        isReady: function() {
            console.trace('controller isReady');
            return this.readyDfd.state() === "resolved";
        },
        fetchCollection: function() {
            console.trace('controller fetchCollection');
            this.reportsCollection = new Reports();
            this.reportsCollection.REPORTS_LIMIT = 100;
            var appModel = this.model.app;
            var fetchParams = {
                data: {
                    count: this.reportsCollection.REPORTS_LIMIT,
                    app: appModel.get('app'),
                    owner: appModel.get('owner'),
                    search: 'is_visible=1 AND disabled=0'
                }
            };
            this.reportsCollection.initialFetchDfd = this.reportsCollection.fetch(fetchParams);
        },
        updatePageTitle: function() {
            console.trace('controller updatePageTitle');
            var titleFormat = _('%s | Splunk').t();
            document.title = SplunkUtil.sprintf(titleFormat, this.model.view.getLabel());
        },
        _signalReadyByMainController: function(options) {
            this.model.view.setFromSplunkD(options.model.view.toSplunkD());
            this.ready();
        }
    });

    var instance = new DashboardController();
    if (console.DEBUG_ENABLED) {
        window.Dashboard = instance;
    }
    return instance;
});
