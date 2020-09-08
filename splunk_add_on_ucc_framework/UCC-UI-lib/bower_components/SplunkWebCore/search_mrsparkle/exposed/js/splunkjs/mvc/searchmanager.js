define(function(require, exports, module) {
    var _ = require("underscore");
    var $ = require("jquery");
    var mvc = require('./mvc');
    var Async = require('../splunk').Async;
    var BaseManager = require('./basemanager');
    var SplunkResultsModel = require('./splunkresultsmodel');
    var SearchModels = require('./searchmodel');
    var TokenSafeString = require("./tokensafestring");
    var TokenUtils = require('./tokenutils');
    var console = require('util/console');
    var JobTracker = require('./jobtracker');
    var Messages = require('./messages');
    var JobModel = require('models/search/Job');
    var JobsCollection = require('collections/search/Jobs');
    var splunkUtil = require('splunk.util');
    var splunkDUtils = require('util/splunkd_utils');
    var splunkjsUtils = require("splunkjs/mvc/utils");
    var splunkConfig = require('splunk.config');
    var moment = require('moment');
    require('util/moment/relative'); // This must be loaded, but will be used as a momentjs plugin

    var sdk = require('splunkjs/splunk');

    var registry = mvc.Components;
    var PROPERTIES_IGNORED_BY_CACHE = [
        // Doesn't affect results. Could be randomly generated which would
        // unintentionally bust the cache.
        'label',
        // Doesn't affect results. Ignoring this keeps old unit tests passing.
        'webframework.cache.hash',
        'app',
        'owner',
        'refresh',
        'refreshType'
    ];

    var ALLOWED_ATTRIBUTES = SearchModels.SearchSettingsModel.ALLOWED_ATTRIBUTES;

    // DOC: The public 'settings' field contains this component's settings model.
    // DOC: The public 'search' field is deprecated. Use the 'settings' field instead.
    // DOC: The public 'query' field is deprecated. Use the 'settings' field instead.
    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SearchManager
     * @description The **Search** manager encapsulates a search job, which includes the search query,
     *   the search properties, and dispatching the search.
     * @extends splunkjs.mvc.BaseManager
     *
     * @param {Object} options
     * @param {Number} options.id - The ID of this manager.
     * @param {String} [options.app=<The current app>] - The current app.
     * @param {Boolean} [options.autostart = true] - When true, the manager will automatically start a new job whenever any search
     *   properties change or when the page is loaded (the component-loader is called). If False, application code must call
     *   startSearch manually to start a search.
     * @param {Boolean} [options.cache=true] - `true`: Always use the results from a
     * preexisting search job when possible.</br>
     * `false`: Never use results from preexisting search jobs.</br>
     * _`n`_: The number of seconds indicating the maximum age a search job can
     * be to use its results. Results from search jobs that are newer than <i>n</i>
     * seconds will be used.
     * @param {Boolean} [options.cancelOnUnload=true] - When `true`, cancels any running searches when navigating away from the page.
     * @param {String} [options.owner=<The current owner>] - Sets the namespace (the owner context) to run in.
     * @param {Number} [options.sampleRatio=1] - The sampling ratio. When specified,
     * runs the search in event sampling mode to return a sample set of events
     * rather than all events. The formula for the ratio is 1/`sampleRatio`. For
     * example, if `sampleRatio` is 100, each event has a 1 in 100 chance of
     * being included in the result set.
     * @param {Number} options.sid - The search job ID (SID).
     * @param {Object} [options.settings] - Search properties. See the {@link http://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTsearch#POST_search.2Fjobs_method_detail| Search API POST Endpoint} for available options.
     * @param {Number} options.settings.auto_cancel - The number of seconds of inactivity after which to automatically cancel a job.
     *   0 means never auto-cancel.
     * @param {Number} options.settings.auto_finalize_ec - The number of events to process after which to auto-finalize the search.
     *   0 means no limit.
     * @param {Number} options.settings.auto_pause - The number of seconds of inactivity after which to automatically pause a job.
     *   0 means never auto-pause.
     * @param {String} options.settings.earliest_time - A time string that specifies the earliest time in the time range to search. The
     *   time string can be a UTC time (with fractional seconds), a relative time specifier (to now), or a formatted time string.
     *   For a real-time search, specift "rt".
     * @param {Boolean} options.settings.enable_lookups - A Boolean that indicates whether to apply lookups to events.
     * @param {String} options.settings.exec_mode - An enum value that indicates the search mode ("blocking", "oneshot", or "normal")
     * @param {Boolean} options.settings.force_bundle_replication - A Boolean that indicates whether this search should cause
     *   (and wait depending on the value of "sync_bundle_replication") bundle synchronization with all search peers.
     * @param {String} options.settings.id - A string that contains a search ID. If unspecified, a random ID is generated.
     * @param {String} options.settings.label - A custom name created for this search.
     * @param {String} options.settings.latest_time - A time string that specifies the latest time in the time range to search.
     *   The time string can be a UTC time (with fractional seconds), a relative time specifier (to now), or a formatted time string.
     *   For a real-time search, specify "rt".
     * @param {Number} options.settings.max_count - The number of events that can be accessible in any given status bucket.
     * @param {Number} options.settings.max_time - The numb er of seconds to run this search before finalizing. Specify 0 to never finalize.
     * @param {String} options.settings.namespace - A string that contains the application namespace in which to restrict searches.
     * @param {String} options.settings.now - A time string that sets the absolute time used for any relative time specifier in the search.
     * @param {Boolean} options.settings.preview - Indicates if preview is enabled for this search job.
     *   By default, preview is enabled for realtime searches and for searches where status_buckets > 0. Set to false to disable preview.
     * @param {String} options.settings.refresh - A relative time string to indicate the frequency of refresh searches.
     * @param {String} [options.settings.refreshType = delay] - Specifies how the refresh search will be triggered:
     *   * delay - The refresh search will be triggered the specified time after the initial search finishes.
     *   * interval - The refresh search will be triggered the specified time after the initial search starts.
     * @param {Number} options.settings.reduce_freq - The number of seconds (frequency) to run the MapReduce reduce phase on accumulated map values.
     * @param {Boolean} options.settings.reload_macros - A Boolean that indicates whether to reload macro definitions from the macros.conf configuration file.
     * @param {String} options.settings.remote_server_list - A string that contains a comma-separated list of (possibly wildcarded) servers from which to pull raw events. This same server list is used in subsearches.
     * @param {String} options.settings.required_field_list - Deprecated. Use "rf" instead.
     * @param {String} options.settings.rf - A string that adds one or more required fields to the search.
     * @param {Boolean} options.settings.rt_blocking - A Boolean that indicates whether the indexer blocks if the queue for this search is full. For real-time searches.
     * @param {Boolean} options.settings.rt_indexfilter - A Boolean that indicates whether the indexer pre-filters events. For real-time searches.
     * @param {Number} options.settings.rt_maxblocksecs - The number of seconds indicating the maximum time to block. 0 means no limit. For real-time searches with "rt_blocking" set to "true".
     * @param {Number} options.settings.rt_queue_size - The number indicating the queue size (in events) that the indexer should use for this search. For real-time searches.
     * @param {String} options.settings.search - A string that contains the search query.
     * @param {String} options.settings.search_listener - A string that registers a search state listener with the search. Use the format: search_state;results_condition;http_method;uri;
     * @param {String} options.settings.search_mode - An enum value that indicates the search mode ("normal" or "realtime"). If set to "realtime", searches live data. A real-time search is also specified by setting "earliest_time" and "latest_time" properties to "rt", even if the search_mode is normal or is not set.
     * @param {Boolean} options.settings.spawn_process - A Boolean that indicates whether to run the search in a separate spawned process. Searches against indexes must run in a separate process.
     * @param {Number} options.settings.status_buckets - The maximum number of status buckets to generate. 0 means to not generate timeline information.
     * @param {Boolean} options.settings.sync_bundle_replication - A Boolean that indicates whether this search should wait for bundle replication to complete.
     * @param {String} options.settings.time_format - A string that specifies the format to use to convert a formatted time string from {start,end}_time into UTC seconds.
     * @param {Number} options.settings.timeout - The number of seconds to keep this search after processing has stopped.
     *
     * @example
     * require([
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SearchManager) {
     *
     *     // Create managers
     *     new SearchManager({
     *         id: "example-search",
     *         earliest_time: "-24h@h",
     *         latest_time: "now",
     *         preview: true,
     *         cache: false,
     *         search: "index=_internal | stats count by sourcetype"
     *     });
     *
     * });
     */
    var SearchManager = BaseManager.extend( /** @lends splunkjs.mvc.SearchManager.prototype */{
        moduleId: module.id,

        defaults: {
            autostart: true,
            cache: false,
            cancelOnUnload: true,
            runWhenTimeIsUndefined: true,
            replaceTabsInSearch: false,
            defaultsToGlobalTimerange: false,
            refreshType: 'delay',
            app: splunkjsUtils.getCurrentApp(),
            owner: splunkConfig.USERNAME,
            // This overrides the default of `*` set in the Job model
            rf: undefined
        },

        constructor: function(attributes, options) {
            attributes = attributes || {};
            options = options || {};

            // Create settings model
            if (attributes.queryModel && attributes.searchModel) {
                // There is no sensible way to reinterpret a simultaneous
                // usage of both the deprecated 'queryModel' and 'searchModel'
                // options
                throw new Error(
                    'Cannot specify two custom settings models via ' +
                    'deprecated options "queryModel" and "searchModel".');
            }
            this.settings =
                // Internal. Allows custom settings model to be provided.
                attributes.settings ||
                // Support deprecated internal option 'queryModel'
                attributes.queryModel ||
                // Support deprecated internal option 'searchModel'
                attributes.searchModel ||
                // Create standard settings model if no custom one provided
                new SearchModels.SearchSettingsModel({}, options);

            // Alias deprecated public field 'query' to the combined settings model
            this.query = this.settings;
            // Alias deprecated public field 'search' to the combined settings model
            this.search = this.settings;

            // No need to set it on our model
            delete attributes.settings;
            delete attributes.queryModel;
            delete attributes.searchModel;

            var returnValue = BaseManager.prototype.constructor.apply(this, arguments);

            return returnValue;
        },

        initialize: function(options) {
            options = options || {};

            // @deprecated
            // Remove when removing job instance
            var service = mvc.createService({
                app: this.get('app'),
                owner: this.get('owner')
            });
            Object.defineProperty(this, 'service', {
                get: function() {
                    console.warn('SearchManager#service has been deprecated and will be removed in a future release.');
                    return service;
                }
            });

            if (!this.settings.has('label')) {
                // Preserve backward compatibility with Framework 1.0 which
                // always created search jobs labeled the same as the
                // associated search manager's ID by default.
                this.settings.set('label', this.id);
            }

            this._debouncedUpdateGlobalTimerange = _.debounce(this._updateGlobalTimerange.bind(this));
            // update global time range right away in initialize
            this._updateGlobalTimerange();

            this.listenTo(this.settings, 'change', this._handleSettingsChange);

            this._debouncedStartSearch = _.debounce(this.startSearch);


            // We want to change behavior depending on whether autostart is set
            // or not. So we first bind a listener to it changing, and then
            // we invoke that listener manually
            this.listenTo(this, "change:autostart", this.handleAutostart);
            this.listenTo(this, "search:error", function(msg) { this.lastError = msg; return true; });
            this.listenTo(this, 'all', function(evt) {
                if (evt.substring(0, 'search:'.length) === 'search:') {
                    this._lastSearchEvent = [ evt, Array.prototype.slice.call(arguments, 1) ];
                }
            });
            this.handleAutostart();
            
            this.listenToTokenDependencyChange();
            
            this.listenTo(this.settings, 'change:tokenDependencies', function(settings, newTokenDependencies) {
                var oldTokenDependencies = settings.previous('tokenDependencies');
                TokenUtils.stopListeningToTokenDependencyChange(oldTokenDependencies, registry);
                TokenUtils.listenToTokenDependencyChange(newTokenDependencies, registry, this._start, this);
            });
            
            this._cancelOnUnload = _.bind(this._cancelOnUnload, this);
            this.listenTo(this, 'change:cancelOnUnload change:cache', this.handleCancelOnUnload);
            this.listenTo(this, 'change:refresh change:refreshType', _.debounce(this._handleRefreshChange));
            this.handleCancelOnUnload();
        },
        
        /**
         * Moving this logic into its own method allows searchmanager.js, 
         * savedsearchmanager.js, and any other search manager to override
         * the behavior of '_start' (and consequently, 'startSearch').
         */
        listenToTokenDependencyChange: function() {
            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });
            TokenUtils.listenToTokenDependencyChange(tokenDependencies, registry, this._start, this);
            
            this._start();
        },

        _handleSettingsChange: function() {
            var managerPropertiesChanged = _.omit(this.settings.changed, ALLOWED_ATTRIBUTES);
            // Continue propagating non-job attributes to self for backward compatibility
            BaseManager.prototype.set.call(this, managerPropertiesChanged);
            this._debouncedUpdateGlobalTimerange();
        },

        _updateGlobalTimerange: function() {
            if (this.settings.get('defaultsToGlobalTimerange')) {
                // opt in the global time range only when no earliest_time/latest_time defined
                if (this.settings.get('earliest_time', {tokens: true}) == null &&
                    this.settings.get('latest_time', {tokens: true}) == null) {
                    this.settings.set({
                        'global_earliest_time': '$earliest$',
                        'global_latest_time': '$latest$'
                    }, {tokens: true});
                } else {
                    this.settings.set({
                        'global_earliest_time': undefined,
                        'global_latest_time': undefined
                    }, {unset: true, tokens: true});
                }
            }
        },

        _handleRefreshChange: function() {
            clearTimeout(this._refreshSearchTimout);
            var refreshType = this.get('refreshType');
            if (refreshType && refreshType !== 'delay' || (this._job ? this._job.isDone() : true)) {
                this._setRefreshSearch(refreshType);
            }
        },

        handleAutostart: function() {
            if (this.get("autostart")) {
                this.listenTo(this.settings, "change", this._handleSettingsChangeOnAutostart, this);
            }
            else {
                this.stopListening(this.settings, "change", this._handleSettingsChangeOnAutostart, this);
            }
        },

        _handleSettingsChangeOnAutostart: function() {
            var jobPropertiesChanged = _.pick(this.settings.changed, ALLOWED_ATTRIBUTES.concat(['global_earliest_time', 'global_latest_time']));
            if (!_.isEmpty(jobPropertiesChanged)) {
                this._debouncedStartSearch();
            }
        },

        handleCancelOnUnload: function() {
            this.stopListeningDOM($(window), 'unload', this._cancelOnUnload);
            if (this.get('cancelOnUnload') && !this.get('cache')) {
                this.listenToDOM($(window), 'unload', this._cancelOnUnload);
            }
        },

        _cancelOnUnload: function() {
            var job = this._job;
            if (job && !job.isDone()) {
                job.cancel({
                    // Force a synchronous XHR call since an asynchronous request might have no
                    // effect in the unload phase
                    async: false
                });
            }
        },

        _stopKeepAlive: function() {
            if (this._job) {
                this._job.stopKeepAlive();
            }
        },

        _startKeepAlive: function() {
            if (this._job) {
                this._job.startKeepAlive();
            }
        },

        /**
         * Sets the property to the specified value for the current component.
         * @param {String} property The property to set.
         * @param {Any} value The new value for the property.
         */
        set: function(key, value, options) {
            var attrs;

            // Normalize the key-value into an object
            if ((_.isObject(key) && !_.isArray(key)) || key === null) {
                attrs = key;
                options = value;
            } else {
                attrs = {};
                attrs[key] = value;
            }

            var settings = {};

            // If the deprecated 'search' or 'query' input attributes are
            // present then use them as the base set of output attributes
            // (and filter them out of the original input attributes).
            if (_.has(attrs, "search") && this._isDictionary(attrs.search)) {
                _.extend(settings, attrs.search);
                delete attrs.search;
            }
            if (_.has(attrs, "query") && this._isDictionary(attrs.query)) {
                _.extend(settings, attrs.query);
                delete attrs.query;
            }

            // Forward all attributes to settings model
            _.extend(settings, attrs);
            this.settings.set(settings, options);

            // Continue propagating attributes to self for backward compatibility
            BaseManager.prototype.set.call(this, attrs, options);
        },

        /**
         * Returns the value of property for the current component.
         * @param {String} attr - The name of the property.
         * @returns {Any}
         */
        get: function(attr) {
            return this.settings.get.apply(this.settings, arguments);
        },

        _isDictionary: function(value) {
            // NOTE: This logic is fragile. Unfortunately there's no good
            //       way to detect a raw dictionary (via an object literal)
            //       as opposed to an object created through the 'new' keyword.
            return _.isObject(value) && !(value instanceof TokenSafeString);
        },

        _start: function() {
            if (this.get("autostart")) {
                this.startSearch();
            }

            return this;
        },

        /**
         * Returns a {@link splunkjs.mvc.SplunkResultsModel|SplunkResultsModel} object for this manager's
         * job with the specified `source`.
         * @param {String} [source] - Valid values for `source` are:</br>
         * (`events | results_preview | results | summary`)
         * @param {Object[]} [attrs] - Attributes passed to the
         * {@link splunkjs.mvc.SplunkResultsModel|SplunkResultsModel}. Valid attributes are "count" and "offset", for example:
         *
         *     { count: 25, offset: 10 }
         *
         * @returns {splunkjs.mvc.SplunkResultsModel}
         */
        data: function(source, attrs) {
            if (!source) {
                throw new Error("Cannot get a results model without specifying the source.");
            }

            attrs = attrs || {};
            attrs.manager = this;
            attrs.source = source;
            return new SplunkResultsModel(attrs);
        },

        _startSearchFromSid: function(sid) {
            var that = this;
            var job = new JobModel({
                id: sid
            });

            job.fetch({
                data: {
                    app: this.get('app'),
                    owner: this.get('owner')
                },
                success: function() {
                    // Set our job and query model to the request parameters
                    // for this search, in case we need to make any changes
                    var updatedSettings = job.entry.content.request.pick(ALLOWED_ATTRIBUTES);
                    that.settings.set(updatedSettings, {
                        silent: true,
                        qualified: true
                    });

                    that.createManager(job);
                },
                error: function() {
                    var message = _("Error in getting pre-existing search: ").t() + sid;
                    that.trigger("search:error", message);
                }
            });
        },

        /**
         * Creates the search job.
         * @param {options.boolean} refresh - If `true`, restarts the current search. If `false`, cancels existing searches.
         */
        startSearch: function(options) {
            if (typeof options === 'boolean' || options === 'refresh') {
                options = {refresh: !!options};
            } else {
                options || (options = {});
            }
            this.lastError = '';
            this._refresh = options.refresh;
            this.cancel(); // Cancel any existing search
         
            // If we were provided with a SID, then we will
            // just try and use that
            if (this.has("sid")) {
                this._startSearchFromSid(this.get("sid"));
                return;
            }

            // Get the cache and convert it to a number:
            // false -> 0, never use cache
            // true -> -1, always use cache
            // positive integer -> positive integer, use cache if newer than
            var cache = this.get("cache") || false;
            if (_.isBoolean(cache)) {
                cache = cache ? -1 : 0;
            }

            var searchOptions = this._createOptionsForSearchJob();

            // Get the threshold for cache (which could be infinity)
            var threshold = cache < 0 ?
                (new Date(0)).valueOf() :
                ((new Date()).valueOf() - cache * 1000);

            // Only start a search if we have a search string
            if (!searchOptions.search) {
                if (this.settings.get("search", {tokens: true})) {
                    this.trigger("search:error", Messages.resolve("unresolved-search").message);
                }
                else {
                    this.trigger("search:error", _("No search query provided.").t());
                }
                return;
            }

            // Don't start search if waiting for time range
            var earliestSetting = 'earliest_time';
            var latestSetting = 'latest_time';
            if (this.settings.get('global_earliest_time', {tokens: true}) != null &&
                this.settings.get('global_latest_time', {tokens: true}) != null) {
                earliestSetting = 'global_earliest_time';
                latestSetting = 'global_latest_time';
            }

            var timeRangeIsUnresolved =
                (this.settings.get(earliestSetting, {tokens: false}) == null &&
                this.settings.get(earliestSetting, {tokens: true})) ||
                (this.settings.get(latestSetting, {tokens: false}) == null &&
                this.settings.get(latestSetting, {tokens: true}));
            if (timeRangeIsUnresolved && !this.settings.get("runWhenTimeIsUndefined")) {
                this.trigger("search:error", Messages.resolve("unresolved-search").message);
                return;
            }
            
            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });
            if (!TokenUtils.tokenDependenciesMet(tokenDependencies, registry)) {
                this.trigger("search:error", Messages.resolve("unresolved-tokens").message);
                return;
            }         

            // Skip fetching existing jobs if cache is disabled and directly create a new job
            if (cache === 0) {
                this.createSearch(searchOptions);
                return this;
            }

            // Filter on a hash derived from the job options as a performance
            // optimization to avoid enumerating every job on the server.
            // See _createOptionsForSearchJob() for this hash's computation.
            var filter = (searchOptions['webframework.cache.hash']) ?
                { search: 'request.webframework.cache.hash=' + searchOptions['webframework.cache.hash'] } :
                {};

            var that = this;

            (new JobsCollection()).fetch({
                data: _.extend(filter, {
                    app: this.get('app'),
                    owner: this.get('owner')
                }),
                success: function(jobs) {
                    // Omit PROPERTIES_IGNORED_BY_CACHE and format values as they are in the request
                    var targetOptions = _.reduce(searchOptions, function(accum, value, key) {
                        if (!_.contains(PROPERTIES_IGNORED_BY_CACHE, key)) {
                            if (key === 'search') {
                                // request data will have a qualified search
                                accum[key] = splunkUtil.addLeadingSearchCommand(value, true);
                            } else if (!_.isUndefined(value)) {
                                // request data will have string values
                                accum[key] = (_.isBoolean(value) || _.isNumber(value)) ?
                                    value.toString() : value;
                            }
                        }
                        return accum;
                    }, {});

                    var matches = jobs
                        .filter(function(job) {
                            var request = job.entry.content.request.omit(PROPERTIES_IGNORED_BY_CACHE);
                            var published = new Date(job.entry.get('published'));
                            return _.isEqual(request, targetOptions) &&
                                published > threshold;
                        });

                    if (matches.length) {
                        var mostRecentMatch = _.max(matches, function(job) {
                            return new Date(job.entry.get('published'));
                        });
                        that.createManager(mostRecentMatch);
                    } else {
                        that.createSearch(searchOptions);
                    }
                },
                error: function() {
                    console.log('Error fetching searches');
                    that.trigger('search:error', _('Error fetching searches').t());
                }
            });

            return this;
        },

        /**
         * Internal method for handling the logic of refresh searches.
         *
         * Only when the refreshType matches the manager setting refreshType
         * will a refresh search be triggered.
         *
         * @param {String} refreshType - The refreshType that should be triggered
         * by this invocation.
         */
        _setRefreshSearch: function(refreshType) {
            if (this.has('refresh') && this.get('refreshType') === refreshType) {
                var refreshValue = this.get('refresh');
                var timeoutDelay = moment()
                    .applyRelative(refreshValue, {
                        treatPlainNumberAs: 'second'
                    }).diff();
                if (timeoutDelay <= 0) {
                    console.warn('Warning: Invalid refresh value', refreshValue);
                } else {
                    clearTimeout(this._refreshSearchTimout);
                    this._refreshSearchTimout = setTimeout(this.startSearch.bind(this, {refresh: true}), timeoutDelay);
                }
            }
        },

        isRefresh: function() {
            return !!this._refresh;
        },

        _createOptionsForSearchJob: function() {
            var options = this.settings.pick(ALLOWED_ATTRIBUTES);

            if (options.earliest_time == null && options.latest_time == null && this.settings.get('defaultsToGlobalTimerange')) {
                options.earliest_time = this.settings.get('global_earliest_time');
                options.latest_time = this.settings.get('global_latest_time');
            }
            
            // Can only create a hash if there's a search string
            if (options.search) {
                options['webframework.cache.hash'] = 'java5:' +
                    SearchManager._createJava5HashForString(options.search).toString(16);

                if (this.settings.get('replaceTabsInSearch')) {
                    // SPL-122132 Replace tab character with a space in SPL since the search parser would fail otherwise
                    options.search = options.search.replace(/\t/g, ' ');
                }
            }

            return options;
        },

        /**
         * Pauses the search job.
         */
        pause: function() {
            if (this._job) {
                this._job.pause();
            }
        },

        /**
         * Resumes the search job.
         */
        unpause: function() {
            if (this._job) {
                this._job.unpause();
            }
            return this;
        },

        /**
         * Finalizes the search job.
         */
        finalize: function() {
            if (this._job) {
                this._job.finalize();
            }
            return this;
        },

        /**
         * Cancels the search job.
         */
        cancel: function() {
            // If this search is used with cache=true, then never cancel,
            // because somebody else might be using the same search.
            // Checks whether it was a refresh to load refresh messaging
            var msg = (this.isRefresh()) ? 'refresh' : 'cancelled';
            clearTimeout(this._refreshSearchTimout);

            if (this.get("cache")) {
                return;
            }

            var sid = this.getSid();
            if (sid) {
                JobTracker.untrack(sid, this);
                this._stopKeepAlive();
                this._job.cancel();
                this._job = null;
                this.trigger("search:" + msg);
            }
            return this;
        },

        // Create a search job manager for the given job.
        createManager: function(job) {
            var that = this;
            var check = _.bind(this._checkJob, this);
            var cacheEnabled = this.get('cache');

            // Stop keep alive *before* replacing the previous job (if any) with the new one
            this._stopKeepAlive();

            this._job = job;

            // @deprecated
            // Remove when removing job instance
            var mockSdkJob = this._sdkJobFromCoreJob(job);
            Object.defineProperty(this, 'job', {
                get: function() {
                    console.warn('SearchManager#job has been deprecated and will be removed in a future release.');
                    return mockSdkJob;
                },
                configurable: true
            });

            this._startKeepAlive();

            var jobData = this.getJobResponse().entry[0];
            this._setDataAttributes(jobData);

            this._setRefreshSearch('interval');

            // @deprecated
            // Remove mockSdkJob when removing job instance from the searchmanager.
            this.trigger("search:start", jobData, mockSdkJob);

            JobTracker.track(job, {
                progress: function(job) {
                    // Check if the event is from current active job
                    if (!check(job, cacheEnabled)) {
                        return;
                    }
                    
                    /**
                     * SPL-130843, SPL-131004: bugfix for erroneously dispatched searches.
                     *
                     * Description: Setting/unsetting a accepts/rejects token from a
                     * "preview", "progress", "finalized", "error", "fail" or "cancelled"
                     * node, will cause that token to be resolved AFTER a search manager's
                     * token dependency listeners are invoked. This will result in a
                     * "rejects" token erroneously meeting its token dependencies and
                     * dispatching searches.
                     *
                     * Every time a search receives results, cancel any jobs that don't 
                     * have their accepts/rejects token dependencies met.
                     */
                    var tokenDependencies = that.settings.get('tokenDependencies', { tokens: true });
                    if (!TokenUtils.tokenDependenciesMet(tokenDependencies, registry)) {
                        that.trigger("search:error", Messages.resolve("unresolved-tokens").message);
                        job.cancel();
                        return;
                    }

                    var jobData = that.getJobResponse().entry[0];

                    // @deprecated
                    // Remove mockSdkJob when removing job instance from the searchmanager.
                    mockSdkJob._load(jobData);
                    that.trigger("search:progress", jobData, mockSdkJob);

                    // Backbone does a deep equality check on sets, and since
                    // properties is an object, and the object contents may have
                    // not changed (e.g. due to a cached job), Backbone might not
                    // fire a "change" event. This ensures that a change
                    // event is fired every time by doing a silent unset followed
                    // by a set.
                    that.unset("data", {silent: true});
                    that._setDataAttributes(jobData);
                },
                done: function(job) {
                    // Check if the event is from current active job
                    if (!check(job, cacheEnabled)) {
                        return;
                    }

                    that._setRefreshSearch('delay');
                    var jobData = that.getJobResponse().entry[0];

                    // @deprecated
                    // Remove mockSdkJob when removing job instance from the searchmanager.
                    mockSdkJob._load(jobData);
                    that.trigger("search:done", jobData, mockSdkJob);
                },
                failed: function(job) {
                    // Check if the event is from current active job
                    if (!check(job, cacheEnabled)) {
                        return;
                    }
                    var jobData = that.getJobResponse().entry[0];

                    // @deprecated
                    // Remove mockSdkJob when removing job instance from the searchmanager.
                    mockSdkJob._load(jobData);
                    that.trigger("search:fail", jobData, mockSdkJob);
                }
            }, this);
        },

        _checkJob: function(job, cache){
            if (this._job !== job) {
                if (!cache) {
                    job.cancel();
                }
                return false;
            }
            return true;
        },

        /**
         * This is a helper function to format and set job entry data in a backward compatible and
         * easily accessible way.
         * @param {Object} jobEntry The entry data for this job from the REST API
         * @param {Object} [options] Options to be forwarded with the set call
         */
        _setDataAttributes: function(jobEntry, options) {
            return this.set({
                data: jobEntry.content,
                published: jobEntry.published
            }, options);
        },

        /**
         * Returns the raw splunkd response for this manager's job.
         * @return {Object|undefined} The response, or `undefined` when no job is set.
         */
        getJobResponse: function() {
            return this._job && this._job.toSplunkD();
        },

        /**
         * Returns `true` when this manager has a job.
         * @return {Boolean}
         */
        hasJob: function() {
            return !!this._job;
        },

        /**
         * Returns the SID of this manager's job, or `undefined` when no job is set.
         * @return {String|undefined}
         */
        getSid: function() {
            return this._job && this._job.id;
        },

        /**
         * Create a new search job from current options.
         * @param  {Object} [options] - Options object returned by `_createOptionsForSearchJob`. This
         * may be passed as an argument if already available.
         */
        createSearch: function(options) {
            options = options || this._createOptionsForSearchJob();
            var that = this;
            var cache = this.get('cache');

            var job = new JobModel();
            // NOTE: If there was already an _inflightCreateXHR,
            //       it will be aborted immediately when it responds.
            var req = this._inflightCreateXHR = job.save({}, {
                data: options,
                success: function() {
                    // Check if response is from an obsolete job creation XHR
                    if (req !== that._inflightCreateXHR) {
                        if (!cache) {
                            job.cancel();
                        }
                        return;
                    } else {
                        that._inflightCreateXHR = null;
                    }
                    that.createManager(job);
                },
                error: function(job, response) {
                    // We only want to trigger errors for non-abort cases. This is because
                    // we are the ones causing the abort (at the beginning of createSearch),
                    // and we should not cause an error for something we did. Furthermore,
                    // since we only abort in the case of creating a new search, we are guaranteed
                    // that the new search will cause some events to happen (even if those events
                    // are search:error ones).
                    if (response.status !== "abort") {
                        var err = splunkDUtils.convertToSDKResponse(response);
                        var sdkJob = that._sdkJobFromCoreJob(job);
                        that.trigger("search:error", _("Could not create search.").t(), err, sdkJob);
                    }
                    return;
                }
            });
        },

        replayLastSearchEvent: function(listener) {
            var replayed = false;
            if (this._lastSearchEvent) {
                var evtName = this._lastSearchEvent[0];
                var listenerObj = _(this._events[evtName]).find(function(attachedListener){
                    return attachedListener.ctx === listener;
                });
                if (listenerObj) {
                    var args = this._lastSearchEvent[1];
                    listenerObj.callback.apply(listener, args);
                    replayed = true;
                }
            }
            return replayed;
        },

        getLastSearchEvent: function() {
            return this._lastSearchEvent;
        },

        dispose: function() {
            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });
            TokenUtils.stopListeningToTokenDependencyChange(tokenDependencies, registry);
            
            this.cancel();
            if (_.isFunction(this.settings.dispose)) {
                this.settings.dispose();
            }
            BaseManager.prototype.dispose.apply(this, arguments);
        },

        // This is for backward compatibility and should be removed when we
        // remove the sdk job from this class.
        // @deprecated
        _sdkJobFromCoreJob: function(coreJob) {
            var service = mvc.createService({
                app: this.get('app'),
                owner: this.get('owner')
            });
            var sid = coreJob.entry.content.get('sid');
            var mockSdkJob = new MockSdkJob(service, sid);
            var data = coreJob.toSplunkD().entry;
            mockSdkJob._load(data);
            return mockSdkJob;
        }
    });

    /**
     * Hashes a string using the algorithm from the `java.lang.String`
     * hashCode function in Java SE 5.
     *
     * Note: The returned hash might be negative.
     */
    SearchManager._createJava5HashForString = function(s) {
        var h = 0;
        for (var i = 0, n = s.length; i < n; i++) {
            // (x|0) converts to 32-bit int
            h = (((31*h)|0) + s.charCodeAt(i))|0;
        }
        return h;
    };

    /**
     * A class that mocks the sdk Job class and warns that the instance has been
     * deprecated when a property is accessed.
     *
     * @deprecated
     * Remove when removing job instance from the searchmanager.
     */
    function MockSdkJob(sdkService, sid) {
        this._sdkJob = new sdk.Service.Job(sdkService, sid);
        _.forEach(this._sdkJob, function(prop, propName) {
            Object.defineProperty(this, propName, {
                get: function() {
                    // We use the _load method internally, so don't warn when it
                    // is used.
                    if (propName !== '_load') {
                        console.warn('Job instance from SearchMangers has been deprecated and will be removed in a future release');
                    }
                    return prop;
                }
            });
        }.bind(this));
    }

    return SearchManager;
});