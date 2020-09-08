/**
 * @author jszeto
 * @date 11/1/13
 *
 * inputs
 *      model
 *          application {models/Application}
 *          dataModel {models/services/datamodel/DataModel} the data model currently being edited
 *          searchJob {models/search/Job} the search job model. Its lifecycle is managed externally
 *      flashMessagesView {views/shared/FlashMessages}
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/dataenrichment/preview/components/SearchResultsControlBar',
    'views/shared/eventsviewer/Master',
    'views/shared/results_table/ResultsTableMaster',
    'models/Base',
    'models/shared/fetchdata/ResultsFetchData',
    'models/services/saved/Search',
    'models/services/search/IntentionsParser',
    'models/services/search/jobs/Result',
    'models/services/search/jobs/ResultJsonRows',
    'models/services/search/jobs/Summary',
    'collections/Base',
    'collections/services/data/ui/WorkflowActions'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SearchResultsControlBar,
        EventsViewer,
        ResultsTableMaster,
        BaseModel,
        ResultsFetchData,
        SavedSearch,
        IntentionsParser,
        ResultModel,
        ResultJsonRows,
        SummaryModel,
        BaseCollection,
        WorkflowActionsCollection
        ) {

        return BaseView.extend({
            moduleId:module.id,
            ADHOC_SEARCH_LEVEL: "verbose",

            initialize:function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.model.intentionsParser = new IntentionsParser();

                // A couple of collections to pass into the EventViewer.
                this.collection = {};
                this.collection.workflowActions = new WorkflowActionsCollection();

                this.options.flashMessagesView.register(this.model.intentionsParser);

                this.model.searchJob.on("prepared", this.searchJobPrepared, this);
                this.model.searchJob.on('change:id', this.searchJobClear, this);
            },

            /**
             * Called by parent to pass in the current Object and Calculation models
             *
             * @param objectModel {models/services/datamodel/private/Object}
             * @param calculationModel {models/services/datamodel/private/Calculation}
             */
            setModels: function(objectModel, calculationModel) {
                this.model.object = objectModel;
                this.model.calculation = calculationModel;
            },

            /**
             * Job has been kicked off. Let's create all of the panes
             */
            searchJobPrepared: function() {
                var searchString = this.model.searchJob.getSearch();
                this.model.searchJob.on("jobProgress", this.searchJobProgress, this);
                this.createSubViews(searchString);
            },

            /**
             * Job has been cleared. Let's reset our state
             */
            searchJobClear: function() {
                if (this.model.searchJob.isNew()) {
                    //this.model.searchJob.associatedOff();
                    this.model.searchJob.entry.links.off('change:summary', this.summaryChangeHandler);
                    this.model.searchJob.off("jobProgress", this.searchJobProgress, this);
                }
            },

            /**
             * Job is making progress. Fetch the summary info and the results for the currently visible pane
             */
            searchJobProgress: function() {

                $.when(this.workflowActionsDeferred, this.searchParseDeferred).then(function() {
                    // Update display
                    this.model.resultsModel.safeFetch();
                    if (this.model.summary) {
                        this.model.summary.safeFetch();
                    }
                }.bind(this));
            },

            summaryChangeHandler: function() {
                this.model.summary.set("id", this.model.searchJob.entry.links.get('summary'));
            },

            /**
             * This function will take any search string, then display an events view or
             * table view depending upon the type of search.
             *
             * @param {string} searchString - string to use for the search
             */
            createSubViews: function(searchString) {
                
                this.searchParseDeferred = $.Deferred();
                this.workflowActionsDeferred = $.Deferred();

                delete this.model.summary;

                // Fetch the workflowActions collection
                this.workflowActionsBootstrap(this.workflowActionsDeferred);
                // We need to parse the search string to figure out if this is a non-transforming/transforming search
                this.intentionsParserBootstrap(this.searchParseDeferred, searchString);

                $.when(this.workflowActionsDeferred, this.searchParseDeferred).then(function() {
                    var reportType;

                    if (this.children.resultsView) {
                        this.children.resultsView.remove();
                    }
                    if (this.children.resultsControlBar) {
                        this.children.resultsControlBar.remove();
                    }

                    this.model.resultsFetchData = new ResultsFetchData({segmentation:"full", count:"20", max_lines: 20});

                    // We need two different result views depending upon the type of search. Each view takes a different
                    // type of result model
                    if (this.options.isCalculation || this.model.intentionsParser.isReportsSearch()) {
                        reportType = "results_preview";

                        // Report searches and calculation previews return a table with columns for each field
                        this.model.resultsModel = new ResultJsonRows({}, {fetchData: this.model.resultsFetchData});
                        this.model.resultsFetchData.set({output_mode: 'json_rows'});

                        this.children.resultsView = new ResultsTableMaster({
                            model: {
                                searchData: this.model.resultsModel,
                                searchDataParams: this.model.resultsFetchData,
                                config: new BaseModel() // use an empty model for the formatting options
                            },
                            enableTableDock: true,
                            className: "scrolling-table-wrapper"
                        });

                    } else {
                        // Event searches list the events
                        reportType = "events";

                        this.model.resultsModel = new ResultModel({}, {fetchData: this.model.resultsFetchData});
                        // TODO [JCS] Eventually we should do a fetch here to get the defaults SavedSearch from the server
                        this.model.reportModel = new SavedSearch();
                        this.model.reportModel.entry.content.set("display.events.type", "raw");

                        this.model.summary = new SummaryModel();

                        this.model.searchJob.entry.links.on('change:summary', this.summaryChangeHandler,this);

                        this.children.resultsView = new EventsViewer({
                            model: {
                                result: this.model.resultsModel,
                                summary: this.model.summary,
                                searchJob: this.model.searchJob,
                                report: this.model.reportModel,
                                application: this.model.application
                            },
                            collection: {
                                selectedFields: new BaseCollection(),
                                workflowActions: this.collection.workflowActions
                            },
                            selectableFields: false,
                            allowRowExpand: false,
                            allowModalize: false,
                            headerMode: 'none'
                        });
                    }

                    this.children.resultsControlBar = new SearchResultsControlBar({
                        model: {
                            page: this.model.resultsFetchData,
                            state: this.model.sampleSize,
                            searchJob: this.model.searchJob,
                            paginatorState: this.model.resultsFetchData},
                        reportType: reportType});

                    this.children.resultsControlBar.render().appendTo(this.$(".results-control-bar-placeholder"));
                    this.children.resultsView.render().appendTo(this.$(".preview-table-wrapper"));

                    this.model.resultsModel.set("id", this.model.searchJob.entry.links.get(reportType));

                }.bind(this));
            },

            /**
             * Helper function to get the preview search string when adding or editing an Object.
             * We ask the backend to save a provisional copy of the dataModel and then ask it for the search string.
             *
             * @param {string} objectName - Name of the object that has been modified
             * @param {array} calculationFieldNames - Array of the fieldNames of the calculation's outputFields. If undefined,
             * then we just use previewSearch
             * @return {Deferred} - Returns a Deferred object that is done after the dataModel has been saved.
             */
            fetchPreviewSearchString: function(objectName, calculationFieldNames) {
                var dfd = $.Deferred();

                this.model.dataModel.save({}, {data: {provisional: true}}).then(function() {
                    var objectModel = this.model.dataModel.objectByName(objectName);
                    var searchString;

                    if (!_(calculationFieldNames).isUndefined()) {
                        searchString = objectModel.getCalculationPreviewSearch(calculationFieldNames, true, true);
                    } else {
                        searchString = objectModel.get("previewSearch");
                    }

                    dfd.resolve(searchString);
                }.bind(this));

                return dfd;
            },

            /**
             * Helper function to run the search string through the search parser. We use this to determine the
             * search type (report/non-report)
             *
             * @param {Deferred} searchParseDeferred - deferred object that tracks the status of the request
             * @param {string} search - the search string to parse
             */
            intentionsParserBootstrap: function(searchParseDeferred, search){
                this.model.intentionsParser.fetch({
                    data: {
                        q: search,
                        adhoc_search_level: this.ADHOC_SEARCH_LEVEL,
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    },
                    success: function(model, response) {
                        searchParseDeferred.resolve();
                    },
                    error: function(model, response) {
                        //the search parser blew up on our search and we won't be able to make a job from it
                        searchParseDeferred.reject();
                    }
                });
            },

            /**
             * Helper function to fetch the workflow Actions collection
             * @param {Deferred} workflowActionsDeferred
             */
            workflowActionsBootstrap: function(workflowActionsDeferred) {
                this.collection.workflowActions.fetch({
                    data: {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        count: -1
                    },
                    success: function(model, response) {
                        workflowActionsDeferred.resolve();
                    },
                    error: function(model, response) {
                        workflowActionsDeferred.resolve();
                    }
                });
            },

            // Called when the view is being removed. Remove event listeners
            cleanup: function() {
                // TODO [JCS] Fill out
            },

            render:function () {
                // Detach children

                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them

                return this;
            },

            template:'\
                <div class="results-control-bar-placeholder"></div>\
                <div class="preview-table-wrapper"></div>\
            '
        });

    });

