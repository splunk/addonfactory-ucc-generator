define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var console = require('util/console');
    var splunkConfig = require('splunk.config');
    var TokenUtils = require('./tokenutils');

    /**
     * @constructor
     * @private
     * @name ModelSyncer
     * @memberOf splunkjs.mvc.utils
     *
     * @description Syncs attributes between two models, including templates such as "$token$".
     * @param {Object} options
     * @param {Backbone.Model} options.source
     * @param {Backbone.Model} options.dest
     * @param {String} options.prefix - the prefix for attribute names when syncing from the source to the dest model (push)
     * @param {Object} options.alias - alias map for attribute names translation
     * @param {Array} options.include - array of attribute names to include
     * @param {Array} options.exclude - array of attribute names to exclude
     * @param {Boolean|String} options.auto - true for automatic bidirectional sync, "push" or "pull" for unidirectional
     * @param {Boolean} options.tokens - true to sync tokens, false to sync resulting values only (defaults to true)
     *
     * @namespace splunkjs.mvc.utils
     */
    var ModelSyncer = function(options) {
        options = options || {};

        this.source = options.source;
        this.prefix = options.prefix||'';
        this.dest = options.dest;
        this.destSetter = options.save || options.saveDest ? 'save':'set';
        this.sourceSetter = options.save || options.saveSource ? 'save':'set';
        this.debug = options.debug;
        this.aliasMap = options.alias || {};
        this.tokens = options.tokens !== undefined ? options.tokens : true;
        this.include(options.include);
        this.exclude(options.exclude);

        if(options.auto === true) {
            this.auto('push');
            this.auto('pull');
        } else if(_.isString(options.auto)) {
            this.auto(options.auto);
        }
    };
    _.extend(ModelSyncer.prototype, /** @lends splunkjs.mvc.utils.ModelSyncer.prototype */{
        include: function(attributes) {
            this.includes = _.isArray(attributes) ?
                      _.object(attributes, _.map(attributes, function(){ return true; })) : attributes;
            return this;
        },
        exclude: function(attributes) {
            this.excludes = _.isArray(attributes) ?
                      _.object(attributes, _.map(attributes, function(){ return true; })) : attributes;
            return this;
        },
        auto: function(what) {
            if(what === 'push') {
                this.source.on('change', this.push, this);
                this.push();
            } else if(what == 'pull') {
                this.dest.on('change', this.pull, this);
                this.pull();
            }
            return this;
        },
        /**
         * Push configured properties from the source to the destination model
         */
        push: function(m, o) {
            // Figure out the attributes to push to the destination model
            // When called by the change event listener, then use the "changed" property of the model
            // Otherwise all attributes of the source model
            var opts = { tokens: this.tokens };
            var attrs = (o && o.unset) ? m.changed : this.source.toJSON(opts),
                // Object for attributes to apply to the destination model
                newAttrs = {},
                // Settings
                alias = this.aliasMap || {}, includes = this.includes, excludes = this.excludes || {},
                p = this.prefix, d = this.dest;


            _(attrs).each(function(v,k){
                // Check if the attribute name is either explicitly included or excluded
                if((includes === undefined || includes[k]) && !excludes[k]) {
                    var a = alias[k], // Fetch name from alias map
                        n = (a !== undefined) ? a : p+k; // use the alias name if found, else add the prefix
                    if(d.get(n, opts) !== v) { // Check if the value is the different from the destination model value
                        newAttrs[n] = v;
                    }
                }
            });

            if(!_(newAttrs).isEmpty()){
                if(this.debug) { console.log('PUSH', newAttrs, _.isObject(o) ? _.pick(o, ['unset']) : undefined); }
                // Call either set() or save() on the destination model
                // If push is called as the change event callback, then pass the unset option down to the
                // set/save call of the destination model
                this.dest[this.destSetter](
                        newAttrs,
                        _.extend(opts, _.isObject(o) ? _.pick(o, ['unset']) : undefined)
                );
            }
        },
        /**
         * Pull configured properties from the destination to the source model
         */
        pull: function(m, o) {
            // Figure out the attributes to pull to the source model
            // When called by the change event listener, then use the "changed" property of the model
            // Otherwise all attributes of the destination model
            var opts = { tokens: this.tokens };
            var attrs = (o && o.unset) ? m.changed : this.dest.toJSON(opts), newAttrs = {},
                // Settings - the alias map is inverted for pulling
                inverseAlias = _.invert(this.aliasMap|| {}), includes = this.includes, excludes = this.excludes || {},
                p = this.prefix, s = this.source;

            _(attrs).each(function(v,k){
                if(inverseAlias[k]) {
                    // Apply if there is an alias for the attribute
                    newAttrs[inverseAlias[k]] = v;
                    // Otherwise if it starts with the prefix
                } else if(k.substring(0,p.length) == p) {
                    // Get the part after the prefix
                    var n = k.substring(p.length);
                    // Check if explicitly included or excluded
                    if((includes === undefined || includes[n]) && !excludes[n]) {
                        if(s.get(n, opts) !== v){
                            newAttrs[n] = v;
                        }
                    }
                }
            });
            if(!_(newAttrs).isEmpty()){
                if(this.debug) { console.log('PULL', newAttrs, _.isObject(o) ? _.pick(o, ['unset']) : undefined); }
                // Call either set() or save() on the source model
                // If pull() is called as the change event callback, then pass the unset option down to the
                // set/save call of the destination model
                this.source[this.sourceSetter](
                        newAttrs,
                        _.extend(opts, _.isObject(o) ? _.pick(o, ['unset']) : undefined)
                );
            }
        },
        destroy: function() {
            this.source.off(null, null, this);
            this.dest.off(null, null, this);
        }
    });

    var utils = {
        /**
         * Returns information about the current page.
         */
        getPageInfo: function() {
            if (splunkConfig.INDEPENDENT_MODE) {
                // Independent mode - derive info from global config
                return {
                    root: undefined,
                    locale: splunkConfig.LOCALE,
                    app: splunkConfig.APP,
                    page: undefined
                };
            } else {
                // Other mode - derive info from current URL
                return utils._getUrlInfo(window.location.pathname);
            }
        },
        
        /*
         * Deprecated. No replacement.
         * Only for internal use by getPageInfo() and unit tests.
         * 
         * Extracts information from the specified URL,
         * which must be in either splunkweb or Django format.
         * 
         * NOTE: Gives incorrect results for URLs when running
         *       the JS Stack in independent mode, since URLs in
         *       independent mode have no well-defined format.
         */
        _getUrlInfo: _.memoize(function(url) {
            var urlParts = url.substring(1).split('/');
            var locale, root, appPath;
            var appIndex = _.indexOf(urlParts, 'app', 1);
            var managerIndex = _.indexOf(urlParts, 'manager', 1);
            var djIndex = _.indexOf(urlParts, 'dj', 0);

            if (djIndex >= 0 && (appIndex === -1 || appIndex > djIndex)) {
                // Django (with or without root_endpoint)
                
                // Now we need to know if we have a root_endpoint,
                // and if we do, we collect everything up to the 'dj'
                // and join it
                if (djIndex > 0) {
                  root = _.first(urlParts, djIndex).join('/');
                }
                // Locale is always en-US for now
                locale = urlParts[djIndex + 1];
                
                // App path is the rest
                appPath = _.rest(urlParts, djIndex + 2);
            } else if(appIndex > 1) {
                // splunkweb with root_endpoint
                root = _.first(urlParts, appIndex-1).join('/');
                locale = urlParts[appIndex-1];
                appPath = _.rest(urlParts, appIndex+1);
            } else if(managerIndex > 1) {
                // splunkweb with root_endpoint
                root = _.first(urlParts, managerIndex-1).join('/');
                locale = urlParts[managerIndex-1];
                appPath = _.rest(urlParts, managerIndex+1);
            } else {
                // splunkweb
                locale =  urlParts[0];
                appPath = _.rest(urlParts, 2);
            }

            return {
                root: root,
                locale: locale,
                app: appPath[0],
                page: appPath[1]
            };
        }),
        
        getCurrentApp: function() {
            return utils.getPageInfo().app;
        },
        
        /** Deprecated. Use TokenUtils.replaceTokenNames instead. */
        replaceTokens: function(str, values, escaper) {
            return TokenUtils.replaceTokenNames(str, values, escaper);
        },
        
        /** Deprecated. Use TokenUtils.getTokenName instead. */
        getTokenName: function(tokenStr) {
            return TokenUtils.getTokenName(tokenStr);
        },
        
        /** Deprecated. Use TokenUtils.getTokenNames instead. */
        discoverReplacementTokens: function(searchTemplate) {
            return TokenUtils.getTokenNames(searchTemplate);
        },
        
        /** Deprecated. Use TokenUtils.isTokenName instead. */
        isToken: function(p) {
            return TokenUtils.isTokenName(p);
        },
        
        /** Deprecated. Use TokenUtils.hasTokenName instead. */
        hasToken: function(str) {
            return TokenUtils.hasTokenName(str);
        },
        
        /** Deprecated. Use TokenUtils.quoteAsTokenString instead. */
        quoteAsTokenString: function(literalStr) {
            return TokenUtils.quoteAsTokenString(literalStr);
        },
        
        syncModels: function(src, dest, o) {
            var options = o;
            if (arguments.length == 1) {
                options = src;
            } else {
                options = options || {};
                _.extend(options, { source: src, dest: dest });
            }
            return new ModelSyncer(options);
        },
        
        redirect: function(url, newWindow, target) {
            if (newWindow) {
                window.open(url, '_blank');
            } else if (target) {
                window.open(url, target);
            } else {
                window.location = url;
            }
        }
    };

    return utils;
});
