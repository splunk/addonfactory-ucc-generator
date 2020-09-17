define(function(require, exports, module) {
    var $ = require("jquery");
    var _ = require("underscore");
    var SplunkUtil = require("splunk.util");
    var SelectedFieldsCollection = require("collections/search/SelectedFields");
    var WorkflowActionsCollection = require("collections/services/data/ui/WorkflowActions");
    var SearchJobModel = require("models/search/Job");
    var ResultModel = require("models/services/search/jobs/Result");
    var splunkConfig = require('splunk.config');
    var SummaryModel = require("models/services/search/jobs/Summary");
    var console = require("util/console");
    var LazyEventsViewer = require("views/shared/eventsviewer/LazyEventsViewer");
    var BaseSplunkView = require("./basesplunkview");
    var Messages = require("./messages");
    var mvc = require("./mvc");
    var PaginatorView = require("./paginatorview");
    var Utils = require("./utils");
    var sharedModels = require('./sharedmodels');
    var GeneralUtils = require('util/general_utils');
    var TokenAwareModel = require('./tokenawaremodel');
    var ReportModel = require('models/search/Report');
    var Drilldown = require('./drilldown');

    // This regex will take a space or comma separated list of fields, with quotes
    // for escaping strings with spaces in them, and match each individual
    // field.
    var fieldSplitterRegex = /(["'].*?["']|[^"',\s]+)(?=\s*|\s*,|\s*$)/g;

    // This regex will take a string that may or may not have leading quotes,
    // and strip them.
    var quoteStripperRegex = /^["']|["|']$/g;

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name EventsViewerView
     * @description The **EventsViewer** view displays Splunk events in a table
     * that supports pagination and variable formatting. Given a search manager,
     * the **EventsViewer** displays the events corresponding to that search.
     *
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {Number} [options.count] - The number of events to display per page.
     * @param {String} [options.data="events"] - The type of data to retrieve from the
     * search results </br>(`results | preview | events | summary | timeline`).
     * @param {Boolean} [options.drilldownRedirect=true] - Indicates whether to redirect
     * to a search page when clicked. When true, a refined search corresponding
     * to the point that was clicked is displayed in the search app.
     * @param {String} [options.list.drilldown="full"] - The type of drilldown action
     * (`full | inner | outer | none`).</br>
     * - `full`: Enables the entire entry for drilldown.</br>
     * - `inner`: Enables inner elements of the event listing for drilldown.</br>
     * - `outer`: Enables outer elements of the event listing for drilldown.</br>
     * - `none`: Disables drilldown.
     * @param {Boolean} [options.list.wrap=true] - Indicates whether to wrap the events
     * in a `list` viewer.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind
     * this control to.
     * @param {Number} [options.maxLines] - The maximum number of lines to display for
     * each result or event.
     * @param {String} [options.pagerPosition="bottom"] - The position of the paginator
     * (`top |bottom`).
     * @param {String} [options.raw.drilldown="full"] - The type of drilldown action
     * (`full | inner | outer | none`).</br>
     * - `full`: Enables the entire entry for drilldown.</br>
     * - `inner`: Enables inner elements of the event listing for drilldown.</br>
     * - `outer`: Enables outer elements of the event listing for drilldown.</br>
     * - `none`: Disables drilldown.
     * @param {Boolean} [options.rowNumbers=true] - Indicates whether to display row numbers.
     * @param {Object} [options.settings] - The properties of the view.
     * @param {Boolean} [options.showPager=true] - Indicates whether to display the table
     * pagination control.
     * @param {Boolean} [options.softWrap] - Deprecated. Indicates whether to enable soft wrapping
     * of text in the viewer.
     * @param {Boolean} [options.table.drilldown=true] - Indicates whether to enable drilldown.
     * @param {String} [options.table.sortColumn] - The name of the column to sort by.
     * @param {String} [options.table.sortDirection="asc"] - The direction to sort (`asc | desc`).
     * @param {Boolean} [options.table.wrap] - Indicates whether to wrap the events in a
     * `table` viewer.
     * @param {String} [options.type="list"] - The format type for displaying events
     * (`list | raw | table`).
     *
     * @example
     * require([
     *     "splunkjs/mvc/eventsviewerview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(EventsViewer) {
     *
     *     // Instantiate components
     *     tableviewer = new EventsViewer({
     *         id: "example-eventsviewer",
     *         managerid: "example-search",
     *         type: "table",
     *         "table.drilldown": true, // Place complex property names within quotes
     *         drilldownRedirect: false,
     *         "table.sortColumn": "sourcetype",
     *         "table.sortDirection": "asc",
     *         "table.wrap": true,
     *         count: 5,
     *         pagerPosition: "top",
     *         rowNumbers: false,
     *         el: $("#myeventsviewer")
     *     }).render();
     *
     *     // Create a click event handler
     *     tableviewer.on("click", function(e) {
     *         e.preventDefault();
     *         console.log("Click event");
     *         // TO DO: Do something when the events viewer is clicked
     *     });
     * });
     */
    var EventsViewerView = BaseSplunkView.extend(/** @lends splunkjs.mvc.EventsViewerView.prototype */{

        className: "splunk-events-viewer",

        options: {
            "managerid": null,
            "data": "events",
            "showPager": true,
            "pagerPosition": "bottom",
            "drilldownRedirect": true,
            "maxCount" : 100
        },

        reportDefaults: {
            "display.events.fields": '["host", "source", "sourcetype"]',
            "display.events.type": "list",
            "display.prefs.events.count": 10,
            "display.events.rowNumbers": "1",
            "display.events.maxLines": "5",
            "display.events.histogram": "0",
            "display.events.raw.drilldown": "full",
            "display.events.list.wrap": "1",
            "display.events.list.drilldown": "full",
            "display.events.table.wrap": "1",
            "display.events.table.drilldown": "1",
            "display.events.table.sortDirection": "asc"
        },

        omitFromSettings: ["el", "id", "name", "manager",
            "reportModel", "displayRowNumbers", "segmentation",
            "softWrap"],

        normalizeOptions: function(settings, options) {
            if (options.hasOwnProperty("rowNumbers")) {
                if(GeneralUtils.isBooleanEquivalent(options.rowNumbers)) {
                    settings.set("rowNumbers", GeneralUtils.normalizeBoolean(options.rowNumbers) ? "1" : "0");
                } else {
                    settings.set("rowNumbers", options.rowNumbers);
                }
            } else if (options.hasOwnProperty("displayRowNumbers")) {
                settings.set("rowNumbers", SplunkUtil.normalizeBoolean(options.displayRowNumbers) ? "1" : "0");
            }

            if (options.hasOwnProperty('drilldown')) {
                this._applyDrilldownType(options.drilldown, settings);
            }
            if (options.hasOwnProperty("raw.drilldown")) {
                settings.set("raw.drilldown", options["raw.drilldown"]);
            } else if (options.hasOwnProperty("segmentation") && !options.hasOwnProperty('drilldown')) {
                settings.set("raw.drilldown", options.segmentation);
            }

            if (options.hasOwnProperty("list.drilldown")) {
                settings.set("list.drilldown", options["list.drilldown"]);
            } else if (options.hasOwnProperty("segmentation") && !options.hasOwnProperty('drilldown')) {
                settings.set("list.drilldown", options.segmentation);
            }

            if (options.hasOwnProperty("table.drilldown")) {
                var drilldown = options["table.drilldown"];
                if (drilldown === 'all') {
                    drilldown = true;
                } else if (drilldown === 'none') {
                    drilldown = false;
                }

                if(GeneralUtils.isBooleanEquivalent(drilldown)) {
                    settings.set("table.drilldown", GeneralUtils.normalizeBoolean(drilldown) ? "1" : "0");
                } else {
                    settings.set("table.drilldown", drilldown);
                }
            } else if (options.hasOwnProperty("segmentation")) {
                settings.set("table.drilldown", (options.segmentation !== "none") ? "1" : "0");
            }

            if (options.hasOwnProperty("list.wrap")) {
                if(GeneralUtils.isBooleanEquivalent(options["list.wrap"])) {
                    settings.set("list.wrap", GeneralUtils.normalizeBoolean(options["list.wrap"]) ? "1" : "0");
                } else {
                    settings.set("list.wrap", options["list.wrap"]);
                }
            } else if (options.hasOwnProperty("softWrap")) {
                settings.set("list.wrap", SplunkUtil.normalizeBoolean(options.softWrap) ? "1" : "0");
            }

            if (options.hasOwnProperty("table.wrap")) {
                if(GeneralUtils.isBooleanEquivalent(options["table.wrap"])) {
                    settings.set("table.wrap", GeneralUtils.normalizeBoolean(options["table.wrap"]) ? "1" : "0");
                } else {
                    settings.set("table.wrap", options["table.wrap"]);
                }
            } else if (options.hasOwnProperty("softWrap")) {
                settings.set("table.wrap", SplunkUtil.normalizeBoolean(options.softWrap) ? "1" : "0");
            }

            if (!options.hasOwnProperty("count") && !settings.has("count")) {
                settings.set("count", this.reportDefaults['display.prefs.events.count']);
            }

            if (!options.hasOwnProperty("maxLines") && !settings.has("maxLines")) {
                settings.set("maxLines", this.reportDefaults['display.events.count'].toString());
            } else {
                settings.set("maxLines", settings.get('maxLines').toString());
            }
        },

        initialize: function(options) {
            this.configure();
            this.model = this.options.reportModel || TokenAwareModel._createReportModel(this.reportDefaults);
            this.settings._sync = Utils.syncModels({
                source: this.settings,
                dest: this.model,
                prefix: "display.events.",
                include: ["fields", "type", "count", "rowNumbers", "maxLines", "raw.drilldown", "list.drilldown", "showPager",
                    "list.wrap", "table.drilldown", "table.wrap", "table.sortDirection", "table.sortColumn"],
                exclude: ["drilldownRedirect", "managerid"],
                auto: true,
                alias: {
                    count: 'display.prefs.events.count'
                }
            });
            this.settings.on("change", this.onSettingsChange, this);
            this.model.on("change", this.onReportChange, this);

            if (this.options.normalizeSettings !== false) {
                this.normalizeOptions(this.settings, options);
            }

            this.resultModel = new ResultModel();

            this.summaryModel = new SummaryModel();

            this.searchJobModel = new SearchJobModel();

            this.reportModel = new ReportModel();
            this.reportModel._syncPush = Utils.syncModels({
                source: this.model,
                dest: this.reportModel.entry.content,
                tokens: false,
                auto: 'push'
            });
            this.reportModel._syncPull = Utils.syncModels({
                source: this.model,
                dest: this.reportModel.entry.content,
                tokens: false,
                include: ['display.events.table.sortColumn','display.events.table.sortDirection'],
                auto: 'pull'
            });
            this.listenTo(this.reportModel, 'eventsviewer:drilldown', this.handleMiscDrilldown);

            this.applicationModel = sharedModels.get("app");

            this.selectedFieldsCollection = new SelectedFieldsCollection();

            this.workflowActionsCollection = new WorkflowActionsCollection();
            this.workflowActionsCollection.fetch({
                data: {
                    app: this.applicationModel.get("app"),
                    owner: this.applicationModel.get("owner"),
                    count: -1,
                    sort_key: "name",
                    search: "disabled=false"
                },
                success: _.bind(function() {
                    this._isWorkflowActionsCollectionReady = true;
                    this.render();
                }, this)
            });
            this._lastJobFetched = null;

            this.updateSelectedFields();
            this.bindToComponentSetting('managerid', this.onManagerChange, this);

            this.eventsViewer = new LazyEventsViewer({
                model: {
                    result: this.resultModel,  // <models.services.search.jobs.Results>
                    summary: this.summaryModel,  // <models.services.search.jobs.Summary>
                    searchJob: this.searchJobModel,  // <models.Job>
                    report: this.reportModel,  // <models.services.SavedSearch>
                    application: this.applicationModel//,  // <models.Application>
                },
                collection: {
                    selectedFields: this.selectedFieldsCollection,  // <collections.SelectedFields>
                    workflowActions: this.workflowActionsCollection  // <collections.services.data.ui.WorkflowActions>
                },
                selectableFields: false,  // true|false
                headerMode: "none",  // dock|none (eventually this will have static mode)
                allowRowExpand: true,  // true|false
                allowModalize: true,  // true|false
                defaultDrilldown: false
            });
            this.eventsViewer.load();
            this.listenTo(this.eventsViewer, 'drilldown', this.emitDrilldownEvent);

            // If we don't have a manager by this point, then we're going to
            // kick the manager change machinery so that it does whatever is
            // necessary when no manager is present.
            if (!this.manager) {
                this.onManagerChange(mvc.Components, null);
            }
        },
        configure: function() {
            if (this.options.normalizeSettings === false) {
                this.omitFromSettings = (this.omitFromSettings || []).concat(
                    _(this.options).chain().omit('id', 'managerid', 'data', 'resizable', 'drilldownRedirect', 'pagerPosition').keys().value());
            }
            return BaseSplunkView.prototype.configure.apply(this, arguments);
        },
        onManagerChange: function(ctxs, manager) {
            if (this.manager) {
                this.manager.off(null, null, this);
                this.manager = null;
            }
            if (this.eventData) {
                this.eventData.off();
                this.eventData.destroy();
                this.eventData = null;
            }
            if (this.summaryData) {
                this.summaryData.off();
                this.summaryData.destroy();
                this.summaryData = null;
            }

            this._searchStatus = null;
            this._eventCount = 0;
            this._isSummaryModelReady = false;
            this._isSearchJobModelReady = false;
            this._lastJobFetched = null;

            this.resultModel.setFromSplunkD({});
            this.summaryModel.setFromSplunkD({});

            if (!manager) {
                this._searchStatus = { state: "nomanager" };
                this.render();
                return;
            }

            // Clear any messages, since we have a new manager.
            this._searchStatus = { state: "start" };

            this.manager = manager;
            this.manager.on("search:start", this.onSearchStart, this);
            this.manager.on("search:progress", this.onSearchProgress, this);
            this.manager.on("search:done", this.onSearchDone, this);
            this.manager.on("search:cancelled", this.onSearchCancelled, this);
            this.manager.on("search:refresh", this.onSearchRefreshed, this);
            this.manager.on("search:error", this.onSearchError, this);
            this.manager.on("search:fail", this.onSearchFailed, this);

            this.eventData = this.manager.data("events", {
                autofetch: false,
                output_mode: "json",
                truncation_mode: "abstract"
            });
            this.eventData.on("data", this.onEventData, this);
            this.eventData.on("error", this.onSearchError, this);

            this.summaryData = this.manager.data("summary", {
                autofetch: false,
                output_mode: "json",
                top_count: 10,
                output_time_format: "%d/%m/%y %l:%M:%S.%Q %p"
            });
            this.summaryData.on("data", this.onSummaryData, this);
            this.summaryData.on("error", this._onSummaryError, this);

            // Handle existing job
            var content = this.manager.get("data");
            if (content && content.eventAvailableCount) {
                this.onSearchStart(content);
                this.onSearchProgress({ content: content });
                if (content.isDone) {
                    this.onSearchDone({ content: content });
                }
            } else {
                this.render();
            }
            manager.replayLastSearchEvent(this);
        },

        _fetchJob: function(jobContent) {
            this._isRealTimeSearch = jobContent.isRealTimeSearch;
            var sid = jobContent.sid;
            if (this._lastJobFetched !== sid || !this._isSearchJobModelReady) {
                this._lastJobFetched = sid;
                this.searchJobModel.set("id", sid);
                var jobResponse = this.manager.getJobResponse();
                if (!jobResponse) {
                    return;
                }
                this.searchJobModel.setFromSplunkD(jobResponse);
                if (!this._isSearchJobModelReady) {
                    this._isSearchJobModelReady = true;
                    this.render();
                }

            }
        },

        onSearchStart: function(jobContent) {
            jobContent = jobContent || this.manager.get('data');
            this._searchStatus = { state: "running" };
            this._eventCount = 0;
            this._statusBuckets = undefined;
            this._lastJobFetched = null;
            this._isSummaryModelReady = false;
            this._isSearchJobModelReady = false;

            this.resultModel.setFromSplunkD({});
            this.summaryModel.setFromSplunkD({});
            this._fetchJob(jobContent);

            this.render();
        },

        onSearchProgress: function(properties) {
            this._searchStatus = { state: "running" };
            properties = properties || {};
            var jobContent = properties.content || {};
            var eventCount = jobContent.eventAvailableCount || 0;
            var statusBuckets = this._statusBuckets = jobContent.statusBuckets || 0;
            var searchString = properties.name;
            var isRealTimeSearch = jobContent.isRealTimeSearch;
            this._fetchJob(jobContent);

            // If we have a search string, then we set it on the report model,
            // otherwise things like the intentions parser don't work. We do it
            // silently however to ensure that nobody picks it up until they
            // need it.
            if (searchString) {
                // Since this search comes from the API, we need to strip away
                // the leading search command safely.
                searchString = SplunkUtil.stripLeadingSearchCommand(searchString);
                this.reportModel.entry.content.set('search', searchString, {silent: true});
            }

            this._eventCount = eventCount;

            if (eventCount > 0) {
                this.updateEventData();
            }

            // (Continuously request realtime summaries, even if there are
            //  no status buckets, as some kind of summary data - even blank
            //  data - is required for the EventsViewerView to display anything.
            //  Non-realtime jobs will eventually complete and get summary data
            //  at that time even if statusBuckets is 0 because we ask for
            //  summary data when the search is done.)
            if (statusBuckets > 0 || isRealTimeSearch) {
                this.updateSummaryData();
            }

            this.render();
        },

        onSearchDone: function(properties) {
            this._searchStatus = { state: "done" };

            properties = properties || {};
            var jobContent = properties.content || {};
            var eventCount = jobContent.eventAvailableCount || 0;
            this._fetchJob(jobContent);

            this._eventCount = eventCount;

            this.updateEventData();
            this.updateSummaryData();
            this.render();
        },

        onSearchCancelled: function() {
            this._searchStatus = { state: "cancelled" };
            this.render();
        },

        onSearchRefreshed: function() {
            this._searchStatus = { state: "refresh" };
            this.render();
        },

        onSearchError: function(message, err) {
            var msg = Messages.getSearchErrorMessage(err) || message;
            this._searchStatus = { state: "error", message: msg };
            this.render();
        },

        onSearchFailed: function(state) {
            var msg = Messages.getSearchFailureMessage(state);
            this._searchStatus = { state: "error", message: msg };
            this.render();
        },

        onEventData: function(model, data) {
            this.resultModel.setFromSplunkD(data);
            this.render();
        },

        onSummaryData: function(model, data) {
            this.summaryModel.setFromSplunkD(data);
            if (!this._isSummaryModelReady) {
                this._isSummaryModelReady = true;
                this.render();
            }
        },

        _onSummaryError: function(message, err) {
            this.onSearchError(message, err);
        },

        onSettingsChange: function(model) {
            if (model.hasChanged('fields')) {
                this.updateSelectedFields();
            }
            if (model.hasChanged("showPager") ||
                model.hasChanged("pagerPosition") ||
                model.hasChanged("count") ||
                model.hasChanged("fields")) {
                this.render();
            }
            if (model.hasChanged("showPager") ||
                model.hasChanged("type") ||
                model.hasChanged("count") ||
                model.hasChanged("maxLines") ||
                model.hasChanged("raw.drilldown") ||
                model.hasChanged("table.drilldown") ||
                model.hasChanged("list.drilldown")) {
                this.updateEventData();
            }
            if (model.hasChanged('drilldown')) {
                this._applyDrilldownType(model.get('drilldown'), model);
            } else if (model.hasChanged('table.drilldown') || model.hasChanged('raw.drilldown') ||
                model.hasChanged('list.drilldown')) {
                var segmentation = this.options.segmentation;
                var checkSetting = _.bind(function(settings, value, name) {
                    return settings.get(name+'.drilldown') === value;
                }, null, this.settings);
                if (_({ table: '1', raw: segmentation || 'full', list: segmentation || 'full' }).all(checkSetting)) {
                    this.settings.set('drilldown', 'all');
                } else if (_({ table: '0', raw: 'none', list: 'none' }).all(checkSetting)) {
                    this.settings.set('drilldown', 'none');
                } else {
                    this.settings.unset('drilldown');
                }
            }
        },

        _applyDrilldownType: function(type, settings) {
            // React to changes of the "virtual" drilldown setting
            if (type === 'all') {
                var segmentation = this.options.segmentation || 'full';
                settings.set({
                    'raw.drilldown': segmentation,
                    'list.drilldown': segmentation,
                    'table.drilldown': '1'
                });
            } else if (type === 'none') {
                settings.set({
                    'raw.drilldown': 'none',
                    'list.drilldown': 'none',
                    'table.drilldown': '0'
                });
            }
            if (type) {
                settings.set('drilldown', type, { silent: true });
            }
        },

        onReportChange: function(model) {
            if (model.hasChanged("display.events.table.sortColumn") ||
                model.hasChanged("display.events.table.sortDirection")) {
                this.updateEventData();
            }
        },

        emitDrilldownEvent: function(e, defaultDrilldown) {
            var displayType = this.model.get('display.events.type');
            var drilldownMode = this.settings.get(displayType + '.drilldown');
            if (drilldownMode === 'none' ||
                (displayType === 'table' && SplunkUtil.normalizeBoolean(drilldownMode) === false)) {
                return;
            }
            var field = e.data.field;
            var value = e.data.value;
            if (field === undefined && e.data.action === 'addterm') {
                field = '_raw';
            } else if (field === undefined && e._time) {
                field = '_time';
                value = SplunkUtil.getEpochTimeFromISO(e._time);
            }
            var data = {
                'click.name': field,
                'click.value': value,
                'click.name2': field,
                'click.value2': value
            };
            var idx = e.idx;
            if (idx !== undefined && idx >= 0) {
                var event = this.resultModel.results.at(idx).toJSON();
                if (event) {
                    _.each(event, function(value, field) {
                        data['row.' + field] = value.length > 1 ? value.join(',') : value[0];
                    });
                    var earliest = SplunkUtil.getEpochTimeFromISO(event._time);
                    data.earliest = earliest;
                    data.latest = String(parseFloat(earliest) + 1);
                }
            }

            var defaultDrilldownCallback = _.bind(this._onIntentionsApplied, this, e);
            var reportModel = this.model;
            var payload = Drilldown.createEventPayload({
                field: field,
                data: data,
                event: e
            }, function() {
                var searchAttributes = _.pick(reportModel.toJSON({ tokens: true }),
                    'search', 'dispatch.earliest_time', 'dispatch.latest_time');
                defaultDrilldown()
                    .done(defaultDrilldownCallback)
                    .always(function() {
                        // Restore search settings on the report model
                        reportModel.set(searchAttributes, { tokens: true, silent: true });
                    });
            });
            this.trigger('drilldown click', payload, this);
            if (this.settings.get("drilldownRedirect") && !payload.defaultPrevented()) {
                payload.drilldown();
            }
        },

        _onIntentionsApplied: function(e) {
            var model = this.reportModel.entry.content;
            var search = model.get("search");
            var timeRange = {
                earliest: model.get("dispatch.earliest_time"),
                latest: model.get("dispatch.latest_time")
            };
            if (timeRange.earliest === this.manager.get('earliest_time') &&
                timeRange.latest === this.manager.get('latest_time')) {
                timeRange = Drilldown.getNormalizedTimerange(this.manager);
            }
            var data = _.extend({ q: search }, timeRange);
            var preventRedirect = false;
            this.trigger('drilldown:redirect', { data: data, preventDefault: function() { preventRedirect = true; }});
            if (!preventRedirect) {
                var drilldownFunction = splunkConfig.ON_DRILLDOWN || Drilldown.redirectToSearchPage;
                drilldownFunction(data, e.event.ctrlKey || e.event.metaKey || e.newTab);
            }
        },

        // Handle clicks on links in the field info dropdown ("Top values over time", etc)
        handleMiscDrilldown: function() {
            var drilldownFunction = splunkConfig.ON_DRILLDOWN || Drilldown.redirectToSearchPage;
            var data = {
                q: this.reportModel.entry.content.get('search'),
                earliest: this.reportModel.entry.content.get('dispatch.earliest_time') || '',
                latest: this.reportModel.entry.content.get('dispatch.latest_time') || ''
            };
            drilldownFunction(data);
        },

        onPageChange: function() {
            this.updateEventData();
        },

        updateEventData: function() {
            if (this.eventData) {
                var pageSize = this.paginator ? parseInt(this.paginator.settings.get("pageSize"), 10) : 0;
                var page = this.paginator ? parseInt(this.paginator.settings.get("page"), 10) : 0;
                var type = this.settings.get("type");
                var offset = pageSize * page;
                var count = parseInt(this.settings.get("count"), 10) || this.reportDefaults['display.prefs.events.count'];
                var postProcessSearch = _.isFunction(this.manager.query.postProcessResolve)? this.manager.query.postProcessResolve():"";
                if (this._isRealTimeSearch && !postProcessSearch) {
                    // For real-time searches we want the tail of available events, therefore we set a negative offset
                    // based on the currently selected page
                    offset = 0 - count - offset;
                }
                var maxLines = this.settings.get("maxLines").toString();
                var rawDrilldown = this.settings.get("raw.drilldown");
                var listDrilldown = this.settings.get("list.drilldown");
                var tableSortColumn = this.model.get("display.events.table.sortColumn");
                var tableSortDirection = this.model.get("display.events.table.sortDirection");
                var segmentation = null;
                var search = null;

                // if user explicitly sets count over 100, it will display the default
                count = (count > this.options.maxCount || count < 1) ? this.reportDefaults['display.prefs.events.count'] : count;

                // determine segmentation

                if (type === "raw") {
                    segmentation = rawDrilldown;
                } else if (type === "list") {
                    segmentation = listDrilldown;
                }

                // Ensuring segmentation is one of "inner", "outer", or "full".
                // Although "none" is a valid value for segmentation,
                // and segmentation is an optional parameter for the events endpoint,
                // either case causes the Result model to throw errors.
                segmentation = segmentation ? segmentation.toLowerCase() : null;
                switch (segmentation) {
                    case "inner":
                    case "outer":
                    case "full":
                    case "none":
                        break;
                    default:
                        segmentation = "full";
                        break;
                }

                // determine post process search for table sorting

                if ((type === "table") && tableSortColumn) {
                    if (tableSortDirection === "desc") {
                        search = "| sort " + (offset + count) + " - " + tableSortColumn;
                    } else {
                        search = "| sort " + (offset + count) + " " + tableSortColumn;
                    }
                }

                // add in fields required for events viewer
                // note that we store the fields internally as JSON strings, so
                // we need to parse them out.
                var fields = JSON.parse(this.settings.get("fields"));
                fields = _.union(fields, ['_raw', '_time', '_audit', '_decoration', 'eventtype', '_eventtype_color', 'linecount', '_fulllinecount']);
                if (this._isRealTimeSearch) {
                    fields = _.union(fields, ['_serial', 'splunk_server']);
                }

                //set the events.offset property for the sorted table
                //this will make sure that the correct event is fetched on event row expansion
                if (!this._isRealTimeSearch && tableSortColumn) {
                    this.model.set('display.prefs.events.offset', offset);
                }

                // fetch events
                this.eventData.set({
                    offset: offset,
                    count: count,
                    max_lines: maxLines,
                    segmentation: segmentation,
                    search: search,
                    fields: fields
                });

                this.eventData.fetch();
            }
        },

        updateSummaryData: function() {
            if (this.summaryData) {
                this.summaryData.fetch();
            }
        },

        updateSelectedFields: function() {
            var fields = this.settings.get("fields");

            // update selected fields

            if (fields) {
                if (_.isString(fields)) {
                    fields = $.trim(fields);
                    if (fields[0] === '[' && fields.slice(-1) === ']') {
                        // treat fields as JSON if the start and end with a square bracket
                        try {
                            fields = JSON.parse(fields);
                        } catch (e) {
                            // ignore
                        }
                    } else {
                        // Since this is a string, we're going to treat it as a
                        // space separated list of strings, with quoting. This is
                        // similar to what Splunk's 'fields' command takes.
                        fields = _.map(fields.match(fieldSplitterRegex), function(field) {
                            return field.replace(quoteStripperRegex, "");
                        });
                        this.updateFieldSetting(fields);
                    }
                } else {
                    this.updateFieldSetting(fields);
                }
                // convert list of fields to list of name:field pairs for consumption by backbone collection
                fields = _.map(fields, function(field) {
                    return { name: field };
                });

                // handle fields * case
                if ((fields.length === 0) || (fields[0].name === "*")) {
                    fields = _.filter(this.resultModel.fields.toJSON(), function(field) {
                        return (field.name.charAt(0) !== "_");
                    });
                }
            }
            this.selectedFieldsCollection.reset(fields);
            this.updateEventData();
        },

        updateFieldSetting: function(fields) {
            // Update setting with JSON formatted string
            var value = JSON.stringify(fields);
            this.settings.set('fields', value, { silent: true });
            // Manually update the report model, since changes are not synced for silent updates
            this.model.set('display.events.fields', value, { silent: true });
        },

        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            var searchStatus = this._searchStatus || null;
            var eventCount = this._eventCount || 0;
            var hasStatusBuckets = this._statusBuckets === undefined || this._statusBuckets > 0;
            var isSummaryModelReady = (this._isSummaryModelReady === true);
            var isSearchJobModelReady = (this._isSearchJobModelReady === true);
            var isWorkflowActionsCollectionReady = (this._isWorkflowActionsCollectionReady === true);
            var areModelsReady = (isSummaryModelReady && isSearchJobModelReady && isWorkflowActionsCollectionReady);
            var showPager = SplunkUtil.normalizeBoolean(this.settings.get("showPager"));
            var pagerPosition = this.settings.get("pagerPosition");
            var count = parseInt(this.settings.get("count"), 10) || this.reportDefaults['display.prefs.events.count'];

            // if user explicitly sets count over 100, it will display the default
            count = (count > this.options.maxCount || count < 1) ? this.reportDefaults['display.prefs.events.count'] : count;

            // render message
            var message = null;
            if (searchStatus) {
                switch (searchStatus.state) {
                    case "nomanager":
                        message = "no-search";
                        break;
                    case "start":
                        message = "empty";
                        break;
                    case "running":
                        if (eventCount === 0 || !areModelsReady) {
                            message = "waiting";
                        }
                        break;
                    case "cancelled":
                        message = "cancelled";
                        break;
                    case "refresh":
                        message = "refresh";
                        break;
                    case "done":
                        if (eventCount === 0) {
                            message = "no-events";
                        }
                        break;
                    case "error":
                        message = {
                            level: "error",
                            icon: "warning-sign",
                            message: searchStatus.message
                        };
                        break;
                }
            }

            if (message) {
                if (!this.messageElement) {
                    this.messageElement = $('<div class="msg"></div>');
                    // Use same height of message element as table viz
                    this.messageElement.height(306);
                }

                Messages.render(message, this.messageElement);

                this.$el.append(this.messageElement);
            } else {
                if (this.messageElement) {
                    this.messageElement.remove();
                    this.messageElement = null;
                }
            }

            // render eventsViewer
            if (areModelsReady && searchStatus && !message) {
                if (this.eventsViewer) {
                    if (!this._eventsViewerRendered) {
                        this._eventsViewerRendered = true;
                        this.eventsViewer.render();
                        this.$el.append(this.eventsViewer.el);
                    }
                    this.eventsViewer.activate({deep: true}).$el.show();
                }
            } else {
                if (this.eventsViewer) {
                    this.eventsViewer.deactivate({deep: true}).$el.hide();
                }
            }

            // render paginator

            if (areModelsReady && searchStatus && !message && showPager) {
                if (!this.paginator) {
                    this.paginator = new PaginatorView({
                        id: _.uniqueId(this.id + "-paginator")
                    });
                    this.paginator.settings.on("change:page", this.onPageChange, this);
                }

                this.paginator.settings.set({
                    pageSize: count,
                    itemCount: eventCount
                });

                if (pagerPosition === "top") {
                    this.$el.prepend(this.paginator.el);
                } else {
                    this.$el.append(this.paginator.el);
                }
            } else {
                if (this.paginator) {
                    this.paginator.settings.off("change:page", this.onPageChange, this);
                    this.paginator.remove();
                    this.paginator = null;
                }
            }

            this.trigger('rendered', this);

            return this;
        },

        remove: function() {
            if (this.eventsViewer) {
                this.eventsViewer.deactivate({deep: true});
                this.eventsViewer.remove();
                this.eventsViewer = null;
            }

            if (this.paginator) {
                this.paginator.settings.off("change:page", this.onPageChange, this);
                this.paginator.remove();
                this.paginator = null;
            }

            if (this.eventData) {
                this.eventData.off();
                this.eventData.destroy();
                this.eventData = null;
            }

            if (this.summaryData) {
                this.summaryData.off();
                this.summaryData.destroy();
                this.summaryData = null;
            }

            if (this.settings) {
                this.settings.off();
                if (this.settings._sync) {
                    this.settings._sync.destroy();
                }
            }

            if (this.reportModel) {
                this.reportModel.off();
                if (this.reportModel._syncPush) {
                    this.reportModel._syncPush.destroy();
                }
                if (this.reportModel._syncPull) {
                    this.reportModel._syncPull.destroy();
                }
            }

            if (this.model) {
                this.model.off("change", this.onReportChange, this);
            }

            BaseSplunkView.prototype.remove.call(this);
        }

    });

    return EventsViewerView;

});
/**
 * Click event.
 *
 * @name splunkjs.mvc.EventsViewerView#click
 * @event
 * @property {Boolean} click - Fired when the EventsViewer view is clicked.
 */
