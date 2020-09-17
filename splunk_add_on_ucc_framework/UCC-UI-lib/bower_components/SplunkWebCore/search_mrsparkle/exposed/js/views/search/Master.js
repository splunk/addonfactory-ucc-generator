/**
 *  Top-level view of the Search page. Contains the searchbar, job status, title, and the results of the search
 */

define(
    [
         'underscore',
         'jquery',
         'backbone',
         'module',
         'models/search/SearchBar',
         'views/Base',
         'views/shared/searchbar/Master',
         'views/shared/jobstatus/Master',
         'views/search/title/Master',
         'views/search/actions/openinpivotmenu/Master',
         'views/search/searchFlashMessages',
         'views/search/results/Master',
         'views/search/initialhelp/Master',
         'views/search/initialhelplite/Master',
         'util/splunkd_utils',
         'splunk.util',
         './Master.pcss'
    ],
    function(
        _,
        $,
        Backbone,
        module,
        SearchBarModel,
        Base,
        SearchBar,
        JobStatus,
        Title,
        OpenInPivotMenu,
        SearchFlashMessage,
        ResultsContainer,
        InitialHelp,
        InitialHelpLite,
        splunkd_utils,
        splunkUtils,
        css
    ){
        return Base.extend({
            moduleId: module.id,
            initialize: function(){
                Base.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR, splunkd_utils.NOT_FOUND];

                this.model.searchBar = new SearchBarModel();

                //views
                this.children.title = new Title({
                    model: {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        uiPrefs: this.model.uiPrefs,
                        tableAST: this.model.tableAST
                    },
                    collection: {
                        times: this.collection.times
                    }
                });

                this.children.searchBar = new SearchBar({
                    model: {
                        state: this.model.report.entry.content,
                        timeRange: this.model.timeRange,
                        user: this.model.user,
                        application: this.model.application,
                        searchBar: this.model.searchBar
                    },
                    collection: {
                        times: this.collection.times,
                        searchBNFs: this.collection.searchBNFs
                    },
                    disableOnSubmit: true,
                    giveFocusOnRender: this.options.focusSearchBarOnRender,
                    autoOpenAssistant: splunkUtils.normalizeBoolean(this.model.report.entry.content.get('display.prefs.autoOpenSearchAssistant'))
                });

                this.children.searchFlashMessage = new SearchFlashMessage({
                    model: {
                        searchJob: this.model.searchJob,
                        searchJobControl: this.model.searchJob.control,
                        report: this.model.report
                    },
                    // Pass the application in as an option rather than in the model to avoid 
                    // listening to and displaying any changes in errors in the application.
                    applicationModel: this.model.application,
                    whitelist: this.errorTypes
                });

                if (this.model.serverInfo.isLite()){
                    this.children.initialHelp = new InitialHelpLite({
                        model: {
                            report: this.model.report,
                            metaDataResult: this.model.metaDataResult,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo,
                            user: this.model.user,
                            searchBar: this.model.searchBar,
                            uiPrefs: this.model.uiPrefs
                        }
                    });
                } else {
                    this.children.initialHelp = new InitialHelp({
                        model: {
                            report: this.model.report,
                            metaDataResult: this.model.metaDataResult,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo,
                            searchBar: this.model.searchBar,
                            uiPrefs: this.model.uiPrefs
                        }
                    });
                }

                this.children.resultsContainer = new ResultsContainer({
                    model: {
                        result: this.model.result,
                        summary: this.model.summary,
                        timeline: this.model.timeline,
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection:  {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions,
                        times: this.collection.times
                    }
                });

                //TODO: when everyone moves to activate/deactivate and do not have activate in initialize
                //we will not have to do this.
                _.each(this.children, function(child, key){
                    child.deactivate({deep: true});
                });
            },
            initializeJobStatus: function() {
                this.children.jobStatus = new JobStatus({
                    model: {
                        searchJob: this.model.searchJob,
                        state: this.model.report.entry.content,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user
                    },
                    enableSearchMode: true,
                    enableSamplingMode: true,
                    autoPause: this.options.autoPause
                });
                //TODO: remove when views don't call activate in init
                this.children.jobStatus.deactivate({deep:true});
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, 'change:id', function() {
                    if (this.active) {
                        this.hasResultsContainer = !!this.model.searchJob.id;
                        this.manageStateOfChildren();
                    }
                });
                                
                this.listenTo(this.model.report.entry.content, 'enableSearchInput', function() {
                    this.children.searchBar.enable();
                });
                
                this.listenTo(this.children.searchBar, 'changedAutoOpenAssistant', function(value) {
                    this.model.report.entry.content.set({'display.prefs.autoOpenSearchAssistant': value});
                    this.children.searchBar.setAutoOpenAssistantOption(value);
                });
                
                this.listenTo(this.model.report.entry.content, 'change:dispatch.latest_time change:dispatch.earliest_time change:display.page.search.mode change:dispatch.sample_ratio', function() {
                    if (this.hasResultsContainer) {
                        this.children.searchBar.submit({silent: true});
                    }
                });
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                this.ensureDeactivated({deep: true});
                this.options.autoPause = clonedOptions.autoPause;

                this.isError = splunkd_utils.messagesContainsOneOfTypes(this.model.report.error.get("messages"), this.errorTypes) ||
                    splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), this.errorTypes);

                this.hasResultsContainer = !this.model.searchJob.isNew() || this.isError;
                
                if (!this.children.jobStatus) {
                    this.initializeJobStatus();
                }

                this.children.title.activate();
                this.children.searchBar.activate({deep: true}).enable();
                this.children.searchFlashMessage.activate({deep: true});
                this.children.jobStatus.options.autoPause = this.options.autoPause;
                this.children.jobStatus.options.showControlsAndJobInfo = this.hasResultsContainer && this.model.searchJob.id;
                if (this.$el.html() && !this.children.jobStatus.$el.html()) {
                    this.children.jobStatus.activate({deep: true}).render().appendTo(this.$(".job-status-container"));
                } else {
                    this.children.jobStatus.activate({deep: true});
                }

                this.manageStateOfChildren();
                this.listenTo(this.model.report, 'openInPivot', this.showOpenInPivotMenu);

                return Base.prototype.activate.call(this, clonedOptions);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                this.children.jobStatus.remove();
                delete this.children.jobStatus;
                Base.prototype.deactivate.apply(this, arguments);
                this.isError = false;
                return this;
            },
            /**
             * Update the visibility of the help view and the main results table
             */
            manageStateOfChildren: function() {
                if (this.hasResultsContainer){
                    this.children.initialHelp.deactivate({deep: true}).$el.hide();
                    this.children.resultsContainer.activate().$el.show();
                } else {
                    this.children.resultsContainer.deactivate({deep: true}).$el.hide();
                    this.children.initialHelp.activate().$el.show();
                }
            },
            showOpenInPivotMenu: function() {
                this.children.openInPivotMenu = new OpenInPivotMenu({
                    model: {
                        summary: this.model.summary,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        timeRange: this.model.timeRange
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields
                    },
                    onHiddenRemove: true
                });
                this.children.openInPivotMenu.render().appendTo($('body')).show();
            },
            render: function() {
                var html = this.$el.html();
                if (!html) {
                    this.$el.html(_.template(this.template));
                    var header = this.$(".section-header");
                    this.children.searchFlashMessage.render().prependTo(header);
                    this.children.searchBar.render().prependTo(header);
                    this.children.title.render().prependTo(header);
                    if (this.children.jobStatus) {
                        this.children.jobStatus.render().appendTo(this.$(".job-status-container"));
                    }
                    this.children.initialHelp.render().appendTo(this.$el);
                    this.children.resultsContainer.render().appendTo(this.$el);

                    if (this.hasResultsContainer){
                        this.children.initialHelp.$el.hide();
                    } else {
                        this.children.resultsContainer.$el.hide();
                    }
                }

                return this;
            },
            template: '\
                <div class="section-padded section-header">\
                <div class="job-status-container"></div>\
                </div>\
            '
        });
    }
);
