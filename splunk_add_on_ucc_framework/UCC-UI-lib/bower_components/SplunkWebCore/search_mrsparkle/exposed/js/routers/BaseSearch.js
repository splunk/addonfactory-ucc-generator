define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/Base',
        'models/Base',
        'models/datasets/TableAST',
        'models/search/Report',
        'models/services/search/jobs/Result',
        'models/services/search/jobs/ResultJsonCols',
        'models/services/search/jobs/ResultJsonRows',
        'models/shared/fetchdata/ResultsFetchData',
        'models/search/Job',
        'models/services/search/jobs/Summary',
        'models/services/search/jobs/Timeline',
        'models/shared/TimeRange',
        'models/services/data/ui/Pref',
        'collections/services/authorization/Roles',
        'collections/search/SelectedFields',
        'collections/services/data/ui/Times',
        'collections/services/data/ui/WorkflowActions',
        'util/general_utils',
        'util/splunkd_utils',
        'util/time',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        Base,
        BaseModel,
        TableASTModel,
        ReportModel,
        ResultModel,
        ResultJsonColsModel,
        ResultJsonRowsModel,
        ResultsFetchDataModel,
        SearchJobModel,
        SummaryModel,
        TimelineModel,
        TimeRangeModel,
        UIPrefsModel,
        RolesCollection,
        SelectedFieldsCollection,
        TimesCollection,
        WorkflowActionsCollection,
        general_utils,
        splunkd_utils,
        time_utils,
        splunkUtil
    ) {
        return Base.extend({
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
                this.fetchUser = true;
                this.fetchAppLocals = true;
                this.loadingMessage = _('Loading...').t();
                
                this.ui_prefs_filter = [
                    "^display\..*"
                ];

                this.job_filter = [
                    "^display\..*",
                    "^dispatch\.earliest_time$",
                    "^dispatch\.latest_time$",
                    "^dispatch\.sample_ratio$"
                ];

                this.report_filter = [
                   "^display\..*",
                   "^dispatch\.earliest_time$",
                   "^dispatch\.latest_time$",
                   "^dispatch\.sample_ratio$",
                   "^search$"
                ];

                this.url_filter = [
                   "^display\..*",
                   "^earliest$",
                   "^latest$",
                   "^q$",
                   "^dispatch\.sample_ratio$"
                ];

                this.user_prefs_filter = [
                    "^default_earliest_time$",
                    "^default_latest_time$"
                ];
                
                //models
                this.model.searchJob = new SearchJobModel({}, {delay: SearchJobModel.DEFAULT_POLLING_INTERVAL, processKeepAlive: true, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});
                this.model.metaDataJob = new SearchJobModel({}, {delay: SearchJobModel.DEFAULT_METADATA_POLLING_INTERVAL, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});
                this.model.report = new ReportModel();
                this.model.reportPristine = new ReportModel();
                this.model.timeRange = new TimeRangeModel();
                this.model.resultJsonCols = new ResultJsonColsModel();
                this.model.resultJsonRows = new ResultJsonRowsModel();
                this.model.result = new ResultModel();
                this.model.metaDataResult = new ResultModel();
                this.model.summary = new SummaryModel();
                this.model.timeline = new TimelineModel();
                this.model.uiPrefs = new UIPrefsModel();
                this.model.tableAST = new TableASTModel();
                
                //collections
                this.collection.times = new TimesCollection();
                this.collection.roles = new RolesCollection();
                this.collection.selectedFields = new SelectedFieldsCollection();
                this.collection.workflowActions = new WorkflowActionsCollection();
                
                //deferreds
                this.deferreds.times = $.Deferred();
                this.deferreds.uiPrefs = $.Deferred();
                this.deferreds.roles = $.Deferred();
                this.deferreds.workflowActions = $.Deferred();
                this.deferreds.preloadReplaced = $.Deferred();
            },
            //Our only Action method
            page: function(locale, app, page) {
                Base.prototype.page.apply(this, arguments);

                this.baseActivateDeferred = $.Deferred();
                this.baseDeactivateDeferred = $.Deferred();
            },
            deactivate: function() {
                var destroyDeferred, pauseDeferred;
                                
                if (!this.model.metaDataJob.isNew()) {
                    this.model.metaDataJob.fetchAbort();
                    destroyDeferred = this.model.metaDataJob.destroy();
                }

                if (!this.model.searchJob.isNew()) {
                    this.model.searchJob.off(null, null, this);
                }
                
                if (this.model.searchJob.canBePausedOnRemove()) {
                    pauseDeferred = this.model.searchJob.pause();
                }
                
                $.when(destroyDeferred, pauseDeferred).always(function() {
                    this.model.classicUrl.clear();
                    this.model.searchJob.clear();
                    this.model.metaDataJob.clear();
                    this.model.report.clear();
                    this.model.reportPristine.clear();
                    this.model.timeRange.clear({setDefaults: true});
                    this.model.resultJsonCols.fetchAbort();
                    this.model.resultJsonCols.clear();
                    this.model.resultJsonRows.fetchAbort();
                    this.model.resultJsonRows.clear();
                    this.model.result.fetchAbort();
                    this.model.result.clear();
                    this.model.metaDataResult.clear();
                    this.model.summary.fetchAbort();
                    this.model.summary.clear();
                    this.model.timeline.fetchAbort();
                    this.model.timeline.clear();
                    this.model.tableAST.fetchAbort();
                    this.model.tableAST.clear();
                    this.collection.selectedFields.off(null, null, this);
                    this.collection.selectedFields.reset();
                    
                    delete this.jobBootstrapErrors;
                    this.baseDeactivateDeferred.resolve();
                }.bind(this));
            },
            // TODO [JCS] Why do we define these functions when they aren't even called from within this class?
            // Is this meant to emulate an interface?
            syncFromClassicURL: function() {
                //override this method to perform business object fetching and layering based on the queryString
                throw new Error("You must override the BaseSearch syncFromClassicURL");
            },
            reportBootstrap: function() {
                //override this method to fetch the Report and perform any layering
                throw new Error("You must override the BaseSearch reportBootstrap");
            },
            jobBootstrap: function(){
                //override this method to fetch the Job and perform any layering
                throw new Error("You must override the BaseSearch jobBootstrap");
            },
            timeRangeBootstrap: function() {
                //override this method to fetch the TimeRange
                throw new Error("You must override the BaseSearch timeRangeBootstrap");
            },
            registerSearchJobFriends: function(options) {
                options = options || {};
                _.defaults(options, {
                    registerResultJsonCols: true,
                    registerResultJsonRows: true,
                    registerSummary: true,
                    registerTimeline: true
                });
                
                var adhocMode = (this.model.report.entry.content.get('display.page.search.mode') || "").toLowerCase(),
                    reportSearch = this.model.searchJob.isReportSearch(),
                    eventsId = this.model.searchJob.entry.links.get(SearchJobModel.EVENTS);

                if (reportSearch) {
                    if (options.registerResultJsonCols) {
                        this.model.searchJob.registerJobProgressLinksChild(SearchJobModel.RESULTS_PREVIEW, this.model.resultJsonCols, this.fetchResultJSONColumn, this);
                    }
                    if (options.registerResultJsonRows) {
                        this.model.searchJob.registerJobProgressLinksChild(SearchJobModel.RESULTS_PREVIEW, this.model.resultJsonRows, this.fetchResultJSONRows, this);
                    }
                }

                if ((reportSearch && this.model.searchJob.entry.content.get('statusBuckets') > 0) || !reportSearch) {
                    if (options.registerSummary) {
                        this.model.searchJob.registerJobProgressLinksChild(SearchJobModel.SUMMARY, this.model.summary, this.fetchSummary, this);
                    }
                    if (options.registerTimeline) {
                        this.model.searchJob.registerJobProgressLinksChild(SearchJobModel.TIMELINE, this.model.timeline, this.fetchTimeline, this);
                    }
    
                    if (eventsId) {
                        this.model.result.set("id", eventsId);
                        this.fetchResult();
                        
                        if (this.model.searchJob.isDone()) {
                            return; //we do not want to bind to the job progress event 
                        }
                        
                        this.model.searchJob.on("jobProgress", function() {
                            var eventSorting = this.model.searchJob.entry.content.get('eventSorting'),
                                resultsLength = this.model.result.results.length,
                                resultsCount = parseInt(this.model.report.entry.content.get('display.prefs.events.count'), 10),
                                eventAvailableCountChanged = _.isNumber(parseInt(this.model.searchJob.entry.content.changedAttributes().eventAvailableCount, 10));

                            if(this.model.searchJob.isRealtime()) {
                                this.fetchResult();
                                return;
                            }
                            
                            if((eventAvailableCountChanged || this.model.searchJob.isDone()) && (eventSorting === "none")) { // | reverse
                                this.fetchResult();
                                return;
                            }
                            
                            if (eventSorting === "desc" && ((resultsLength < resultsCount) || this.model.result.hasPreviewEvents)) {
                                this.fetchResult();
                                return;
                            }
                            
                        }, this);
                    }
                }
            },
            fetchResult: function(options) {
                // Adding tag* is a workaround for SPL-91131 and should be removed when SPL-95605 is done.
                var field_list = _(this.collection.selectedFields.pluck('name')).union(['_raw', '_time', '_audit', '_decoration', 'eventtype', '_eventtype_color', 'linecount', '_fulllinecount', '_icon', 'tag*']),
                    eventAvailableCount = this.model.searchJob.eventAvailableCountSafe(),
                    potentialCount;
                
                if (this.model.searchJob.isRealtime()) {
                    field_list.push('_serial', '_si');
                }
                var defaults = {
                    data: {
                        offset: this.model.report.entry.content.get('display.prefs.events.offset'),
                        count: parseInt(this.model.report.entry.content.get('display.prefs.events.count'), 10),
                        earliest_time: this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        latest_time: this.model.report.entry.content.get('display.events.timelineLatestTime'),
                        segmentation:  ((this.model.report.entry.content.get('display.events.type') === 'table') ? 
                                        'none':
                                        this.model.report.entry.content.get('display.events.list.drilldown')),
                        max_lines: this.model.report.getNearestMaxlines(),
                        field_list: splunkUtil.fieldListToString(field_list),
                        truncation_mode: 'abstract'
                    },
                    parseLite: true
                };
                if (this.model.report.entry.content.get('display.events.type')==='table') {
                    if (!this.model.searchJob.entry.content.get('isRealTimeSearch')) {
                        if (this.model.report.entry.content.get('display.events.table.sortColumn')) {
                            defaults.data.search = this.model.report.getSortingSearch();
                        }
                    } else {
                        this.model.report.entry.content.unset('display.events.table.sortColumn');
                    }
                }
                
                if (this.model.searchJob.entry.content.get('isRealTimeSearch')) {
                    defaults.data.offset = -(defaults.data.offset) - defaults.data.count;
                    potentialCount = defaults.data.offset + eventAvailableCount + defaults.data.count;
                    defaults.data.count = (potentialCount > defaults.data.count) ? defaults.data.count : potentialCount;
                }
                
                $.extend(true, defaults, options);

                this.model.result.safeFetch(defaults);
            },
            fetchResultJSONColumn: function() {
                if (this.model.searchJob.entry.content.get('isPreviewEnabled') || this.model.searchJob.isDone()) {
                    this.model.resultJsonCols.safeFetch({
                        data: {
                            count: 1000,
                            output_mode: 'json_cols'
                        }
                    });
                }
            },
            fetchResultJSONRows: function(options) {
                if (this.model.searchJob.entry.content.get('isPreviewEnabled') || this.model.searchJob.isDone()) {
                    var fetchDataModel = new ResultsFetchDataModel({
                        sortKey: this.model.report.entry.content.get("display.statistics.sortColumn"),
                        sortDirection: this.model.report.entry.content.get("display.statistics.sortDirection")
                    });
    
                    var data = $.extend(
                        fetchDataModel.toJSON(),
                        {
                            count: this.model.report.entry.content.get("display.prefs.statistics.count"),
                            offset: this.model.report.entry.content.get("display.prefs.statistics.offset"),
                            show_metadata: true
                        }
                    );
                    
                    $.extend(true, data, options);
    
                    this.model.resultJsonRows.safeFetch({
                        data: data
                    });
                }
            },
            fetchSummary: function() {
                this.model.summary.safeFetch({
                    data: {
                        min_freq: 0,
                        earliest_time: this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        latest_time: this.model.report.entry.content.get('display.events.timelineLatestTime')
                    }
                });
            },
            fetchTimeline: function() {
                var earliest_time = this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                    latest_time = this.model.report.entry.content.get('display.events.timelineLatestTime');
                if (earliest_time && latest_time) {
                    this.model.timeline.safeFetch({
                        data: {
                            earliest_time: earliest_time,
                            latest_time: latest_time
                        }
                    });
                } else if (this.model.timeline.buckets.length > 0) {
                    this.model.timeline.buckets.reset();
                }
            },
            registerMetaDataJobFriends: function() {
                this.model.metaDataJob.registerJobProgressLinksChild(SearchJobModel.RESULTS_PREVIEW, this.model.metaDataResult, this.fetchMetaDataResult, this);
            },
            fetchMetaDataResult: function() {
                var resultPreviewCount = this.model.metaDataJob.entry.content.get("resultPreviewCount");
                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                    this.model.metaDataResult.safeFetch({
                        data: {
                            count: 1,
                            search: "| stats sum(totalCount) as cnt, min(firstTime) as min, max(lastTime) as max"
                        }
                    });
                }
            },
            startMetaDataSearch: function(deferred) {
                var search = '| metadata type=sourcetypes | search totalCount > 0';

                this.model.metaDataJob.save({}, {
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        search: search,
                        preview: "true",
                        earliest_time: "rt",
                        latest_time: "rt",
                        auto_cancel: SearchJobModel.DEFAULT_AUTO_CANCEL,
                        max_count: 100000,
                        provenance: this.getJobProvenance()
                    },
                    success: function(model, response) {
                        deferred.resolve();
                        this.registerMetaDataJobFriends();
                        this.model.metaDataJob.startPolling();
                    }.bind(this),
                    error: function(model, response) {
                        deferred.resolve();
                    }.bind(this)
                });
            },
            
            /**
             * Returns the value that should assigned to the provenance param when 
             * creating a job from startNew search. Override this method to set provenance.
             * 
             * @return {string}
             */
            getJobProvenance: function() {
                return undefined;
            },
            
            populateClassicUrl: function(changedAttrs, options) {
                var changedAttrsModel, urlFilteredAttrs;
                options = options || {};
                options.forceAttrs = options.forceAttrs || {};
                
                if (changedAttrs && !_.isEmpty(changedAttrs)){
                    changedAttrs = $.extend(true, {}, changedAttrs);
                    changedAttrsModel = new BaseModel(changedAttrs);
                    urlFilteredAttrs = changedAttrsModel.filterByWildcards(this.report_filter, {allowEmpty: true});

                    // this is set by the map visualization but is not intended to be permalinked
                    if(urlFilteredAttrs.hasOwnProperty('display.visualizations.mapping.data.bounds')) {
                        urlFilteredAttrs['display.visualizations.mapping.data.bounds'] = undefined;
                    }
                    //we have to mediate legacy attributes in the report back to the URL
                    this.mediateReportAttrsToClassicUrl(urlFilteredAttrs);
                    
                    //merge in the forced attributes from options 
                    _.extend(urlFilteredAttrs, options.forceAttrs);

                    if (!_.isEmpty(urlFilteredAttrs)){
                        var search = this.model.report.entry.content.get('search');
                        if (options.forceTrigger || (search && (
                                _.has(urlFilteredAttrs,"q") || _.has(urlFilteredAttrs,"earliest") ||
                                _.has(urlFilteredAttrs,"latest") || _.has(urlFilteredAttrs,"display.page.search.mode") ||
                                _.has(urlFilteredAttrs,"dispatch.sample_ratio")
                            ))
                        ){
                            //unset the sid and oneTimeUserAttrs so that we get a new one when the page loads
                            urlFilteredAttrs['display.events.timelineEarliestTime'] = undefined;
                            urlFilteredAttrs['display.events.timelineLatestTime'] = undefined;
                            urlFilteredAttrs['display.prefs.events.offset'] = undefined;
                            urlFilteredAttrs['display.prefs.statistics.offset'] = undefined;
                            urlFilteredAttrs['display.statistics.sortColumn'] = undefined;
                            urlFilteredAttrs['display.statistics.sortDirection'] = undefined;
                            urlFilteredAttrs['display.events.table.sortColumn'] = undefined;
                            urlFilteredAttrs['display.events.table.sortDirection'] = undefined;
                            urlFilteredAttrs.sid = options.forceAttrs.sid || undefined;
                            urlFilteredAttrs.q = splunkUtil.addLeadingSearchCommand(search);

                            //this means we have changed the search, so push a back button state
                            this.model.classicUrl.save(urlFilteredAttrs, {
                                success: function(model, response){
                                    if (!this.model.classicUrl.hasChanged("q")){
                                        this.model.report.entry.content.trigger("enableSearchInput"); 
                                    }
                                }.bind(this),
                                trigger: true
                            });
                        } else {
                            //update the current back button state
                            this.model.classicUrl.save(urlFilteredAttrs, {
                                replaceState: true
                            });
                        }
                    }
                }
            },
            populateJob: function(jobPopulationDeferred, changedAttrs) {
                var changedAttrsModel, filteredAttrs, changedAttrsCopy;

                if (changedAttrs && !_.isEmpty(changedAttrs) &&
                        !this.model.searchJob.isNew() &&
                        this.model.searchJob.entry.acl.canWrite()){
                    changedAttrsCopy = $.extend(true, {}, changedAttrs);
                    changedAttrsModel = new BaseModel(changedAttrsCopy);
                    filteredAttrs = changedAttrsModel.filterByWildcards(this.report_filter, {allowEmpty: true});
                    if (!(
                            _.has(filteredAttrs,"search") || _.has(filteredAttrs,"dispatch.earliest_time") ||
                            _.has(filteredAttrs,"dispatch.latest_time") || _.has(filteredAttrs,"display.page.search.mode") ||
                            _.has(filteredAttrs,"dispatch.sample_ratio")
                            
                    )){
                        this.deleteOneTimeUseAttrs(filteredAttrs);
                        //don't store the pattern sensitivity with the job
                        delete filteredAttrs["display.page.search.patterns.sensitivity"];
                        if (!_.isEmpty(filteredAttrs)){
                            this.ensureTimeRangeFromReportInAttrs(filteredAttrs);
                            this.model.searchJob.entry.content.custom.set(filteredAttrs);
                            this.model.searchJob.save({}, {
                                success: function(model, response){
                                    jobPopulationDeferred.resolve();
                                },
                                error: function(model, response){
                                    jobPopulationDeferred.resolve();
                                }
                            });
                            return;
                        }
                    }
                }
                jobPopulationDeferred.resolve();
            },
            populateUIPrefs: function(uiPrefsPopulationDeferred, changedAttrs) {
                var data = {},
                    changedAttrsModel, filteredAttrs, changedAttrsCopy;

                if (changedAttrs && !_.isEmpty(changedAttrs)) {
                    changedAttrsCopy = $.extend(true, {}, changedAttrs);
                    changedAttrsModel = new BaseModel(changedAttrsCopy);
                    filteredAttrs = changedAttrsModel.filterByWildcards(this.ui_prefs_filter, {allowEmpty: true});
                    this.deleteOneTimeUseAttrs(filteredAttrs);
                    
                    if (!_.isEmpty(filteredAttrs)){
                        if (this.model.uiPrefs.isNew()) {
                            data = {
                                app: this.model.application.get("app"),
                                owner: this.model.application.get("owner")
                            };
                        }

                        this.model.uiPrefs.entry.content.set(filteredAttrs);
                        this.model.uiPrefs.save({}, {
                            data: data,
                            success: function(model, response) {
                                uiPrefsPopulationDeferred.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                uiPrefsPopulationDeferred.resolve();
                            }.bind(this)
                        });
                        return;
                    }
                }
                uiPrefsPopulationDeferred.resolve();
            },
            populateSelectedFieldsFromReport: function() {
                var models = [];
                //turn off the listener so that we don't have a circular reference
                this.collection.selectedFields.off('add remove reset', this.populateReportFromSelectedFields);

                //set fields into a collection (facilitates mgt)
                _.each(this.model.report.entry.content.toObject('display.events.fields') || [], function(value) {
                    models.push({name: value});
                });

                this.collection.selectedFields.reset(models);

                //turn the listener so that we don't have a circular reference
                this.collection.selectedFields.on('add remove reset', this.populateReportFromSelectedFields, this);
            },
            populateReportFromSelectedFields: function() {
                this.model.report.entry.content.set('display.events.fields', this.collection.selectedFields.valuesToJSONString());
            },
            populateClassicUrlFromSearchJob: function() {
                var attrsFromJob = this.model.searchJob.entry.content.custom.filterByWildcards(this.job_filter);

                attrsFromJob["search"] = this.model.searchJob.getSearch();
                attrsFromJob["sid"] = this.model.searchJob.entry.content.get('sid');
                attrsFromJob["dispatch.earliest_time"] = this.model.searchJob.getDispatchEarliestTimeOrAllTime();
                attrsFromJob["dispatch.latest_time"] = this.model.searchJob.getDispatchLatestTimeOrAllTime();
                attrsFromJob["display.page.search.mode"] = this.model.searchJob.getAdhocSearchMode();
                attrsFromJob["dispatch.sample_ratio"] = this.model.searchJob.getSampleRatio();
                this.mediateReportAttrsToClassicUrl(attrsFromJob);

                this.model.classicUrl.save(attrsFromJob, {
                    replaceState: true
                });
            },
            deleteOneTimeUseAttrs: function(attrs) {
                delete attrs["display.prefs.events.offset"];
                delete attrs["display.prefs.statistics.offset"];
                delete attrs["display.events.timelineEarliestTime"];
                delete attrs["display.events.timelineLatestTime"];
                delete attrs['display.statistics.sortColumn'];
                delete attrs['display.statistics.sortDirection'];
                delete attrs['display.statistics.show'];
                delete attrs['display.events.table.sortColumn'];
                delete attrs['display.events.table.sortDirection'];
                delete attrs['display.visualizations.show'];
                // this is set by the map visualization but is not intended to be persisted
                delete attrs['display.visualizations.mapping.data.bounds'];
            },
            ensureTimeRangeFromReportInAttrs: function(attrs) {
                if ((attrs['dispatch.earliest_time'] !== void(0)) && (attrs['dispatch.latest_time'] === void(0))) {
                    attrs['dispatch.latest_time'] = this.model.report.entry.content.get("dispatch.latest_time");
                } else if ((attrs['dispatch.earliest_time'] === void(0)) && (attrs['dispatch.latest_time'] !== void(0))) {
                    attrs['dispatch.earliest_time'] = this.model.report.entry.content.get("dispatch.earliest_time");
                }
            },
            mediateReportAttrsToClassicUrl: function(attrs) {
                this.ensureTimeRangeFromReportInAttrs(attrs);
                
                general_utils.transferKey(attrs, 'search', 'q');
                general_utils.transferKey(attrs, 'dispatch.earliest_time', 'earliest');
                general_utils.transferKey(attrs, 'dispatch.latest_time', 'latest');
                
                if (attrs.q) {
                    attrs.q = splunkUtil.addLeadingSearchCommand(attrs.q);
                }
            },
            mediateClassicUrlAttrsToReport: function(attrs) {
                general_utils.transferKey(attrs, 'q', 'search');
                general_utils.transferKey(attrs, 'earliest', 'dispatch.earliest_time');
                general_utils.transferKey(attrs, 'latest', 'dispatch.latest_time');
                
                if ((attrs['dispatch.earliest_time'] !== void(0)) && (attrs['dispatch.latest_time'] === void(0))) {
                    if (time_utils.isRealtime(attrs['dispatch.earliest_time'])) {
                        attrs['dispatch.latest_time'] = "rt";
                    } else {
                        attrs['dispatch.latest_time'] = "";
                    }
                } else if ((attrs['dispatch.earliest_time'] === void(0)) && (attrs['dispatch.latest_time'] !== void(0))) {
                    if (time_utils.isRealtime(attrs['dispatch.latest_time'])) {
                        attrs['dispatch.earliest_time'] = "rt";
                    } else {
                        attrs['dispatch.earliest_time'] = "";
                    }
                }
                                
                if (attrs.search) {
                    attrs.search = splunkUtil.stripLeadingSearchCommand(attrs.search);
                }
            },
            mediateUserPrefsAttrs: function(attrs) {
                general_utils.transferKey(attrs, 'default_earliest_time', 'dispatch.earliest_time');
                general_utils.transferKey(attrs, 'default_latest_time', 'dispatch.latest_time');
            },
            applyModelFullPathToName: function(model, name) {
                //check to see if name is NOT the path to the entity
                if (!/^\/services.*/i.test(name)){
                    //we need to build the path to the entity from the SDK
                    name = ReportModel.buildId(name, this.model.application.get('app'), this.model.application.get('owner'));
                }
                return name;
            },
            close: function(options) {
                options = options || {};
                _.defaults(options, {
                    replaceState: false
                });
                this.model.classicUrl.clear();
                this.model.classicUrl.save({}, {replaceState: options.replaceState});
                this.page(this.model.application.get('locale'),
                    this.model.application.get('app'),
                    this.model.application.get('page')); 
            }
        });
    }
);
