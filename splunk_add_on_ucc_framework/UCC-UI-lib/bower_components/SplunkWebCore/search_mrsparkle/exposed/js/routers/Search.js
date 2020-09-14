define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/BootstrapSearch',
        'views/search/Master',
        'views/shared/dialogs/RiskyCommand',
        'collections/services/configs/SearchBNFs',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        BootstrapSearch,
        SearchView,
        RiskyCommandDialog,
        SearchBNFsCollection,
        splunkd_utils,
        splunkUtils
    ) {
        return BootstrapSearch.extend({
            initialize: function() {
                BootstrapSearch.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Search').t());
                this.fetchUserPref = true;
                this.fetchExternalVisualizations = true;
                this.collection.searchBNFs = new SearchBNFsCollection();
                this.deferreds.searchBNF = $.Deferred();
                
                $(window).resize(_.debounce(function(){
                    this.setBodyMinHeight();
                }.bind(this), 0));
            },
            //Our only Action method
            page: function(locale, app, page) {
                BootstrapSearch.prototype.page.apply(this, arguments);

                if (this.deferreds.searchBNF.state() !== 'resolved') {
                    this.collection.searchBNFs.fetch({
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner"),
                            count: 0
                        },
                        parseSyntax: true,
                        success: function (model, response) {
                            this.deferreds.searchBNF.resolve();
                        }.bind(this),
                        error: function (model, response) {
                            this.deferreds.searchBNF.resolve();
                        }.bind(this)
                    });
                }

                $.when(this.baseDeactivateDeferred, this.deferreds.userPref, this.deferreds.times, this.deferreds.pageViewRendered, this.deferreds.searchBNF).then(function(){
                    if (this.shouldRender) {
                        //insert the top bars
                        //this.pageView.$('.section-padded').remove();//remove once all pages migrated to Page view class correctly
                        this.initializeSearchView();
                        $('.preload').replaceWith(this.pageView.el);
                        this.deferreds.preloadReplaced.resolve();
                    }
                }.bind(this));
                
                $.when(this.baseActivateDeferred, this.deferreds.externalVisualizations).then(function() {
                    this.searchView.activate({autoPause: this.autoPause});
                    this.activate();
                    
                    if (this.shouldRender) {
                        this.searchView.render().replaceContentsOf($('.main-section-body'));

                        // If the search job has an risky command error, then display our risky command warning
                        if (splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), [splunkd_utils.RISKY_COMMAND])) {
                            // hide tour but set skipSetViewed to true so that next load of the page will show tour.
                            $.when(this.deferreds.pageViewRendered).then(function() {
                                if (this.model.tour) {
                                    this.model.tour.set('skipSetViewed', true);
                                    this.pageView.killTour();
                                }
                            }.bind(this));
                            this.showRiskyWarning();
                        }
                        //replace with application level event view:append
                        $(document).trigger("rendered");
                    }
                }.bind(this));
            },
            initializeSearchView: function() {
                if (!this.searchView) {
                    this.searchView = new SearchView({
                        model: {
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            classicUrl: this.model.classicUrl,
                            metaDataJob: this.model.metaDataJob,
                            metaDataResult: this.model.metaDataResult,
                            report: this.model.report,
                            reportPristine: this.model.reportPristine,
                            result: this.model.result,
                            searchJob: this.model.searchJob,
                            serverInfo: this.model.serverInfo,
                            summary: this.model.summary,
                            timeRange: this.model.timeRange,
                            timeline: this.model.timeline,
                            user: this.model.user,
                            uiPrefs: this.model.uiPrefs,
                            userPrefs: this.model.userPref,
                            tableAST: this.model.tableAST
                        },
                        collection: {
                            times: this.collection.times,
                            workflowActions: this.collection.workflowActions,
                            selectedFields: this.collection.selectedFields,
                            searchBNFs: this.collection.searchBNFs
                        },
                        deferreds: {
                            appLocal: this.deferreds.appLocal,
                            user: this.deferreds.user,
                            serverInfo: this.deferreds.serverInfo,
                            times: this.deferreds.times,
                            workflowActions: this.deferreds.workflowActions,
                            uiPrefs: this.deferreds.uiPrefs
                        },
                        // SPL-122190: Do not focus the search bar if there is a tour.
                        focusSearchBarOnRender: !(this.model.tour && this.model.tour.isValidTour())
                    });
                }
            },
            activate: function() {
                //Events for the report model
                this.model.report.entry.content.on('change:display.prefs.events.offset change:display.events.fields change:display.events.maxLines change:display.events.raw.drilldown change:display.events.list.drilldown change:display.prefs.events.count change:display.events.timelineEarliestTime change:display.events.timelineLatestTime change:display.page.search.tab change:display.events.table.sortColumn change:display.events.table.sortDirection', _.debounce(function() {
                    this.fetchResult();
                }, 0), this);

                // TODO [JCS] I can't find this event triggered anywhere. Can we remove?
                this.model.result.on('forcefetch', function() {
                    this.fetchResult();
                },this);
                
                this.model.report.entry.content.on('change:display.events.type', function(m, value, options) {
                    if(m.previousAttributes()['display.events.type'] == 'table' || m.get('display.events.type') === 'table') {
                        this.fetchResult();
                    }
                }, this);
                
                this.model.summary.on('change:fieldPickerOpen', this.fetchSummary, this);
                
                this.model.report.entry.content.on('change:display.events.timelineEarliestTime change:display.events.timelineLatestTime', function() {
                    this.model.report.entry.content.set('display.prefs.events.offset', '0');
                }, this);
                
                this.model.report.entry.content.on('change:display.events.timelineEarliestTime change:display.events.timelineLatestTime change:display.page.search.tab', _.debounce(function() {
                    this.fetchSummary();
                    this.fetchTimeline();
                }, 0), this);
                
                this.model.report.entry.content.on('change:display.page.search.tab', function() {
                    var reportSearch = this.model.searchJob.entry.content.get('reportSearch');
                    this.model.report.setDisplayType(this.model.searchJob.isReportSearch(), reportSearch);
                }, this);
                
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
                    var changed = $.extend(true, {}, this.model.report.entry.content.changedAttributes()),
                        previous = this.model.report.entry.content.previousAttributes(),
                        jobPopulationDeferred = $.Deferred(),
                        uiPrefsPopulationDeferred = $.Deferred(),
                        options = {};
                    
                    this.populateJob(jobPopulationDeferred, changed);
                    this.populateUIPrefs(uiPrefsPopulationDeferred, changed);
                    
                    $.when(jobPopulationDeferred, uiPrefsPopulationDeferred).always(function() {
                        if (this.model.report.id && (this.model.report.id !== this.model.reportPristine.id)) {
                            this.model.searchJob.set("cannotPauseOnRemove", true);
                            options.forceAttrs = {s: this.model.report.id};
                            options.forceTrigger = true;
                        }
                        if (changed['display.page.search.patterns.sensitivity']) {
                            this.model.report.entry.content.set({
                                'display.events.timelineEarliestTime': undefined,
                                'display.events.timelineLatestTime': undefined
                            });
                            this.model.searchJob.set("cannotPauseOnRemove", true);
                            this.model.classicUrl.save({
                                    'display.page.search.patterns.sensitivity': previous['display.page.search.patterns.sensitivity']
                                },
                                {
                                    replaceState: true
                                }
                            );
                            options.forceAttrs = {sid: this.model.searchJob.id};
                            options.forceTrigger = true;
                        }
                        this.populateClassicUrl(changed, options);
                    }.bind(this));
                }, this);
                
                this.model.report.on('change:id', function(){
                    this.model.searchJob.set("cannotPauseOnRemove", true);
                    this.model.classicUrl.save(
                        {
                            's': this.model.report.id
                         },
                         {
                             trigger: true
                         }
                    );
                }, this);
                
                this.model.report.on("close", this.close, this);
                
                //Events on the searchJob model
                this.model.searchJob.on('destroy', function() {
                    this.model.classicUrl.save(
                        {
                            "display.prefs.events.offset": undefined,
                            "display.prefs.statistics.offset": undefined,
                            "display.events.timelineEarliestTime": undefined,
                            "display.events.timelineLatestTime": undefined,
                            "display.statistics.sortColumn": undefined,
                            "display.statistics.sortDirection": undefined,
                            "display.events.table.sortColumn": undefined,
                            "display.events.table.sortDirection": undefined,
                            auto_pause: undefined
                        },
                        {
                            replaceState: true
                        }
                    );
                }, this);

                // If the job is prepared, it should have enough information to apply any search-string-based defaults.
                // If not, these updates will be applied when the "prepared" event is fired.
                if(!this.model.searchJob.isNew() && !this.model.searchJob.isPreparing()) {
                    this.updateReportBasedOnSearchString();
                }
                this.model.searchJob.on("prepared", function(){
                    this.updateReportBasedOnSearchString();
                    this.registerSearchJobFriends();
                }, this);
                
                this.model.searchJob.on("close", this.close, this);
            },
            deactivate: function() {
                if (!this.shouldRender) {
                    this.model.report.off(null, null, this);
                    this.model.report.entry.content.off(null, null, this);
                    this.model.result.off(null, null, this);
                    this.model.summary.off(null, null, this);
                    this.model.searchJob.off(null, null, this);
                    this.collection.selectedFields.off(null, null, this);
                }
                this.searchView.deactivate({deep: true});
                BootstrapSearch.prototype.deactivate.apply(this, arguments);
            },
            fetchResult: function() {
                if (this.model.result.id && this.model.report.entry.content.get('display.page.search.tab') === 'events') {
                    BootstrapSearch.prototype.fetchResult.apply(this);
                }
            },
            fetchSummary: function() {
                var tab = this.model.report.entry.content.get('display.page.search.tab'),
                    reportSearch = this.model.searchJob.entry.content.get('reportSearch');
                
                if (this.model.summary.id) {
                    if (tab === 'events') { 
                        if (!this.model.summary.get('fieldPickerOpen')) {
                            BootstrapSearch.prototype.fetchSummary.apply(this);
                        }
                    } else if (!reportSearch && (tab === 'visualizations' || tab === 'statistics')) {
                        BootstrapSearch.prototype.fetchSummary.apply(this);
                    }              
                }
            },
            fetchTimeline: function() {
                if (this.model.timeline.id && this.model.report.entry.content.get('display.page.search.tab') === 'events') {
                    BootstrapSearch.prototype.fetchTimeline.apply(this);
                }
            },
            setBodyMinHeight: function() {
                if (this.pageView) {
                    this.minHeight = this.pageView.$('header').height() + $(window).height();
                    $('body').css('min-height', this.minHeight);
                }
            },

            showRiskyWarning: function() {
                this.riskyWarningDialog = new RiskyCommandDialog({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    onHiddenRemove:true
                });
                this.listenTo(this.riskyWarningDialog, "runSearch", function(options) {
                    // recall page and job will run since pageViewCount > 1
                    this.page(this.model.application.get('locale'),
                        this.model.application.get('app'),
                        this.model.application.get('page'));
                }.bind(this));
                this.listenTo(this.riskyWarningDialog, "investigate", function() {
                    //unset the q so that if the user closes the search the stat was never there
                    //and if the user runs the search the q is repopulated
                    this.model.classicUrl.save({ q: undefined }, { replaceState: true });
                });
                this.listenTo(this.riskyWarningDialog, "cancel", function() {
                    //must close with replaceState true so the risky url is removed from the history
                    this.close({replaceState: true});
                }.bind(this));
                this.riskyWarningDialog.render().appendTo($("body"));
                this.riskyWarningDialog.show();
            },
            
            shouldCheckRiskyCommand: function(search) {
                // Only show risky warning on 1st page view and 
                // when the search string is not coming from a saved search.
                return splunkUtils.normalizeBoolean(this.model.config.get('ENABLE_RISKY_COMMAND_CHECK')) &&
                    this.pageViewCount <= 1 &&
                    (this.model.report.isNew() || 
                        $.trim(this.model.reportPristine.entry.content.get('search')) !== $.trim(search));
            },
            
            shouldFetchTableAST: function() {
                return this.model.user.canAccessSplunkDatasetExtensions();
            },
            
            getJobProvenance: function() {
                return 'UI:Search';
            },
            
            updateReportBasedOnSearchString: function() {
                var reportSearch = this.model.searchJob.entry.content.get('reportSearch'),
                    searchSpecificDefaults = this.model.report.getSearchSpecificDefaults(reportSearch),
                    urlTab = this.model.classicUrl.get('display.page.search.tab'),
                    urlType = this.model.classicUrl.get('display.general.type'),
                    searchTab = this.model.searchJob.entry.content.custom.get('display.page.search.tab'),
                    searchType = this.model.searchJob.entry.content.custom.get('display.general.type'),
                    isTransforming = this.model.searchJob.isReportSearch();
                    
                // If there is no explicit general tab or type in the permalink, and no custom general tab or type defined in the job,
                // it is safe to apply the search-specific defaults.
                if (!urlTab && !urlType && !searchTab && !searchType && !_(searchSpecificDefaults).isEmpty()) {
                    this.model.report.entry.content.set(searchSpecificDefaults);
                    return;
                }
                
                // Call setSearchTab and setDisplayType on the report to make sure the transforming/non-transforming experience is
                // handled correctly.
                this.model.report.setSearchTab({
                    isTransforming: isTransforming,
                    reportSearch: reportSearch,
                    canPatternDetect: this.model.user.canPatternDetect(),
                    isUneventfulReportSearch: this.model.searchJob.isUneventfulReportSearch()
                });

                this.model.report.setDisplayType(isTransforming, reportSearch);
            }
        });
    }
);
