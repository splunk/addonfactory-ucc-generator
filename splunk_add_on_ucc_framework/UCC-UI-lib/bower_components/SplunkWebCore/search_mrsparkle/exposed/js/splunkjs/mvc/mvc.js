/**
 * @namespace splunkjs
 */
/**
 * @namespace splunkjs.mvc
 */

define(function(require, exports, module) {    
    var $ = require('jquery');
    var _ = require("underscore");
    var Backbone = require("backbone");
    var console = require("util/console");
    var deparam = require("jquery.deparam");
    var protections = require("./protections");
    var Registry = require("./registry");
    var Resolver = require("splunkjs/generated/urlresolver");   // must use absolute path
    var sdk = require("splunkjs/splunk");
    var splunkConfig = require('splunk.config');
    var TokenEscapeString = require("./tokenescapestring");
    var TokenSafeString = require("./tokensafestring");
    var TokenUtils = require("./tokenutils");
    var utils = require("./utils");
    
    require('splunk.error');
    require('util/ajax_logging');

    // A sessionKey variable private to this scope.
    // Keep this private to avoid credential theft by third-party JavaScript.
    var sessionKey = null;

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name MVC
     * @description The **MVC** class is used for working with tokens, and for accessing SplunkJS Stack views, search managers, and Simple XML visualizations.
     * @extends splunkjs.mvc.Registry
     *
     * @example
     * // This example shows how to retrieve a chart visualization in a Simple XML extension.
     * 
     * require([
     *     "splunkjs/mvc",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(mvc) {
     * 
     *     // Retrieve the chart
     *     var chartclick = splunkjs.mvc.Components.get("mychart");
     * 
     *     // Respond to legend clicks
     *     chartclick.on("click:legend", function(e) {
     *         // To do: respond to events
     *         console.log("Clicked legend: ", e.name2);
     *     });
     * 
     *     // Respond to chart clicks
     *     chartclick.on("click:chart", function (e) {
     *         // To do: respond to events
     *         console.log("Clicked chart: ", e.value);
     *     });
     * });
     * @example
     * // This example shows how to specify a token for the value of a dropdown list.
     * 
     * require([
     *     "splunkjs/mvc",
     *     "splunkjs/mvc/dropdownview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(mvc, DropdownView) {
     * 
     *     new DropdownView({
     *         id: "selIndex",
     *         value: mvc.tokenSafe("$indexName$"),
     *         el: $("#selIndex")
     *     }).render();
     * 
     *     . . . 
     * 
     * });
     */
    var MVCConstructor = function(options) {
        this.Components = new Registry();
        this.initialize.apply(this, arguments);
    };
    _.extend(MVCConstructor.prototype, Backbone.Events, /** @lends splunkjs.mvc.MVC.prototype */{
        started: false,
        
        initialize: function() {},
        
        drilldown: function(path, data) {
            var encoded = $.param(data || {});
            
            if (encoded) {
                path = path + "?" + encoded;
            }
            
            window.location = path;
        },

        loadDebugger: function(callback) {
            var that = this;
            require(['./debugger'], function(Debugger) {
                that.Debugger = new Debugger({'registry': that.Components});
                that.trigger("debugger:ready", that);
                if (callback) callback(that.Debugger);
            });
        },
        
        loadDrilldown: function(data) {
            var queryArgs = window.location.search.substr(1) || "";
            var args = _.extend({}, $.deparam(queryArgs), data);
            
            var that = this;
            _.each(args, function(datum, id) {
                if (that.Components.has(id)) {
                    var component = that.Components.getInstance(id);
                    
                    if (component.settings) {
                        component.settings.set(datum);
                    }
                    else if (component.set) {
                        component.set(datum);
                    }
                    else {
                        console.log("Could not find a setter for '" + id + "'", datum);
                    }
                }
            });
        },
        
        reverse: function(name, app, args) {
            return Resolver.reverse(name, app, args);
        },

        /*
         * Sets the session key used to authenticate to the Splunk server.
         * 
         * This is used by login logic to store the session key in environments
         * where we don't have ambient authentication provided by splunkweb
         * or Django.
         */
        _setSessionKey: function(key) {
            sessionKey = key;
        },
        
        createService: function(options) {
            options = options || {};
            if (sessionKey) {
                options.sessionKey = sessionKey;
            }
            // JIRA: once we have the new SDK this should split 
            // based on whether proxy path is set, creating a 
            // ProxyHttp if there is a proxy path and a JQuery Http if not (DVPL-3488)
            var http = options.http || new sdk.ProxyHttp(splunkConfig.SPLUNKD_PATH);
            options.scheme = options.scheme || splunkConfig.SCHEME;
            options.host = options.host || splunkConfig.HOST;
            options.port = options.port || splunkConfig.PORT;
            options.version = options.version || "5.0";
            options.app = options.app || utils.getPageInfo().app || "-";
            options.owner = options.owner || splunkConfig.USERNAME;
            
            return new sdk.Service(http, options);
        },
        
        // Marks the specified bare string to be interpreted as a
        // template with token values.
        // 
        // Since the default interpretation of a bare string is to be
        // treated as a literal string you must use mvc.tokenSafe() or
        // a {tokens: true} option to mark strings that you wish to be
        // interpreted as a template instead.
        // 
        // For example:
        //      new SearchManager({
        //          id: 'indexSize',
        //          search: mvc.tokenSafe('index=$indexName$ | stats count')
        //      });
        //
        // Historical Note: The name of this function is inspired by
        //                  Django's built-in 'safe' filter.

        /**
         * Indicates that a string is a token. For details, see 
         * <a href="http://dev.splunk.com/view/SP-CAAAEWY" target="_blank">Token sytax</a>.
         *
         * @param {String} token_name - The token name.
         */
        tokenSafe: function(template) {
            return new TokenSafeString(template);
        },
        

        // Marks the specified bare string to be interpreted as a
        // literal string.
        // 
        // Bare strings are interpreted as literals by default so
        // this marking is only useful when a bare string is being
        // passed in a context when the default interpretation is
        // being overridden by a {tokens: true} option.
        // 
        // For example:
        //      new SingleView({
        //          id: 'costReport',
        //          beforeLabel: mvc.tokenEscape('USD $'),
        //          managerid: 'cost'
        //      }, {tokens: true});
        //
        // Historical Note: The name of this function is inspired by
        //                  Django's built-in 'escape' filter.

        /**
         * Indicates that a string is a literal string. For details, see 
         * <a href="http://dev.splunk.com/view/SP-CAAAEWY" target="_blank">Token sytax</a>.
         *
         * @param {String} literal - The literal string.
         */
        tokenEscape: function(literal) {
            return new TokenEscapeString(literal);
        },
        
        /**
         * Returns a transformed value. For details, see <a href="http://dev.splunk.com/view/SP-CAAAEW4" target="_blank">Transform and validate tokens</a>.
         *
         * @param {String} filterName - The filter name.
         * @param {Object} filterFunc - The filter function.
         * @returns {Object} The transformed value.
         */
        setFilter: function(filterName, filterFunc) {
            TokenUtils.setFilter(filterName, filterFunc, mvc.Components);
        },
        
        /**
         * Returns the filter function for the specified filter name.
         *
         * @param {String} filterName - The filter name.
         * @returns {Object} The filter function.
         */
        getFilter: function(filterName) {
            return TokenUtils.getFilter(filterName, mvc.Components);
        }
    });

    // Bootstrap onto the 'splunkjs' object if one exists, or create a new one.
    if (!window.splunkjs) {
        window.splunkjs = {};
    }
    
    // Create splunkjs.mvc
    var mvc = new MVCConstructor();
    var ns = window.splunkjs.mvc = mvc;
    
    if (splunkConfig.DJANGO_ENABLE_PROTECTIONS) {
        protections.enableCSRFProtection($);
        protections.enableUnauthorizationRedirection($, mvc.reverse(":login"), mvc.reverse(":logout"));
    }
    
    return mvc;
});
