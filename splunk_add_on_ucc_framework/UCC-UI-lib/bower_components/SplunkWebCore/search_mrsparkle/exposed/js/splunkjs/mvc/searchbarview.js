define(function(require, exports, module) {
    var $ = require("jquery");
    var _ = require("underscore");
    var mvc = require('./mvc');
    var Backbone = require("backbone");
    var BaseSplunkView = require("./basesplunkview");
    var console = require('util/console');
    var TimeRangeView = require("./timerangeview");
    var InternalSearchBar = require("views/shared/searchbar/Master");
    var TimeRangeModel = require('models/shared/TimeRange');
    var utils = require('./utils');
    var sharedModels = require('./sharedmodels');
    var splunkConfig = require('splunk.config');
    var SearchBarModel = require('models/search/SearchBar');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SearchBarView
     * @description The **SearchBar** view provides a search query and a built-in
     * **TimeRange** view for controlling a search manager.
     *
     * &nbsp;&nbsp;&nbsp;&nbsp;**Note**  To allow the **SearchBar** view to
     * modify its search manager, you must use tokens or set up a change handler.
     *
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {Boolean} [options.autoOpenAssistant=true] - Indicates whether to automatically open the search assistant
     * while the search bar is being typed in. </br>Applies only when **useAssistant** is set to `true`.
     * @param {String} [options.default] - The default value.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind
     * this control to.
     * @param {String} [options.searchAssistant] - The type of search assistant to use </br>(`full | compact | none`).
     * @param {Object} [options.settings] - The properties of the view.
     * @param {String} [options.timerange_*] - Dynamic properties of the internal
     * timerange created by the search bar. For example, **timerange_value**
     * corresponds to the **value** property of the internal timerange.
     * @param {Boolean} [options.timerange=true] - Indicates whether to display a
     * **TimeRange** view.
     * @param {Boolean} [options.useAssistant=true] - Deprecated. Indicates whether to display the search assistant.
     * @param {Boolean} [options.useSyntaxHighlighting=true] - Indicates whether to display syntax highlighting for the search string.
     * @param {Boolean} [options.autoFormat=false] - Indicates whether auto-format is enabled in the search input.
     * @param {Boolean} [options.showLineNumbers=false] - Indicates whether to show line numbers with the search string.
     * @param {String} [options.value] - The current value of the search bar.
     *
     * @example
     * require([
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/searchbarview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SearchManager, SearchBarView) {
     *
     *     // Create the search manager
     *     var mysearch = new SearchManager({
     *         id: "example-search",
     *         status_buckets: 300,
     *         required_field_list: "*",
     *         preview: true,
     *         cache: true,
     *         autostart: false, // Prevent the search from running automatically
     *         search: "index=_internal | head 500"
     *     });
     *
     *     // Create the searchbar
     *     var mysearchbar = new SearchBarView({
     *         id: "example-searchbar",
     *         managerid: "example-search",
     *         el: $("#mysearchbarview")
     *     }).render();
     *
     *     // Listen for changes to the search query portion of the searchbar
     *     mysearchbar.on("change", function() {
     *         // Reset the search query (allows the search to run again,
     *         // even when the query is unchanged)
     *         mysearch.settings.unset("search");
     *
     *         // Update the search query
     *         mysearch.settings.set("search", mysearchbar.val());
     *
     *         // Run the search (because autostart=false)
     *         mysearch.startSearch();
     *     });
     *
     *     // Listen for changes to the built-in timerange portion of the searchbar
     *     mysearchbar.timerange.on("change", function() {
     *         // Update the time range of the search
     *         mysearch.settings.set(mysearchbar.timerange.val());
     *
     *         // Run the search (because autostart=false)
     *         mysearch.startSearch();
     *     });
     * });
     */
    var SearchBarView = BaseSplunkView.extend(/** @lends splunkjs.mvc.SearchBarView.prototype */{
        moduleId: module.id,

        className: "splunk-searchbar",

        options: {
            "default": undefined,
            managerid: null,
            /**
             * Indicates whether to display an embedded TimeRange view
             * in this search bar.
             */
            timerange: true,
            /**
             * Indicates whether to display the search assistant.
             *
             * When the framework is in independent-mode the search assistant
             * does not function and this option will be ignored.
             *
             * Initialization-only.
             * 
             * @deprecated Use searchAssistant:'full'
             */
            useAssistant: true,
            /**
             * The type of search assistant to use (full | compact | none). 
             * 
             * @type {string} full|compact|none
             */
            searchAssistant: undefined,
            /**
             * Indicates whether to display syntax highlighting for the search string.
             * 
             * @type {Boolean}
             */
            useSyntaxHighlighting: true,
            /**
             * Indicates whether auto-format is enabled in the search input.
             * 
             * @type {Boolean}
             */
            autoFormat: false,
            /* Indicates whether to show line numbers with the search string.
             * 
             * @type {Boolean}
             */
            showLineNumbers: false,
            /**
             * Indicates whether to automatically open the search assistant
             * while the search bar is being typed in.
             *
             * Only applies if useAssistant is true.
             *
             * Initialization-only.
             */
            autoOpenAssistant: true,
            value: undefined
        },

        initialize: function() {
            var that = this;

            this.configure();
            this.settings.enablePush("value");

            if (this.settings.has('timepicker')) {
                console.warn(
                    'The "%s" setting of class "%s" is deprecated. Use "%s" instead.',
                    'timepicker', 'SearchBarView', 'timerange');
                this.settings.set('timerange', this.settings.get('timepicker'));
                this.settings.unset('timepicker');
            }

            // Initialize value with default, if provided
            this._onDefaultChange();

            this._state = new Backbone.Model({
                'dispatch.earliest_time': this.settings.get("earliest_time"),
                'dispatch.latest_time': this.settings.get("latest_time"),
                'search': this.settings.get('value') || ""
            });

            // Get the shared models
            var appModel = sharedModels.get("app");
            var userModel = sharedModels.get("user");
            var timesCollection = sharedModels.get("times");
            var serverInfo = sharedModels.get("serverInfo");
            var searchBNFsCollection = sharedModels.get("searchBNFs");

            var timeRangeModel = new TimeRangeModel();
            timeRangeModel.save({
                'earliest': this.settings.get("earliest_time"),
                'latest': this.settings.get("latest_time")
            });

            var searchBarModel = new SearchBarModel();

            // Create embedded time range view even if we don't
            // plan to actually show it.
            this.timerange = this._createTimeRange(this.settings);

            // Permit deprecated access to the 'timepicker' field
            this.timepicker = this.timerange;

            // We cannot create the searchbar until these internal models
            // have been fetched, and so we wait on them being done.
            this._dfd = $.when(timesCollection.dfd, userModel.dfd, serverInfo.dfd, searchBNFsCollection.dfd).done(function() {
                var useAssistant =
                    that.settings.get('useAssistant') &&
                    // JIRA: Remove search assistant's dependency on splunkweb,
                    //       making it depend on splunkd directly.
                    //       Then enable the search assistant in independent
                    //       mode. (SPL-80734)
                    !splunkConfig.INDEPENDENT_MODE;
                    
                var searchAssistant =
                    (!_.isUndefined(that.settings.get('searchAssistant')) && splunkConfig.INDEPENDENT_MODE) ?
                    'none':
                    that.settings.get('searchAssistant');
                    
                var autoOpenAssistant =
                    that.settings.get('autoOpenAssistant') &&
                    useAssistant;

                that.searchbar = new InternalSearchBar({
                    showTimeRangePicker: true,
                    useAssistant: useAssistant,
                    autoOpenAssistant: autoOpenAssistant,
                    searchAssistant: searchAssistant,
                    useSyntaxHighlighting: that.settings.get('useSyntaxHighlighting'),
                    autoFormat: that.settings.get('autoFormat'),
                    showLineNumbers: that.settings.get('showLineNumbers'),
                    disableOnSubmit: false,
                    collection: {
                        times: timesCollection,
                        searchBNFs: searchBNFsCollection
                    },
                    model: {
                        state: that._state,
                        timeRange: timeRangeModel,
                        user: userModel,
                        application: appModel,
                        serverInfo: serverInfo,
                        searchBar: searchBarModel
                    }
                });
            });

            // Update view if model changes
            this.settings.on("change:value", function(model, value, options) {
                options = options || {};
                var suppressValSet = options._self;
                if (!suppressValSet) {
                    that.val(value || "");
                }
            });

            this.bindToComponentSetting('managerid', this._onManagerChange, this);

            this._state.on("change:search", this._onSearchChange, this);
            this.settings.on("change:timerange", this._onDisplayTimeRangeChange, this);
            this.settings.on("change:default", this._onDefaultChange, this);
        },

        _createTimeRange: function(settings) {
            var timeRangeOptions = settings.extractWithPrefix('timerange_');
            var timePickerOptions = settings.extractWithPrefix('timepicker_');
            if (!_.isEmpty(timePickerOptions)) {
                console.warn(
                    'The "%s" settings of class "%s" are deprecated. Use "%s" instead.',
                    'timepicker_*', 'SearchBarView', 'timerange_*');
            }

            var options = _.extend(
                { managerid: settings.get("managerid") },
                timeRangeOptions,
                timePickerOptions);

            return new TimeRangeView(options);
        },

        _onDefaultChange: function(model, value, options) {
            // Initialize value with default, if provided
            var oldDefaultValue = this.settings.previous("default");
            var defaultValue = this.settings.get("default");
            var currentValue = this.settings.get('value');

            if (defaultValue !== undefined &&
                (currentValue === oldDefaultValue || currentValue === undefined))
            {
                this.settings.set('value', defaultValue);
            }
        },

        _onDisplayTimeRangeChange: function() {
            // We cannot work with the searchbar/timerange until they
            // are done being created.
            var that = this;
            $.when(this._dfd).done(function() {
                if (that.settings.get("timerange")) {
                    that.searchbar.children.timeRangePicker.$el.show();
                }
                else {
                    that.searchbar.children.timeRangePicker.$el.hide();
                }
            });
        },

        _onManagerChange: function(managers, manager) {
            if (this.manager) {
                this.manager.off(null, null, this);
                this.manager = null;
            }

            this.manager = manager;

            // We defer setting the query to let the underlying search bar
            // have enough to finish setting up. Since we might get a
            // a manager synchronously, it may have not finished setting up
            // (e.g. it is setting its own deferred actions).
            var that = this;
            _.defer(function() {
                that._updateQuery();
            });
        },

        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            // We cannot work with the searchbar/timerange until they
            // are done being created.
            var that = this;
            $.when(this._dfd).done(function() {
                if (!that._rendered) {
                    that.searchbar.render();
                    that._patchTimePicker();

                    that.$el.append(that.searchbar.el);

                    // Ensure we properly show/hide the timerange
                    that._onDisplayTimeRangeChange();

                    // Prevent multiple renderings
                    that._rendered = true;
                }
            });

            return this;
        },

        _patchTimePicker: function() {
            // Patch the internal search bar to display our time range view
            // (which may have special customizations) instead of the search
            // bar's original internal time range view.
            //
            // The MVC time range view is patched in instead of its
            // underlying internal time range for backward compatibility
            // with existing CSS. We may break this compatibility later.
            this.searchbar.children.timeRangePicker.setElement(
                this.timerange.el);

            // Manually rerender the time range view in the DOM
            this.timerange.render();
            this.searchbar.$('.search-timerange')
                .empty()
                .append(this.timerange.el);

            // Add back the 'btn-group' CSS class, which is necessary
            // for the vertical divider between the time range view
            // and the search button to display.
            $(this.timerange.el).addClass('btn-group');

            // Patch our time range view to synchronize its state with
            // the internal search bar's internal time range view.
            utils.syncModels(
                // embedded internal time range's model
                this.timerange.timepicker.model.timeRange,
                // internal search bar's internal time range's model
                this.searchbar.children.timeRangePicker.model.timeRange,
                // bidirectional sync; initialize with first model
                { auto: true });
        },

        /**
         * Gets the view's value if passed no parameters.
         * Sets the view's value if passed a single parameter.
         * @param {String} value - The value to set.
         * @returns {String}
         */
        val: function(value) {
            if (value !== undefined) {
                this._setSearch(value);

                /*
                 * Force firing of a new change event, even if the new
                 * value is the same as the old value. This provides
                 * the expected behavior if the user presses enter in
                 * a search box to refresh the search.
                 */
                this.settings.unset("value", {_self: true});
                this.settings.set("value", value, {_self: true});

                this.trigger("change", value, this);
            }
            else {
                return this._getSearch();
            }
        },

        _onSearchChange: function(model, value, options) {
            options = options || {};
            var suppressValSet = options._self;
            if (!suppressValSet) {
                this.val(value);
            }
        },

        _getSearch: function() {
            return this._state.get("search");
        },

        _setSearch: function(newSearch) {
            this._state.set("search", newSearch, {_self: true});
        },

        _updateQuery: function() {
            // If we have a previous search query set, display it
            if (this.manager) {
                var currentSearch = this._state.get("search") || "";
                var newSearch = (this.manager.settings.resolve() || "").trim();

                if (!currentSearch && newSearch) {
                    this._setSearch(newSearch);
                }
            }
        }
    });

    return SearchBarView;
});
