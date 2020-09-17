define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/BootstrapSearch',
        'views/report/Master',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/reportcontrols/dialogs/schedule_dialog/Master',
        'views/shared/reportcontrols/dialogs/AccelerationDialog',
        'views/shared/reportcontrols/dialogs/embed_dialog/Master',
        'models/search/Report',
        'models/search/DispatchJob',
        'util/splunkd_utils',
        'util/time',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        BootstrapSearch,
        ReportView,
        PermissionsDialog,
        ScheduleDialog,
        AccelerationDialog,
        EmbedDialog,
        ReportModel,
        SearchDispatchJobModel,
        splunkd_utils,
        time_utils,
        splunkUtils
    ) {
        return BootstrapSearch.extend({
            initialize: function(options) {
                options = options || {};
                options.requiresRoles = true;
                BootstrapSearch.prototype.initialize.call(this, options);
                // attr to set on the report from the url
                this.url_filter = [
                   "^earliest$",
                   "^latest$",
                   "^display.prefs.events.count$",
                   "^display.prefs.statistics.count$"
                ];

                this.reportRequired = true;
                this.fetchExternalVisualization = true;

                this.setPageTitle(_('Report').t());
                
                this.model.eventsViewerReport = new ReportModel();
            },
            //Our only Action method
            page: function(locale, app, page) {
                BootstrapSearch.prototype.page.apply(this, arguments);
                
                $.when(this.baseDeactivateDeferred, this.deferreds.times, this.deferreds.pageViewRendered).then(function(){
                    if (this.shouldRender) {
                        //insert the top bars
                        //this.pageView.$('.section-padded').remove();//remove once all pages migrated to Page view class correctly
                        this.initializeReportView();
                        $('.preload').replaceWith(this.pageView.el);
                        this.deferreds.preloadReplaced.resolve();
                    }
                }.bind(this));
                
                $.when(this.baseActivateDeferred, this.deferreds.externalVisualizations).then(function() {
                    this.reportView.activate();
                    this.activate();
                    
                    if (this.shouldRender) {
                        this.setPageTitle(this.model.report.entry.get('name') || _('Report').t());
                        this.reportView.render().replaceContentsOf($('.main-section-body'));

                        switch(this.model.classicUrl.get('dialog')) {
                            case 'permissions':
                                if (this.model.reportPristine.entry.acl.get('can_change_perms')) {
                                    this.showPermissionsDialog();
                                }
                                break;
                            case 'schedule':
                                this.showScheduleDialog();
                                break;
                            case 'acceleration':
                                this.showAccelerationDialog();
                                break;
                            case 'embed':
                                this.showEmbedDialog();
                                break;
                        }
                        $(document).trigger("rendered");
                    }
                }.bind(this));  
            },
            initializeReportView: function () {
                if (!this.reportView) {
                    this.reportView = new ReportView({
                        model: {
                            result: this.model.result,
                            summary: this.model.summary,
                            searchJob: this.model.searchJob,
                            report: this.model.report,
                            reportPristine: this.model.reportPristine,
                            eventsViewerReport: this.model.eventsViewerReport,
                            application: this.model.application,
                            timeRange: this.model.timeRange,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            times: this.collection.times,
                            selectedFields: this.collection.selectedFields,
                            roles: this.collection.roles,
                            workflowActions: this.collection.workflowActions
                        },
                        deferreds: {
                            user: this.deferreds.user,
                            appLocal: this.deferreds.appLocal,
                            times: this.deferreds.times,
                            uiPrefs: this.deferreds.uiPrefs,
                            roles: this.deferreds.roles,          
                            workflowActions: this.deferreds.workflowActions
                        }
                    });
                }
            },
            activate: function() {
                // populate eventViewerReport
                this.model.eventsViewerReport.setFromSplunkD(this.model.report.toSplunkD());

                //Events for the report model
                this.model.eventsViewerReport.entry.content.on('change:display.events.table.sortColumn change:display.events.table.sortDirection',_.debounce(function() {
                    this.model.report.entry.content.set({
                        'display.events.table.sortDirection': this.model.eventsViewerReport.entry.content.get('display.events.table.sortDirection'),
                        'display.events.table.sortColumn': this.model.eventsViewerReport.entry.content.get('display.events.table.sortColumn')
                    });
                }, 0), this);

                this.model.report.entry.content.on('change:display.prefs.events.offset change:display.events.maxLines change:display.events.raw.drilldown change:display.events.list.drilldown change:display.events.fields change:display.prefs.events.count change:display.events.timelineEarliestTime change:display.events.timelineLatestTime change:display.events.table.sortColumn change:display.events.table.sortDirection', _.debounce(function() {
                    this.fetchResult();
                }, 0), this);

                this.model.report.entry.content.on('change:display.event.fields', this.populateSelectedFieldsFromReport, this);
                this.collection.selectedFields.on('add remove reset', this.populateReportFromSelectedFields, this);

                this.model.report.entry.content.on('change:display.events.timelineEarliestTime change:display.events.timelineLatestTime change:display.events.fieldsFilter change:display.events.fieldCoverage', _.debounce(function() {
                    this.fetchSummary();
                }, 0), this);

                this.model.report.entry.content.on('change:display.events.timelineEarliestTime change:display.events.timelineLatestTime', _.debounce(function() {
                    this.fetchTimeline();
                }, 0), this);

                this.model.report.entry.content.on('change:display.prefs.events.count', function(){
                    if (this.model.report.entry.content.get('display.prefs.events.count')){
                        this.model.report.entry.content.set({'display.prefs.events.offset': '0'});
                    }
                }, this);

                this.model.report.entry.content.on('change:display.prefs.statistics.count', function(){
                    if (this.model.report.entry.content.get('display.prefs.statistics.count')){
                        this.model.report.entry.content.set({'display.prefs.statistics.offset': '0'});
                    }
                }, this);

                this.model.report.entry.content.on('change:display.general.enablePreview', function(){
                    if (splunkUtils.normalizeBoolean(this.model.report.entry.content.get('display.general.enablePreview'))) {
                        this.model.searchJob.enablePreview();
                    } else {
                        this.model.searchJob.disablePreview();
                    }
                }, this);

                //arbitrators to determine when to push on the history stack
                this.model.report.entry.content.on('change', function(){
                    var changed = this.model.report.entry.content.changedAttributes(),
                        jobPopulationDeferred = $.Deferred(),
                        uiPrefsPopulationDeferred = $.Deferred();

                    //we have to delete the change to search so we don't override the search of the report
                    delete changed.search;
                    
                    this.populateJob(jobPopulationDeferred, changed);
                    this.populateUIPrefs(uiPrefsPopulationDeferred, changed);
                    
                    $.when(jobPopulationDeferred, uiPrefsPopulationDeferred).always(function() {
                        this.populateClassicUrl(changed);
                    }.bind(this));
                }, this);

                //Events for the reportPristine model
                this.model.reportPristine.on('change:id', function(){
                    this.model.classicUrl.save({ s:this.model.reportPristine.id }, { replaceState: true });
                    var payload = this.model.reportPristine.toSplunkD();
                    payload.entry[0].content = {};
                    this.model.report.setFromSplunkD(payload);
                    this.model.eventsViewerReport.setFromSplunkD(payload);
                }, this);

                this.listenTo(this.model.reportPristine.entry.content, 'change:is_scheduled', function () {
                    this.loadNewJob({replaceState: true});
                });

                this.listenTo(this.model.reportPristine.entry.content, 'change:disabled', function() {
                    this.loadNewJob({replaceState: true});
                });

                this.listenTo(this.model.reportPristine.entry.content, 'change:dispatch.earliest_time change:dispatch.latest_time', _.debounce(function() {
                        this.model.report.entry.content.set({
                            'dispatch.earliest_time': this.model.reportPristine.entry.content.get('dispatch.earliest_time'),
                            'dispatch.latest_time': this.model.reportPristine.entry.content.get('dispatch.latest_time')
                        });
                }, 0));

                this.listenTo(this.model.reportPristine.entry.content, 'change:display.page.search.mode', _.debounce(function() {
                        this.model.report.entry.content.set({
                            'display.page.search.mode': this.model.reportPristine.entry.content.get('display.page.search.mode')
                        },
                        {silent:true});
                }, 0));

                //Events on the searchJob model
                this.model.searchJob.on("prepared", function(){
                    this.registerSearchJobFriends();
                    this.model.report.setDisplayType(this.model.searchJob.isReportSearch());
                }, this);
                
                this.model.searchJob.on('destroy', function() {
                    this.model.classicUrl.save(
                        {
                            sid: "",
                            "display.prefs.events.offset": undefined,
                            "display.prefs.statistics.offset": undefined,
                            "display.statistics.sortColumn": undefined,
                            "display.statistics.sortDirection": undefined,
                            "display.events.table.sortColumn": undefined,
                            "display.events.table.sortDirection": undefined,
                            auto_pause: ""
                        },
                        {
                            replaceState: true
                        }
                    );
                }, this);

                this.model.searchJob.on('reload', this.loadNewJob, this);

            },
            deactivate: function() {
                if (!this.shouldRender) {
                    this.model.report.off(null, null, this);
                    this.model.report.entry.content.off(null, null, this);
                    this.model.reportPristine.off(null, null, this);
                    this.model.reportPristine.entry.content.off(null, null, this);
                    this.model.eventsViewerReport.entry.content.off(null, null, this);
                    this.model.searchJob.off(null, null, this);
                }
                this.reportView.deactivate({deep: true});
                BootstrapSearch.prototype.deactivate.apply(this, arguments);
                this.model.eventsViewerReport.clear();
            },

            loadNewJob: function(options) {
                var clonedOptions = _.extend({replaceState: false}, (options || {}));

                // Make sure replaceState is true for scheduled report.
                clonedOptions.replaceState = clonedOptions.replaceState || this.model.report.entry.content.get('is_scheduled');

                this.model.classicUrl.save({sid: undefined}, {replaceState: clonedOptions.replaceState});
                this.page(this.model.application.get('locale'),
                        this.model.application.get('app'),
                        this.model.application.get('page'));
            },

            bootstrappedJobIsInvalid: function(searchFromUrl, searchFromJob) {
                var searchFromReport = this.model.report.entry.content.get('search');

                if (searchFromReport !== searchFromJob) {
                    return true;
                }

                if (this.model.report.entry.content.get('is_scheduled')) {
                    // Check time range of historic job matches report time range or not
                    var jobEarliest = this.model.searchJob.getDispatchEarliestTimeOrAllTime(),
                        jobLatest = this.model.searchJob.getDispatchLatestTimeOrAllTime(),
                        reportEarliest = this.model.report.entry.content.get('dispatch.earliest_time'),
                        reportLatest = this.model.report.entry.content.get('dispatch.latest_time');

                    return !time_utils.compareTwoTimeRanges(jobEarliest, jobLatest, reportEarliest, reportLatest);
                        
                } else {
                    var dispatchAs = this.model.report.entry.content.get('dispatchAs'),
                        jobOwner = this.model.searchJob.entry.acl.get('owner');

                    if (dispatchAs === 'owner') {
                        return jobOwner !== this.model.report.entry.acl.get('owner');
                    } else if (dispatchAs === 'user') {
                        return jobOwner !== this.model.application.get('owner');
                    } else {
                        throw new Error('Invalid value for dispatchAs');
                    }
                }
            },

            getSearch: function(searchFromUrl, searchFromReport, searchFromJob) {
                return searchFromReport; 
            },

            shouldStartNewSearch: function() {
                return !this.model.report.entry.content.get('is_scheduled') && this.model.searchJob.isNew();
            },

            startNewSearch: function(jobCreationDeferred, search, reportMediatedAttrs) {
                var searchToStart = new SearchDispatchJobModel();

                this.addNewSearchListeners(searchToStart, jobCreationDeferred);
                
                searchToStart.save({}, {
                    url: splunkd_utils.fullpath(this.model.report.entry.links.get('dispatch')),
                    data: {
                        earliest_time: this.model.report.entry.content.get('dispatch.earliest_time'),
                        latest_time: this.model.report.entry.content.get('dispatch.latest_time'),
                        // SPL-104364, attribute is in display namespace and not read off report by
                        // dispatch endpoint. Send as part of data here so attribute will be respected.
                        enablePreview: this.model.report.entry.content.get('display.general.enablePreview'),
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        // SPL-104763, attribute is in display namespace and not read off report by
                        // dispatch endpoint. Send as part of data here so attribute will be respected.
                        adhoc_search_level: this.model.report.entry.content.get('display.page.search.mode'),
                        rt_backfill: true,
                        provenance: 'UI:Report'
                    }
                });
            },
            showPermissionsDialog: function() {
                this.permissionsDialog = new PermissionsDialog({
                    model: {
                        document: this.model.reportPristine,
                        nameModel: this.model.reportPristine.entry,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        application: this.model.application
                    },
                    collection: this.collection.roles,
                    onHiddenRemove: true,
                    nameLabel: _('Report').t(),
                    showDispatchAs: true
                });

                $("body").append(this.permissionsDialog.render().el);
                this.permissionsDialog.show();

                this.model.classicUrl.save({ dialog: undefined }, { replaceState: true });

            },
            showScheduleDialog: function() {
                this.scheduleDialog = new ScheduleDialog({
                    model: {
                        report: this.model.reportPristine,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    onHiddenRemove: true
                });

                $("body").append(this.scheduleDialog.render().el);
                this.scheduleDialog.show();

                this.model.classicUrl.save({ dialog: undefined }, { replaceState: true });

            },
            showAccelerationDialog: function() {
                this.accelerationDialog = new AccelerationDialog({
                    model: {
                        report: this.model.reportPristine,
                        application: this.model.application
                    },
                    onHiddenRemove: true
                });

                $("body").append(this.accelerationDialog.render().el);
                this.accelerationDialog.show();

                this.model.classicUrl.save({ dialog: undefined }, { replaceState: true });

            },
            showEmbedDialog: function() {
                this.embedDialog = new EmbedDialog({
                    model: {
                        report: this.model.reportPristine,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user
                    },
                    onHiddenRemove: true                    
                });
                
                $("body").append(this.embedDialog.render().el);
                this.embedDialog.show();

                this.model.classicUrl.save({ dialog: undefined }, { replaceState: true });
            },
            /**
             * Bootstrap search job with an existing job id from URL, or a historic job.
             */
            jobBootstrap: function(jobFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl, jobIdFromUrl) {
                if (this.model.report.entry.content.get('disabled')) {
                    this.model.classicUrl.save({sid: undefined}, {replaceState: true});
                    jobFetchDeferred.resolve();
                    
                } else if (this.model.report.entry.content.get('is_scheduled')) {
                    // Fetch historic job only for scheduled report
                    this.model.classicUrl.save({sid: undefined}, {replaceState: true});
                    var historicJobIdDeferred = this.model.report.getLatestHistoricJobId();
                    $.when(historicJobIdDeferred).then(function(jobId) {
                        if (jobId) {
                            this.model.searchJob.set('id', jobId);
                            this.model.searchJob.fetch({
                                success: function(model, response) {
                                    var searchFromJob = splunkUtils.stripLeadingSearchCommand(model.getSearch());
                                    if (this.bootstrappedJobIsInvalid(searchFromUrl, searchFromJob)) {
                                        this.model.searchJob.unset("id");
                                    } 
                                    jobFetchDeferred.resolve();
                                }.bind(this),
                                error: function(model, response) {
                                    this.model.searchJob.unset('id');
                                    jobFetchDeferred.resolve();
                                }.bind(this)
                            });
                        } else {
                            jobFetchDeferred.resolve();
                        }
                    }.bind(this));

                } else if (jobIdFromUrl) {
                    // Fetch the job if we have an id in URL and report is unscheduled
                    this.fetchJob(jobIdFromUrl, jobFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl);
                } else {
                    // No job id in URL and not using historic job
                    jobFetchDeferred.resolve();
                }
            }
        });
    }
);
