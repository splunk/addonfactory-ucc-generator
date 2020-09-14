define(
    [
        'jquery',
        'underscore',
        'models/services/saved/Search',
        'models/services/data/ui/Viewstate',
        'collections/search/Jobs',
        'collections/services/saved/searches/Histories',
        'util/time',
        'util/splunkd_utils',
        'util/general_utils',
        'splunk.util',
        'splunk.i18n',
        'uri/route',
        'util/math_utils'
    ],
    function($, _, SavedSearch, Viewstate, JobsCollection, HistoriesCollection, time_utils, splunkd_utils, general_utils, splunkUtil, i18n, route, math_utils) {
        /**
         * @constructor
         * @memberOf models
         * @name Report
         * @extends models.SavedSearch
         */
        var ReportModel = SavedSearch.extend({
            initialize: function() {
                SavedSearch.prototype.initialize.apply(this, arguments);

                //associated
                this.jobs = new JobsCollection();
                this.associated.jobs = this.jobs;
            },
            sync: function(method, model, options) {
                options = options || {};
                _.defaults(options, {migrateViewState: true});
                
                if (!options.migrateViewState || method !== 'read') {
                    return SavedSearch.prototype.sync.apply(this, arguments);
                }
                
                var deferredResponse = $.Deferred(),
                    viewstateDeferred = $.Deferred(),
                    savedSearchProxy = new SavedSearch({id: this.id}),
                    bbXHR;
                
                model.trigger('request', model, deferredResponse, options);

                bbXHR = savedSearchProxy.fetch($.extend(true, {}, options, {
                    success: function(model, savedSearchResponse) {
                        this.setFromSplunkD(savedSearchProxy.toSplunkD());
                        
                        var vsid = this.entry.content.get("vsid"),
                            displayview = this.entry.content.get("displayview"),
                            hasBeenMigrated = splunkUtil.normalizeBoolean(this.entry.content.get("display.general.migratedFromViewState")),
                            name, viewstate;
                        
                        if (vsid && displayview && !hasBeenMigrated) {
                            name = /.*:/.test(vsid) ? vsid : (displayview + ":" + vsid);
                            viewstate = new Viewstate();
                            
                            viewstate.fetch({
                                url: splunkd_utils.fullpath(
                                    viewstate.url + "/" + encodeURIComponent(name),
                                    {
                                        app: options.data.app,
                                        owner: options.data.owner                               
                                    }
                                 ),
                                 success: function(model, response) {
                                     var viewstateConversionAttrs = viewstate.convertToReportPoperties();
                                     viewstateConversionAttrs["display.general.migratedFromViewState"] = "1";
                                     
                                     //layer in the viewstate properties
                                     this.entry.content.set(viewstateConversionAttrs);
                                     
                                     options.success(savedSearchResponse);
                                     viewstateDeferred.resolve();
                                 }.bind(this),
                                 error: function(model, response) {
                                     //the viewstate could not be found. Party on, but make sure if they save we never lookup the viewstate again.
                                     this.entry.content.set("display.general.migratedFromViewState", "1");
                                     
                                     options.success(savedSearchResponse);
                                     viewstateDeferred.resolve();
                                 }.bind(this)
                            });
                        } else {
                            options.success(savedSearchResponse);
                            viewstateDeferred.resolve();
                        }                        
                    }.bind(this),
                    error: function(model, savedSearchResponse) {
                        options.error(savedSearchResponse);                       
                    }.bind(this)
                }));
                
                $.when(viewstateDeferred).then(function() {
                    bbXHR.done(function(){
                        deferredResponse.resolve.apply(deferredResponse, arguments);
                    }.bind(this));
                }.bind(this));
                
                bbXHR.fail(function() {
                    deferredResponse.reject.apply(deferredResponse, arguments);
                }.bind(this));
                
                return deferredResponse.promise();                
            },
            parse: function(response) {
                var parsedResponse = SavedSearch.prototype.parse.apply(this, arguments),
                    contentModel = this.entry.content;

                // SPL-78883 unfortunately due to some case inconsistencies there are some reports in the wild with
                // display.visualizations.type "singleValue" instead of "singlevalue"
                // to deal with this, normalize to all lower case here
                if(contentModel.has('display.visualizations.type')) {
                    contentModel.set({
                        'display.visualizations.type': contentModel.get('display.visualizations.type').toLowerCase()
                    });
                }
                return parsedResponse;
            },
            fetchJobs: function(options) {
                var label = this.entry.get('name');
                if (!label) {
                    throw "Report must have a name to associate it with Jobs";
                }

                options = options || {};
                options.data = options.data || {};
                options.data.app = this.entry.acl.get('app');
                options.data.owner = this.entry.acl.get('owner');
                options.data.label = label;

                return this.jobs.fetchNonAutoSummaryJobs(options);
            },
            /**
             * Fetch historic jobs, and return a deferred object,
             * which will be resolved later with the latest scheduled job id if it exists
             */
            getLatestHistoricJobId: function() {
                var historiesCollection = new HistoriesCollection(),
                    deferred = $.Deferred();
                historiesCollection.url = splunkd_utils.fullpath(this.entry.links.get('history'));
                historiesCollection.fetch({
                    data: {
                        search: "isScheduled=true",
                        sort_key: "start",
                        sort_dir: "desc"
                    },
                    success: function() {
                        if (historiesCollection.length > 0) {
                            deferred.resolve(historiesCollection.at(0).entry.get('name'));
                        } else {
                            deferred.resolve();
                        }
                    }.bind(this),
                    error: function() {
                        deferred.resolve();
                    }.bind(this)
                });
                return deferred.promise();
            },
            // view in which to open the report to edit the search
            openInView: function (userModel) {
                if (this.isPivotReport()) {
                    if (userModel && !userModel.canPivot()) {
                        return 'search';
                    }
                    return 'pivot';
                } else {
                    return 'search';
                }
            },

                /**
                 * Sets the visualization and statistics .show values that will persist to the backend
                 * from the compound key 'display.general.reports.show
                 * 'chartandtable' : visualizations = 1, statistics = 1,
                 * 'chart; : visualizations = 1, statistics = 0,
                 * 'table : visualizations = 0, statistics = 1
                 * This must be called when using display.general.reports.show in memory attr
                 * @memberOf models#Report
                 */
            setVizType: function(){
                var displayType = this.entry.content.get('display.general.reports.show');
                if (displayType === 'chart'){
                    this.entry.content.set({'display.visualizations.show': '1'});
                    this.entry.content.set({'display.statistics.show': '0'});

                } else if (displayType === 'table'){
                    this.entry.content.set({'display.visualizations.show': '0'});
                    this.entry.content.set({'display.statistics.show': '1'});

                } else {
                    this.entry.content.set({'display.visualizations.show': '1'});
                    this.entry.content.set({'display.statistics.show': '1'});
                }
            },

                /**
                 * Called to set the in memory attribute display.general.reports.show based on the backend
                 * values for display.statistics.show and display.visualizations.show
                 * @memberOf models#Report
                 */
            setInmemVizType: function(){
                var viz = splunkUtil.normalizeBoolean(this.entry.content.get('display.visualizations.show'));
                var stats = splunkUtil.normalizeBoolean(this.entry.content.get('display.statistics.show'));

                if (viz && stats){
                    this.entry.content.set({'display.general.reports.show': 'chartandtable'});

                } else if (viz){
                    this.entry.content.set({'display.general.reports.show': 'chart'});

                } else {
                    this.entry.content.set({'display.general.reports.show': 'table'});
                }
            },

            isAlert: function () {
                var is_scheduled = this.entry.content.get('is_scheduled'),
                    alert_type = this.entry.content.get('alert_type'),
                    alert_track = this.entry.content.get('alert.track'),
                    actions = this.entry.content.get('actions'),
                    isRealTime = this.isRealTime();

                return is_scheduled &&
                        (alert_type !== 'always' ||
                            alert_track ||
                            (isRealTime && actions)
                        );
            },
            isRealTime: function() {
                var isEarliestRealtime = time_utils.isRealtime(this.entry.content.get('dispatch.earliest_time')),
                    isLatestRealtime = time_utils.isRealtime(this.entry.content.get('dispatch.latest_time'));

                return (isEarliestRealtime && isLatestRealtime);
            },
            // see documentation of isValidPivotSearch, this is not an exhaustive check, just a quick guess.
            isPivotReport: function() {
                return general_utils.isValidPivotSearch(this.entry.content.get('search'));
            },
            isSampled: function() {
                return this.entry.content.get('dispatch.sample_ratio') > '1';
            },
            stripAlertAttributes: function(options) {
                return this.entry.content.set({
                        'alert.track': 0,
                        alert_type: 'always',
                        is_scheduled: 0,
                        actions: ''
                    }, options);
            },
            stripReportAttributesToSaveAsAlert: function(options) {
                return this.entry.content.set({
                    auto_summarize: false,
                    cron_schedule: ''
                },options);
            },
            setTimeRangeWarnings: function(reportPristine) {
                var earliest = this.entry.content.get("dispatch.earliest_time"),
                    latest = this.entry.content.get("dispatch.latest_time"),
                    messages = [],
                    pristineEarliest, pristineLatest;

                if ((!time_utils.isEmpty(earliest) && time_utils.isAbsolute(earliest)) ||
                        (!time_utils.isEmpty(latest) && time_utils.isAbsolute(latest))) {
                    messages.push(
                       splunkd_utils.createMessageObject(
                            splunkd_utils.WARNING,
                            _("Your report has an absolute time range.").t()
                        )
                    );
                }

                if (reportPristine) {
                    if (reportPristine.isAlert()) {
                        pristineEarliest = reportPristine.entry.content.get("dispatch.earliest_time");
                        pristineLatest = reportPristine.entry.content.get("dispatch.latest_time");

                        if ((earliest !== pristineEarliest) || (latest !== pristineLatest)) {
                            this.entry.content.set({
                                "dispatch.earliest_time": pristineEarliest,
                                "dispatch.latest_time": pristineLatest
                            });

                             // This attribute will be read and removed by SuccessWithAdditionalSettings.js which will show another time range warning message. 
                             // Yes we are showing the same warning twice.   
                            this.set({"did_revert_time_range": true}); 

                            messages.push(
                               splunkd_utils.createMessageObject(
                                    splunkd_utils.WARNING,
                                    _("Your changes to the time range of this alert will not be saved.").t()
                                )
                            );
                        }
                    } else if (!reportPristine.isRealTime() && (reportPristine.entry.content.get('is_scheduled')) && this.isRealTime()) {
                        this.entry.content.set({
                            "is_scheduled": false
                        });

                        messages.push(
                           splunkd_utils.createMessageObject(
                                splunkd_utils.WARNING,
                                _("Saving a scheduled report as a real-time report will remove the schedule.").t()
                            )
                        );
                    }
                }

                if (messages.length) {
                    this.error.set({
                        messages: messages
                    });
                }
            },
            setAccelerationWarning: function(canSummarize, reportPristine) {
                var isCurrentModeVerbose = this.entry.content.get('display.page.search.mode') === splunkd_utils.VERBOSE,
                    messages = [];
                if (!canSummarize){
                    messages.push(
                        splunkd_utils.createMessageObject(
                            splunkd_utils.WARNING,
                            _("This report cannot be accelerated. Acceleration will be disabled.").t()
                        )
                    );
                    this.entry.content.set('auto_summarize', false);
                }
                else if (isCurrentModeVerbose && (_.isUndefined(reportPristine) || reportPristine.entry.content.get('display.page.search.mode') === splunkd_utils.VERBOSE)) {
                    messages.push(
                        splunkd_utils.createMessageObject(
                            splunkd_utils.WARNING,
                            _("A report running in verbose mode cannot be accelerated. Your search mode will be saved as Smart Mode.").t()
                        )
                    );
                    this.entry.content.set('display.page.search.mode', splunkd_utils.SMART);
                }
                else if (isCurrentModeVerbose && !_.isUndefined(reportPristine)) {
                    messages.push(
                        splunkd_utils.createMessageObject(
                            splunkd_utils.WARNING,
                            _("A report running in verbose mode cannot be accelerated. Your search mode will not be saved.").t()
                        )
                    );
                    this.entry.content.set('display.page.search.mode', reportPristine.entry.content.get('display.page.search.mode'));
                }
                if (messages.length) {
                    this.trigger('serverValidated', false, this, messages);
                    this.error.set({
                        messages: messages
                    });
                }
            },
            getScheduleWarning: function(reportPristine) {
                var isScheduled = reportPristine.entry.content.get('is_scheduled'),
                    dispatchAs = reportPristine.getDispatchAs(),
                    displayTimeRangePicker = splunkUtil.normalizeBoolean(reportPristine.entry.content.get('display.general.timeRangePicker.show'));

                if (!isScheduled) {
                    if (displayTimeRangePicker && dispatchAs === 'user') {
                        return {
                            type: splunkd_utils.WARNING,
                            html: splunkUtil.sprintf(_("Scheduling this report: \
                                %(openUl)s %(openLi)s Causes its permissions to change from Run as User to Run as Owner. %(closeLi)s \
                                %(openLi)s Results in removal of the time range picker from the report display. %(closeLi)s %(closeUl)s").t(), {
                                openUl: '<ul>',
                                closeUl: '</ul>',
                                openLi: '<li>',
                                closeLi: '</li>'
                            })
                        };
                    } else if (displayTimeRangePicker) {
                        return {
                            type: splunkd_utils.WARNING,
                            html: _("Scheduling this report results in removal of the time picker from the report display.").t()
                        };
                    } else if (dispatchAs === 'user') {
                        return {
                            type: splunkd_utils.WARNING,
                            html: _("Scheduling this report causes its permissions to change from Run as User to Run as Owner.").t()
                        };
                    }
                }
            },
            setSearchTab: function(options) {
                options = options || {};
                                                                                
                var tab = this.entry.content.get('display.page.search.tab') || 'statistics',
                    type = this.entry.content.get('display.general.type'),
                    searchSpecificDefaults = options.reportSearch ? this.getSearchSpecificDefaults(options.reportSearch) : {};

                if (tab === 'patterns') {
                    if (options.canPatternDetect && !options.isUneventfulReportSearch) {
                        return;
                    }
                    tab = 'events';
                }
                
                if (type && (tab !== type)) {
                    tab = type;
                }
                    
                if (tab === 'events') {
                    if (options.isTransforming) {
                        tab = searchSpecificDefaults['display.page.search.tab'] || 'statistics';
                    }
                } else if ((tab === 'statistics') || (tab === 'visualizations')) {
                    if (!options.isTransforming){
                        tab = 'events';
                    }
                }
                
                this.entry.content.set({'display.page.search.tab': tab}, options);
            },
            setDisplayType: function(isTransforming, reportSearch, options) {
                var type = this.entry.content.get('display.general.type') || 'statistics',
                    searchSpecificDefaults = reportSearch ? this.getSearchSpecificDefaults(reportSearch) : {};

                if (type === 'events') {
                    if (isTransforming) {
                        type = searchSpecificDefaults['display.general.type'] || 'statistics';
                    }
                } else if ((type === 'statistics') || (type === 'visualizations')) {
                    if (!isTransforming){
                        type = 'events';
                    }
                }
                this.entry.content.set({'display.general.type': type}, options);
            },
            getSearchSpecificDefaults: function(reportSearch) {
                // if the search string is using 'geostats', the report should show as a map
                if (/(^geostats)|([|\s]geostats\s)/.test(reportSearch || '')) {
                    return ({
                        'display.general.type': 'visualizations',
                        'display.page.search.tab': 'visualizations',
                        'display.visualizations.type': 'mapping',
                        'display.visualizations.mapping.type': 'marker'
                    });
                }
                // if the search string is using 'geom', the report should show as a choropleth map
                if ((/\|\s*geom\s+/).test(reportSearch || '')) {
                    return ({
                        'display.general.type': 'visualizations',
                        'display.page.search.tab': 'visualizations',
                        'display.visualizations.type': 'mapping',
                        'display.visualizations.mapping.type': 'choropleth'
                    });
                }
                return {};
            },
            isDirty: function(otherReport, whitelist) {
                whitelist = whitelist || ReportModel.DIRTY_WHITELIST;
                return SavedSearch.prototype.isDirty.call(this, otherReport, whitelist);
            },
            canDelete: function() {
                return this.entry.links.get("remove") ? true : false;
            },
            canWrite: function(canScheduleSearch, canRTSearch) {
                return this.entry.acl.get('can_write') &&
                        !(this.entry.content.get('is_scheduled') && !canScheduleSearch) &&
                        !(this.isRealTime() && !canRTSearch);
            },
            canClone: function(canScheduleSearch, canRTSearch) {
                return !(this.entry.content.get('is_scheduled') && !canScheduleSearch) &&
                        !(this.isRealTime() && !canRTSearch);
            },
            canEmbed: function(canScheduleSearch, canEmbed) {
                return this.entry.acl.get('can_write') && canScheduleSearch && !this.isRealTime() && canEmbed;
            },
            canMove: function() {
                return this.entry.links.has("move");
            },
            canAdvancedEdit: function() {
                return this.entry.acl.get('can_write');
            },
            getStringOfActions: function() {
                var actionArray = [];

                if (this.entry.content.get("action.email") || this.entry.content.get("action.script")) {
                    var actions = this.entry.content.get("actions");

                    if (actions.search('email') != -1) {
                        actionArray.push(_('Send Email').t());
                    }
                    if (actions.search('script') != -1) {
                        actionArray.push(_('Run a Script').t());
                    }
                }

                if (this.entry.content.get('alert.track')) {
                    actionArray.push(_('List in Triggered Alerts').t());
                }

                return actionArray.join(_(', ').t());
            },
            routeToViewReport: function(root, locale, app, sid) {
                var data = {s: this.id};
                
                if (this.isAlert()) {
                    return route.alert(root, locale, app, {data: data});
                }
                if (sid) {
                    data.sid = sid;
                }
                return route.report(root, locale, app, {data: data});
            },
            getNearestMaxlines: function() {
                var maxLines = parseInt(this.entry.content.get('display.events.maxLines'), 10);
                if (isNaN(maxLines)) {
                    maxLines = 5;
                }
                return "" + math_utils.nearestMatchAndIndexInArray(maxLines, [5, 10, 20, 50, 100, 200, 0]).value;
            },
            getSortingSearch: function() {
                var search,
                    content = this.entry.content,
                    offset = content.get('display.prefs.events.offset'),
                    count = content.get('display.prefs.events.count'),
                    sortColumn = content.get('display.events.table.sortColumn');
                    
                if (sortColumn && !_.isUndefined(offset) && !_.isUndefined(count)) {
                    search = ('| sort ' + (parseInt(offset, 10) + parseInt(count, 10)) + ((content.get('display.events.table.sortDirection') === 'desc') ? ' - ': ' ') + sortColumn);
                }
                return search;
            },
            getDisplayEventsFields: function(options) {
                options || (options={});
                var object,
                    fields = [];
                _.each(this.entry.content.toObject('display.events.fields') || [], function(value) {
                    if (options.key) {
                        object = {};
                        object[options.key] = value;
                        fields.push(object);
                    } else {
                        fields.push(value);
                    }
                });
                
                return fields;
            },
            getDispatchAs: function() {
                if (this.entry.acl.get('sharing') === splunkd_utils.USER) {
                    return 'owner';
                } else {
                    return this.entry.content.get('dispatchAs');
                }
            },
            syncDrilldownMode: function() {
                // Keep the list/raw drilldown modes in sync
                var displayType = this.entry.content.get('display.events.type'),
                    listDrilldown = this.entry.content.get('display.events.list.drilldown'),
                    rawDrilldown = this.entry.content.get('display.events.raw.drilldown');
                if (displayType === 'list') {
                    this.entry.content.set('display.events.raw.drilldown', listDrilldown);
                } else if (displayType === 'raw') {
                    this.entry.content.set('display.events.list.drilldown', rawDrilldown);
                }
            },
            syncCustomSampleRatio: function() {
                if (this.isSampled()) {
                    var sampleRatio = this.entry.content.get('dispatch.sample_ratio');
                    if ((_.indexOf(ReportModel.PRESET_SAMPLE_RATIOS, sampleRatio) === -1)) {
                        this.entry.content.set('display.prefs.customSampleRatio', sampleRatio);
                    }
                }
            },
            //SPL-106268: Disable sampling when time range is real-time.
            adjustSampleRatio: function() {
                if (this.isSampled() && this.isRealTime()) {
                    this.entry.content.set('dispatch.sample_ratio', '1');
                } 
            }
        },
        {
            DOCUMENT_TYPES: {
                ALERT: 'alert',
                PIVOT_REPORT: 'pivot-report',
                REPORT: 'report'
            },
            DIRTY_WHITELIST: [
                '^dispatch\.earliest_time$',
                '^dispatch\.latest_time$',
                '^dispatch\.sample_ratio',
                '^display\.*$',
                '^search$'
            ],
            PRESET_SAMPLE_RATIOS: ["1", "10", "100", "1000", "10000", "100000"],
            ARCHIVE_KICKOFF_SEARCH_ID: 'Bucket Copy Trigger'
        });
        return ReportModel;
    }
);