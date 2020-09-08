define([
    'jquery',
    'underscore',
    'backbone',
    'util/dashboard_utils',
    'uri/route',
    'splunk.util',
    'util/console'
], function($,
            _,
            Backbone,
            DashboardUtils,
            Route,
            SplunkUtil,
            console) {

    var sprintf = SplunkUtil.sprintf;

    var DEFAULT_JS = "dashboard.js";
    var DEFAULT_STYLE = "dashboard.css";

    var EXTENSIONS = {script: '.js', stylesheet: '.css'};

    var ExtensionLoader = function(options) {
        this.model = _.extend({}, options.model);
        this.collection = _.extend({}, options.collection);
        this.clearExtensions();

        this.listenTo(this, 'loaded:script', function() {
            this._loadedScripts++;
        });
        this.listenTo(this, 'loaded:stylesheet', function() {
            this._loadedStylesheets++;
        });
    };

    /**
     *  All the extensions will be loaded only once, unless the registry been cleared.
     */
    _.extend(ExtensionLoader.prototype, Backbone.Events, {
        loadDefaultExtensions: function(app, locale, root) {
            this.loadScriptExtension(app, locale, root, DEFAULT_JS);
            this.loadStylesheetExtension(app, locale, root, DEFAULT_STYLE);
        },
        loadScriptExtension: function(app, locale, root, src) {
            var resolvedSrc = this._resolveExtensionFile(app, locale, root, src);
            var key = this._getKey(app, src);
            if (!this._scriptRegistry[key]) {
                this._scriptRegistry[key] = resolvedSrc;
                return this._loadExtension('script', resolvedSrc);
            } else {
                return $.Deferred().reject(sprintf('Script %s already loaded', key));
            }
        },
        loadStylesheetExtension: function(app, locale, root, styleSrc) {
            var resolvedSrc = this._resolveExtensionFile(app, locale, root, styleSrc);
            var key = this._getKey(app, styleSrc);
            if (!this._stylesRegistry[key]) {
                this._stylesRegistry[key] = resolvedSrc;
                return this._loadExtension('stylesheet', resolvedSrc);
            } else {
                return $.Deferred().reject(sprintf('Stylesheet %s already loaded', key));
            }
        },
        hasExtension: function() {
            return this._loadedScripts + this._loadedStylesheets > 0;
        },
        hasExtensionScript: function() {
            return this._loadedScripts > 0;
        },
        hasExtensionStylesheet: function() {
            return this._loadedStylesheets > 0;
        },
        clearExtensions: function() {
            this._scriptRegistry = {};
            this._stylesRegistry = {};
            this._scriptPromises = [];
            this._loadedScripts = 0;
            this._loadedStylesheets = 0;
        },
        _getKey: function(app, src) {
            var source = DashboardUtils.getAppAndSource(src, app);
            return sprintf("%s:%s", source.app, source.src);
        },
        _loadExtension: function(type, resolvedSrc) {
            if (!ExtensionLoader.isValidExtensionPath(resolvedSrc, type)) {
                var msg = sprintf('Invalid extension path: "%s" for extension type %s', resolvedSrc, type);
                console.error(msg);
                return $.Deferred().reject(msg);
            }
            switch (type) {
                case 'script':
                    return this._loadScript(resolvedSrc).then(function() {
                        this.trigger('loaded:script', resolvedSrc);
                    }.bind(this));
                case 'stylesheet':
                    return this._loadStylesheet(resolvedSrc).then(function() {
                        this.trigger('loaded:stylesheet', resolvedSrc);
                    }.bind(this));
            }
        },
        _loadScript: function(src) {
            var dfd = $.Deferred();
            var prevScriptPromises = this._scriptPromises.slice();
            // Add always-resolving promise to the scriptPromises list, so subsequent scripts can wait 
            // for previous scripts being either executed or fail
            var promise = $.Deferred();
            this._scriptPromises.push(promise.promise());
            dfd.always(promise.resolve);
            this._getScript(src)
              .then(function(scriptContent) {
                  if (ExtensionLoader.isFallbackScriptContent(scriptContent)) {
                      // Don't report script to be successfully loaded if
                      // it's the fallback dashboard.js for apps
                      return dfd.reject();
                  } else {
                      // Wait until all previous scripts have been executed
                      $.when.apply($, prevScriptPromises).then(function() {
                          try {
                              $.globalEval(scriptContent);
                              dfd.resolve();
                          } catch (e) {
                              dfd.reject();
                          }
                      });
                  }
              })
              .fail(dfd.reject);
            return dfd;
        },
        _getScript: function(src) {
            return $.ajax({
                dataType: 'text',
                url: src,
                cache: true
            });
        },
        _loadStylesheet: function(src) {
            var dfd = $.Deferred();
            var node = document.createElement("link");
            node.rel = "stylesheet";
            node.type = "text/css";
            node.href = src;
            node.onload = dfd.resolve;
            node.onerror = dfd.reject;
            document.head.appendChild(node);
            return dfd.promise();
        },
        _resolveExtensionFile: function(app, locale, root, src) {
            var source = DashboardUtils.getAppAndSource(src, app);
            var appVersion = undefined;
            var localApp = this.collection.appLocals.find(function(localApp) { return localApp.entry.get('name') == app; });
            if (localApp) {
                appVersion = localApp.getBuild();
            }
            return Route.appStaticFileAppVersioned(root, locale, appVersion, source.app, source.src);
        }
    });
    
    _.extend(ExtensionLoader, {
        isValidExtensionPath: function(src, type) {
            var ext = EXTENSIONS[type];
            return ext &&
                src.indexOf('../') == -1 &&
                src.slice(src.length - ext.length) == ext &&
                !/^\w+:/.test(src);
        },
        isFallbackScriptContent: function(scriptContent) {
            return !!(scriptContent && scriptContent.slice(0, 14) == '/*--fallback--');
        }
    });

    return ExtensionLoader;
});