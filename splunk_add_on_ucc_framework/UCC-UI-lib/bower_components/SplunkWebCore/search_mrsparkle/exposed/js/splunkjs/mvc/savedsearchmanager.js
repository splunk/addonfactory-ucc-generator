define(function(require, exports, module) {
    var mvc = require('./mvc');
    var SearchManager = require('./searchmanager');
    var _ = require("underscore");    
    var console = require('util/console');
    var Messages = require('./messages');
    var GeneralUtils = require('util/general_utils');
    var Report = require('models/search/Report');
    var Job = require('models/search/Job');
    var DispatchJob = require('models/search/DispatchJob');
    var utils = require("splunkjs/mvc/utils");
    var splunkDUtils = require('util/splunkd_utils');
    var splunkConfig = require('splunk.config');
    var TokenUtils = require('./tokenutils');

    var DISPATCHABLE_PROPERTIES = DispatchJob.DISPATCHABLE_PROPERTIES;
    var registry = mvc.Components;

    // Dispatchable properties specific to the savedsearch endpoint
    var ENDPOINT_PROPERTIES = {
        'trigger_actions': true
    };

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SavedSearchManager
     * @description The **SavedSearch** manager encapsulates the dispatch of a 
     * saved report.
     * @extends splunkjs.mvc.SearchManager
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {String} [options.app=<The current app>] - Sets the namespace (the app context) 
     * to run in.
     * For example, let's say your app, MyApp, runs saved searches. By default, 
     * all searches are run in the context of your MyApp app. If you try to run 
     * a search that is private to the Search app, you'll get an error, so you 
     * need to change this "app" property to "search" to successfully run those 
     * searches.
     * @param {Boolean} [options.autostart=true] - When `true`, the manager will 
     * automatically start a new job whenever any search properties change or 
     * when the page is loaded (the component-loader is called). When `false`, 
     * application code must call **startSearch** manually to start a search.
     * @param {Boolean} [options.cache=false] - `true`: Always use the results from a 
     * preexisting search job when possible.</br>
     * `false`: Never use results from preexisting search jobs.</br>
     * `scheduled`: Reuse any previously-run scheduled jobs.</br>
     * _`n`_: The number of seconds indicating the maximum age a search job can
     * be to use its results. Results from search jobs that are newer than <i>n</i> 
     * seconds will be used.
     * @param {Boolean} [options.cancelOnUnload=true] - When `true`, cancels any running 
     * searches when navigating away from the page.
     * @param {Boolean} [options.dispatch.&lt;propertyname&gt;=true] - Indicates whether 
     * to enable dispatch properties. The following properties are available:</br>
     * - buckets 
     * - earliest_time
     * - enable_lookups
     * - indexedRealtime
     * - latest_time
     * - lookups
     * - max_count
     * - max_time
     * - reduce_freq
     * - rt_backfill
     * - spawn_process
     * - status_buckets
     * - time_format
     * - ttl
     * @param {String} [options.owner=<The current owner>] - Sets the namespace (the owner context) to run in.
     * @param {Number} [options.sampleRatio=1] - The sampling ratio. When specified,
     * runs the search in event sampling mode to return a sample set of events 
     * rather than all events. The formula for the ratio is 1/`sampleRatio`. For
     * example, if `sampleRatio` is 100, each event has a 1 in 100 chance of 
     * being included in the result set.
     * @param {String} options.searchname - The name of the saved report.
     * @param {Object} [options.settings] - The properties of the search manager.
     *
     * @example
     * require([
     *     "splunkjs/mvc/savedsearchmanager",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SavedSearchManager) {
     * 
     *     // Create manager
     *     new SavedSearchManager({
     *         id: "example-saved-report",
     *         searchname: "Report - Top Pageview",
     *         cache: true,
     *         preview: true,
     *         "dispatch.earliest_time": "-24h@h",
     *         "dispatch.latest_time": "now",
     *         app: "search"
     *     });
     *
     * });
     */
    var SavedSearchManager = SearchManager.extend(/** @lends splunkjs.mvc.SavedSearchManager.prototype */{
        moduleId: module.id,

        defaults: {
            autostart: true,
            cache: false,
            cancelOnUnload: true,
            enablePreview: true,
            /**
             * When false, this manager will not run its search if its 
             * 'earliest_time' or 'latest_time'
             * settings are bound to unresolved tokens.
             *
             * Currently defaults to true, but is likely to default to false in 
             * future versions of the framework.
             *
             * initialization only
             *
             * @deprecated
             */
            runWhenTimeIsUndefined: true
        },

        handleAutostart: function() {
            if (this.get("autostart")) {
                this.on("change:searchname", this._debouncedStartSearch, this);
            } else {
                this.off("change:searchname", this._debouncedStartSearch, this);
            }
            
            return SearchManager.prototype.handleAutostart.apply(this, arguments);
        },
        
        startSearch: function(options) {
            if (typeof options === 'boolean' || options === 'refresh') {
                options = {refresh: !!options};
            } else {
                options || (options = {});
            }
            this._refresh = options.refresh;
            // We do not cancel any searches, as this is a saved search
            // and others might be using the same search

            if (!this.get("searchname")) {
                this.trigger("search:error", _("No saved search provided.").t());
                return;
            }

            // Get the cache and convert it to a number:
            // false -> 0, never use cache
            // true -> -1, always use cache
            // positive integer -> positive integer, use cache if newer than
            var cache = this.get("cache") || false;
            if (cache !== 'scheduled') {
                if (_.isBoolean(cache) || GeneralUtils.isBooleanEquivalent(cache)) {
                    cache = GeneralUtils.normalizeBoolean(cache) ? -1 : 0;
                } else {
                    cache = parseInt(cache, 10);
                }
            }
            
            if (_.isNaN(cache)) {
                console.warn('Invalid value for cache setting: %o', this.get('cache'));
                cache = 0;
            }
            
            // Get the threshold for cache (which could be infinity)
            var threshold = cache < 0 ? 
                (new Date(0)).valueOf() :
                ((new Date()).valueOf() - cache * 1000);

            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });
            if (!TokenUtils.tokenDependenciesMet(tokenDependencies, registry)) {
                this.trigger("search:error", Messages.resolve("unresolved-tokens").message);
                return;
            }

            var search = new Report();
            search.set('id', this.applyModelFullPathToName(search, this.get('searchname')));
            
            var that = this;

            search.fetch({
                success: function() {
                    // Set the query so that someone can fetch it
                    that.settings.set('search', search.entry.content.get('search'), {silent: true});

                    // Skip fetching the saved search history if cache is disabled
                    // and directly dispatch it
                    var cacheDisabled = cache === 0 ||
                        (cache === 'scheduled' && !search.entry.content.get('is_scheduled'));
                    if (cacheDisabled) {
                        that._startSearchWithNewJob(search);
                        return;
                    }

                    if (cache === 'scheduled') {
                        // Grab the latest search job from the jobs history
                        search.getLatestHistoricJobId()
                            .then(function(sid) {
                                if (sid) {
                                    var job = new Job();
                                    job.set(job.idAttribute, sid);
                                    job.fetch({
                                        success: function() {
                                            that._startSearchWithExistingJob(job);
                                        },
                                        error: function() {
                                            that._startSearchWithNewJob(search);
                                        }
                                    });
                                } else {
                                    that._startSearchWithNewJob(search);
                                }
                            })
                            .fail(function(){
                                that._startSearchWithNewJob(search);
                            });
                    } else {
                        // Otherwise, check for cached/history searches here
                        search.fetchJobs({
                            success: function(jobs) {
                                var matches = jobs.filter(function(potentialJob) {
                                    var properties = potentialJob.entry.content;
                                    var published = (new Date(potentialJob.entry.get('published'))).valueOf();

                                    // We should reuse running realtime searches
                                    // This is behavior is consistent with 5.0.x
                                    // be aware of realtime alerts search isRealtime but isDone
                                    var isRunningRealTimeSearch = properties.get('isRealTimeSearch') && !properties.get('isDone');

                                    // If we are reusing scheduled jobs and this one was scheduled
                                    // or this job is fresh enough, then we can reuse it
                                    // of this one is realtime and still running.
                                    return published > threshold || isRunningRealTimeSearch;
                                });

                                if (matches.length) {
                                    var mostRecentJobMatch = _.max(matches, function(match) {
                                        return new Date(match.entry.get('published'));
                                    });
                                    that._startSearchWithExistingJob(mostRecentJobMatch);
                                } else {
                                    that._startSearchWithNewJob(search);
                                }
                            },
                            error: function() {
                                // If we had an error retrieving cached jobs, start a new one
                                that._startSearchWithNewJob(search);
                            }
                        });
                    }
                },
                error: function(model, response) {
                    var err = splunkDUtils.convertToSDKResponse(response);
                    if (err.status === 404) {
                        var message = _("Warning: saved search not found: ").t() + '"' + that.get("searchname") + '"';
                        console.log(message);
                        that.trigger("search:error", message, err);
                    } else {
                        console.log("Error fetching saved searches");
                        that.trigger("search:error", _("Error fetching saved searches").t(), err);
                    }
                }
            });

            return this;
        },
        
        // Mocked by unit tests.
        _startSearchWithExistingJob: function(job) {
            this.createManager(job);
        },
        
        // Mocked by unit tests.
        _startSearchWithNewJob: function(search) {
            var that = this;

            // Don't start search if waiting for time range
            var timeRangeIsUnresolved =
                (this.settings.get("earliest_time", {tokens: false}) === undefined &&
                 this.settings.get("earliest_time", {tokens: true})) ||
                (this.settings.get("latest_time", {tokens: false}) === undefined &&
                 this.settings.get("latest_time", {tokens: true}));
            if (timeRangeIsUnresolved && !this.settings.get("runWhenTimeIsUndefined")) {
                this.trigger("search:error", Messages.resolve("unresolved-search").message);
                return;
            }

            var dispatchJob = new DispatchJob();
            var dispatchLink = search.entry.links.get('dispatch');
            var dispatchUrl = splunkDUtils.fullpath(dispatchLink);
            dispatchJob.save({}, {
                url: dispatchUrl,
                data: this._createOptionsForSearchJob(),
                success: function() {
                    that.createManager(dispatchJob);
                },
                error: function(model, response) {
                    var err = splunkDUtils.convertToSDKResponse(response);
                    that.trigger("search:error", _("Error dispatching saved search.").t(), err);
                }
            });
        },

        /**
         * Filters the settings for valid dispatch properties and endpoint properties
         * @return {Object}
         */
        _createOptionsForSearchJob: function() {
            return _.reduce(this.settings.toJSON(), function(accum, value, setting) {
                if (_.has(DISPATCHABLE_PROPERTIES, setting) ||
                    _.has(ENDPOINT_PROPERTIES, setting)) {
                    accum[setting] = value;
                }
                return accum;
            }, {});
        },

        // @todo: consider moving this method to the Report Model
        // it is also used in router/BootStrapSearch.js
        applyModelFullPathToName: function(model, name) {
            //check to see if name is NOT the path to the entity
            if (!/^\/services.*/i.test(name)){
                //we need to build the path to the entity from the SDK
                name = splunkDUtils.fullpath(
                    model.url + "/" + encodeURIComponent(name),
                    {
                        app: this.settings.get('app') || utils.getCurrentApp(),
                        owner: this.settings.get('owner') || splunkConfig.USERNAME
                    }
                );
            }
            return name;
        }

    });
    

    return SavedSearchManager;
});
