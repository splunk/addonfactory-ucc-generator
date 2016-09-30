/*global define,Splunk*/
define([
    'underscore',
    'models/SplunkDBase',
    'app/models/appData'
], function (
    _,
    SplunkDBase,
    appData
) {
    /**
    If a different app needs to be used, it
    may be more convenient to set the 'targetApp' attr.
    This avoids having to do a copy of appData and change
    the 'app' property.

    See '_getProxyUrl' for more details.
    **/
    return SplunkDBase.extend({
        initialize: function (attributes, options) {
            SplunkDBase.prototype.initialize.call(this, attributes, options);

            // Preserve the original URL so we don't wind up duplicating the proxy prefix
            this._url = this.url;
            this.options = options = (options || {});

            var appOwner = options.appData || this.get('appData') || appData.toJSON();
            this.set('appData', appOwner);

            if (options !== undefined) {

                if (options.targetApp !== undefined && options.targetApp !== '-') {
                    this.set('targetApp', options.targetApp);
                }

                if (options.targetOwner !== undefined) {
                    this.set('targetOwner', options.targetOwner);
                }

            }

            if (!this.has('targetApp')) {
                this.set('targetApp', appOwner.app);
            }
        },

        sync: function (method, model) {
            if (method === 'create') {
                // Create calls need the proxy too
                // create uses the url since the id isn't available yet
                this.url = this._getProxyUrl(this.get('appData')) + "/" + this._url;
            } else {
                // This forces the base model to use the proxy,
                // since the base model uses the id to build the URL
                model.set(this.idAttribute, this._getId(model));
            }

            return SplunkDBase.prototype.sync.apply(this, arguments);
        },

        parse: function (resp, options) {
            resp = SplunkDBase.prototype.parse.call(this, resp, options);
            var proxyUrl, appOwner;
            appOwner = this.get('appData') || options.appData || appData.toJSON();
            proxyUrl = this._getProxyUrl(appOwner);

            /*
             The collection might want to grab entities from all apps
             However, to update and display the entity,
             the targetApp must be the real appName.
             */
            this.set("targetApp", this.entry.acl.get("app"));

            // The canonical id must be proxified
            resp.id = proxyUrl + "/" + this._url + "/" + this._getEncodedName(this);
            this.acl.set(this.acl.idAttribute, resp.id + '/acl');
            return resp;
        },

        _getProxyUrl: function (appData) {
            var app = this.entry.content.get('eai:appName') || appData.app,
                owner = appData.owner,
                proxyUrl,
                endpoint;

            /*
             The proxy app might be different from the app
             the entity belongs to.
             DBX can display entities from any app, but the proxy
             is always going to be rooted at /splunk_app_db_connect/proxy
             */

            /*
             This param is very similar to targetApp. The name is different
             to make its purpose clear. It's only used for moves.
             */
            if (this.isNew()) {
                app = this.get("appMoveTo");
            } else {
                app = this.entry.acl.get("app");
            }


            // TODO: refactor me
            if (appData.targetOwner !== undefined) {
                owner = appData.targetOwner;
            } else if (this.get("targetOwner") !== undefined) {
                owner = this.get("targetOwner");
            } else if (this.entry.acl.get('owner') !== undefined) {
                owner = this.entry.acl.get('owner');
            }

            proxyUrl = "splunkd/__raw";
            //if (this.options !== undefined && this.options.useRawProxy) {
            //    proxyUrl = "splunkd/__raw";
            //} else {
            //    proxyUrl = [
            //        "custom",
            //        appData.app,
            //        "proxy"
            //    ].join('/');
            //}

            if (_.isFunction(this.baseEndpoint)) {
                endpoint = this.baseEndpoint(app, owner);
            } else {
                endpoint = this.baseEndpoint;
            }

            return Splunk.util.make_url([
                proxyUrl,
                endpoint
            ].join('/'));
        },

        baseEndpoint: function (app) {
            return [
                "servicesNS",
                // owner,
                "nobody", // saving the ACL will set the owner properly
                app
            ].join('/');
        },

        _getId: function (model) {
            // This forces the base model to use the proxy,
            // since the base model uses the id to build the URL
            // return this._getProxyUrl(this.get('appData')) + "/" + this._url+'/'+(model.get('name') || model.entry.get('name'));
            return this.getBaseUrl() + '/' + this._getEncodedName(model);
        },

        _getFullUrl: function () {
            return this._getId(this);
        },

        getBaseUrl: function () {
            return this._getProxyUrl(this.get('appData')) + "/" + this._url;
        },

        getProxyUrl: function () {
            return this._getProxyUrl(this.get('appData'));
        },

        _getEncodedName: function (model) {
            var name = model.get('name') || model.entry.get('name');
            return this.encodeUrl(name);
        },

        encodeUrl: function (str) {
            return encodeURIComponent(str).replace(/'/g, "%27").replace(/"/g, "%22");
        }
    });
});
