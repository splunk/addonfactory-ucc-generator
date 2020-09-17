/**
 * @author jszeto
 * @date 11/1/13
 *
 * Preview pane for the AddEditRexView. These are parented by a RexPreviewViewStack.
 *
 * Inputs:
 *
 *  model: {
 *      searchJob {models/search/Job} shared search job
 *      application {models/shared/Application}
 *      dataModel {models/services/datamodel/DataModel} the data model currently being edited
 *      sampleSize {models/Base} contains one string attribute called "sampleSize". Used to restrict sample size of search
 *      resultsFetchData {models/shared/fetchdata/ResultsFetchData} contains pagination, sorting and sub search
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
    './SearchResultsControlBar',
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
        SearchResultsControlBar,
        ResultsTableContainer,
        BaseView,
        ResultsTableMaster,
        ViewPane) {

        var PreviewResultsPane = BaseView.extend({
            moduleId:module.id,
            REPORT_TYPE: "results_preview",
            className: "tab-pane",

            initialize:function (options) {
                _(options).defaults({
                    resultsTableMasterClass: ResultsTableMaster,
                    resultsControlBarClass: SearchResultsControlBar
                });

                BaseView.prototype.initialize.call(this, options);
                this.viewPaneInitialize(options);

                // Create the job status, sample size drop down, results/page drop down and the paginator controls
                this.children.resultsControlBar = new this.options.resultsControlBarClass(_.extend({
                    model: {
                        page: this.model.resultsFetchData,
                        state: this.model.state,
                        searchJob: this.model.searchJob,
                        paginatorState: this.model.resultsFetchData,
                        results: this.model.results},
                    reportType: this.REPORT_TYPE
                }, this.options.controlBarOptions));

                // Create the results table
                this.children.resultsView = new ResultsTableContainer({
                    model: {
                        searchData: this.model.results,
                        searchDataParams: this.model.resultsFetchData,
                        searchJob: this.model.searchJob,
                        state: this.model.state,
                        config: new BaseModel()},
                    tableOptions: this.options.resultsTableMasterOptions,
                    resultsTableClass : this.options.resultsTableMasterClass,
                    noResultsMessage : this.options.noResultsMessage});

                // re-broadcast any events that come from the results table container
                this.listenTo(this.children.resultsView, 'all', this.trigger);
            },

            setAddSamplesEnabled: function(isEnabled) {
                this.children.resultsView.setAddSamplesEnabled(isEnabled);
            },

            render:function () {
//                console.log("PreviewResultsPane.render",this.getLabel());
                // Detach children
                if (this.children.resultsControlBar)
                    this.children.resultsControlBar.detach();
                if(this.children.resultsView)
                    this.children.resultsView.detach();
                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them
                this.children.resultsControlBar.render().appendTo(this.$(".results-control-bar-placeholder"));
                this.children.resultsView.render().appendTo(this.$(".preview-table-wrapper"));
                return this;
            },

            template:'\
                <div class="results-control-bar-placeholder"></div>\
                <div class="preview-table-wrapper"></div>\
            '
        });

        _.extend(PreviewResultsPane.prototype, ViewPane);

        return PreviewResultsPane;

    });

