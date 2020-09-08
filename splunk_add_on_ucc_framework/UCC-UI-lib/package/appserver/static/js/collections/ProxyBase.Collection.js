define([
    'jquery',
    'lodash',
    'collections/SplunkDsBase'
], function (
    $,
    _,
    SplunkDsBase
) {
    return SplunkDsBase.extend({
        initialize: function (attributes, options) {
            SplunkDsBase.prototype.initialize.call(this, attributes, options);

            //initialize options if not passed
            this.options = options || {};
            // allow appData to be passed on options, otherwise just use the
            // singleton
            this.appData = this.options.appData;

            var targetApp = this.options.targetApp || this.appData.app,
                targetOwner = this.options.targetOwner || this.appData.owner;

            this._url = this.url; // make sure this works for functions

            this.appData.targetOwner = targetOwner;

            this.setProxyUrl(targetApp);
            this.proxifiedUrl = this.url;
        },
        setProxyUrl: function (targetApp) {
            var proxyUrl = this._getProxyUrl(this.appData),
                endpointUrl = [
                    "servicesNS",
                    this.appData.targetOwner,
                    targetApp
                ].join('/');

            this.proxyUrl = Splunk.util.make_url([
                proxyUrl,
                endpointUrl
            ].join('/'));

            // play nice if url is a function
            if (_.isFunction(this.url)) {
                // only assign _urlFx once...otherwise welcome to stack overflow!
                this._urlFx = this._urlFx || this.url;

                this.url = _.bind(function () {
                    return this.proxyUrl + "/" + this._urlFx();
                }, this);
            } else {
                this.url = this.proxyUrl + "/" + this._url;
            }
        },
        sync: function (method, model, options) {
            var def,
                appList = [],
                searchStr,
                searchQuery,
                remainingArgs,
                qs;
            // allow same interface as core... allow passing app and owner on fetch options.data
            if (options && options.data) {
                this.appData.targetOwner = options.data.owner || this.appData.targetOwner;
                this.appData.app = options.data.app || this.appData.app;
                this.setProxyUrl(this.targetApp || this.appData.app);
                delete options.data.app;
                delete options.data.owner;
            }

            if (method === "read") {
                options = this.assignCount(options);

                /*
                 TODO: move this out of here
                 The tree filter is the only thing that works with this
                 Therefore we could move this into a function that just generates
                 the proper search query.
                 */

                if (options.data.filterApps !== undefined) {
                    /**
                     Need to make sure that the automatic url escaping doesn't kick in
                     for the "search" param
                     **/
                    // TODO: make this handle a string if present, not just an array
                    appList = [];
                    // if(options.data.app === undefined || options.data.app.length === 0){
                    if (options.data.filterApps.length === 0) {
                        appList.push("eai:acl.app=*");
                    } else {
                        _.each(options.data.filterApps, function (app) {
                            searchStr = sprintf("eai:acl.app=%s", app);
                            appList.push(searchStr);
                        });
                    }

                    searchQuery = appList.join("%20OR%20"); // " OR "

                    if (options.data.name !== undefined) {
                        // Add the name searh term to the query
                        searchQuery = sprintf("(%s)%20AND%20name=*%s*", searchQuery, options.data.name);
                    }

                    searchQuery = "search=" + searchQuery;

                    options.data.output_mode = "json";
                    remainingArgs = _.omit(options.data, ["filterApps", "name"]);
                    qs = $.param(remainingArgs);
                    qs += "&" + searchQuery;
                    options.data = qs;

                    this.setProxyUrl("-");
                }
            }

            def = SplunkDsBase.prototype.sync.call(this, method, model, options);
            // Revert to the canonical proxified URL
            // Hopefully this doesn't fuck up
            this.url = this.proxifiedUrl;
            return def;
        },
        assignCount: function (options) {
            options = options || {};
            options = $.extend(true, {data: {count: -1}}, options);
            return options;
        },
        _getProxyUrl: function () {
            return "splunkd/__raw";
        }
    });
});
