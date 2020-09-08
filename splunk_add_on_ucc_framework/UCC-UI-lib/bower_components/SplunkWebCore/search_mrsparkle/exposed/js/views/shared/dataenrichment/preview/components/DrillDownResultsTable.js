/**
 * @author usaha 
 * @date 1/24/13
 *
 * Drill down results pane for the AddEditRexView. 
 *
 * Inputs:
 *
 *  model: {
 *      searchJob {models/search/Job} shared search job
 *      application {models/shared/Application}
 *      dataModel {models/services/datamodel/DataModel} the data model currently being edited
 *      resultsFetchData {models/shared/fetchdata/ResultsFetchData} contains pagination, sorting and sub search
 *      rowInfo {Backbone.Model} holds the selected field name and value information 
 *      results {models/services/search/jobs/ResultJsonRows} holds array of events to display in results table
 *  }
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    './DrillDownResultsControlBar',
    './ResultsTableContainer',
    'views/Base',
    'views/shared/results_table/ResultsTableMaster',
    'mixins/ViewPane'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseModel,
        DrillDownResultsControlBar,
        ResultsTableContainer,
        BaseView,
        ResultsTableMaster,
        ViewPane) {

        var DrillDownResultsTable = BaseView.extend({
            moduleId:module.id,
            REPORT_TYPE: "results_preview",
            

            initialize:function (options) {
                _(options).defaults( {resultsTableMasterClass: ResultsTableMaster});

                BaseView.prototype.initialize.call(this, options);

                // Create the job status, sample size drop down, results/page drop down and the paginator controls
                this.children.resultsControlBar = new DrillDownResultsControlBar({
                    model: {
                        page: this.model.resultsFetchData,
                        searchJob: this.model.searchJob,
                        paginatorState: this.model.resultsFetchData,
                        rowInfo: this.model.rowInfo, 
                        results: this.model.results},
                    reportType: this.REPORT_TYPE});
                this.children.resultsControlBar.on("backToRegexClicked", function() {
                    this.trigger("backToRegexClicked"); 
                }, this);  
                
                
                // Create the results table
                this.children.resultsView = new ResultsTableContainer({
                    model: {
                        searchData: this.model.results,
                        searchDataParams: this.model.resultsFetchData,
                        searchJob: this.model.searchJob,
                        config: new BaseModel()
                    },
                    resultsTableClass : this.options.resultsTableMasterClass,
                    noResultsMessage : this.options.noResultsMessage
                });
            },

            render:function () {
                // Detach children
                 if (this.children.resultsControlBar)
                    this.children.resultsControlBar.detach();
                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them
                this.children.resultsControlBar.render().appendTo(this.$(".results-control-bar-placeholder"));
                this.children.resultsView.render().appendTo(this.$(".drilldown-table-wrapper"));
                return this;
            },

            invalidateReflow: function() {
                BaseView.prototype.invalidateReflow.apply(this, arguments);
                this.children.resultsView.invalidateReflow();
            },

            template:'\
                <div class="results-control-bar-placeholder"></div>\
                <div class="drilldown-table-wrapper"></div>\
            '
        });


        return DrillDownResultsTable;

    });

