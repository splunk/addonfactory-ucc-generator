/**
 * @author jszeto
 * @date 11/21/13
 *
 * ViewStack pane for displaying the values of a given output field
 *
 * Inputs:
 *
 *  model: {
 *      field {models/services/datamodel/private/Field} The output field for this pane
 *      sampleSize {Backbone.Model} model used for SelectSampleSize. Expects a "sampleSize" attribute
 *      searchJob {models/search/Job} model for the search job
 *      summary {models/services/search/jobs/Summary} contains an array of fields from the search job
 *  }
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'models/shared/fetchdata/ResultsFetchData',
    'models/services/search/jobs/ResultJsonRows',
    'views/Base',
    './ResultsControlBar',
    './ResultsTableContainer',
    'views/shared/Paginator',
    'views/shared/results_table/FieldValuesTableMaster',
    'mixins/ViewPane'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseModel,
        ResultsFetchData,
        ResultJsonRows,
        BaseView,
        ResultsControlBar,
        ResultsTableContainer,
        Paginator,
        FieldValuesTableMaster,
        ViewPane) {

        var ViewValuesPane =  BaseView.extend({
            moduleId:module.id,
            className: "tab-pane",

            initialize:function (options) {
                _(options).defaults({
                    resultsControlBarClass: ResultsControlBar
                });
                BaseView.prototype.initialize.call(this, options);
                this.viewPaneInitialize(options);

                // need to debounce the listener and put it in two places in case summary the fetch gets an empty response
                var debouncedSummaryChangeHandler = _(this.summaryChangeHandler).debounce(0);
                this.model.summary.fields.on("add remove reset", debouncedSummaryChangeHandler, this);
                this.model.summary.on('sync', debouncedSummaryChangeHandler, this);

                // Create the fetch data model for pagination and sorting
                this.model.resultsFetchData = new ResultsFetchData({count:'20', offset:0, sortKey:"Count",sortDirection:"desc"});
                this.model.resultsFetchData.on("change:count change:offset change:sortKey change:sortDirection", this.resultsFetchDataChangeHandler, this);

                this.model.resultsModel = new BaseModel({
                    rows: undefined,
                    fields: [_("Values").t(), _("Count").t(), _("%").t()]
                });

                /*if (this.children.resultsView) {
                    this.children.resultsView.remove();
                }
                if (this.children.resultsControlBar) {
                    this.children.resultsControlBar.remove();
                }*/

                // Use a generic paginator
                var paginator = new Paginator({model: this.model.resultsFetchData});

                // Create the job status, sample size drop down, results/page drop down and the paginator controls
                this.children.resultsControlBar = new this.options.resultsControlBarClass({
                    model: {
                        page: this.model.resultsFetchData,
                        state: this.model.state,
                        searchJob: this.model.searchJob,
                        paginatorState: this.model.resultsFetchData},
                    paginator: paginator});

                // Create the results table
                this.children.resultsTable = new ResultsTableContainer({
                    model: {
                        searchData: this.model.resultsModel,
                        searchDataParams: this.model.resultsFetchData,
                        searchJob: this.model.searchJob,
                        config: new BaseModel()},
                    resultsTableClass : FieldValuesTableMaster,
                    noResultsMessage : this.options.noResultsMessage,
                    tableOptions: {enableTableDock: false}});


                this.children.resultsTable.on('cellClick', function(rowInfo) {
                    rowInfo.fieldName = this.options.fieldName;
                    this.trigger('cellClick', rowInfo);
                }, this);
            },

            /**
             * When the summary model changes, find our field in the array of fields and put the data into our results model
             */
            summaryChangeHandler: function() {
                // Clear the sortedByValues cache
                this._modesSortedByValues = undefined;

                var fieldName = this.options.fieldName;
                var field = this.model.summary.findByFieldName(fieldName);

                if (field) {
                    // Modes are always sorted descending on count. Cache the sorted array
                    var modes = this._modesSortedByCount = field.get("modes").slice(0);
                    // Cache the field count
                    this._fieldCount = field.get("count");

                    this.model.resultsFetchData.set("length", this._modesSortedByCount.length);

                    // If we need the modes sorted by values, create a new sorted array
                    if (this.model.resultsFetchData.get("sortKey") == "Values") {
                        modes = this.getModesSortedByValues();
                    }

                    // Update the results model with the field values
                    this.updateResultsModel(modes);
                } else {
                    this.updateResultsModel([]);
                }
            },

            /**
             * If the user has changed pagination or sorting, then update the results model
             */
            resultsFetchDataChangeHandler: function() {
                // Use one of the cached sorted arrays depending upon the sort key
                var modes = this.model.resultsFetchData.get("sortKey") == "Values" ?
                                this.getModesSortedByValues() : this._modesSortedByCount;

                this.updateResultsModel(modes);
            },

            /**
             * Helper getter function to sort the values alphabetically
             * @return {array} either the sorted cached fields array or a new one
             */
            getModesSortedByValues: function() {
                if (this._modesSortedByValues == undefined) {
                    this._modesSortedByValues = this._modesSortedByCount.slice(0);

                    this._modesSortedByValues.sort(function(a, b) {
                        if (a.value < b.value) {
                            return 1;
                        } else if (a.value > b.value) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                }

                return this._modesSortedByValues;
            },

            /**
             * Copy a subset of the sorted field values over to the results model. Uses sorting and pagination values to
             * calculate the subset.
             * @param sortedModes {array} descending sorted array of field values
             */
            updateResultsModel: function(sortedModes) {

                var fieldValues = [];
                var sortDir = this.model.resultsFetchData.get("sortDirection");
                var count = parseInt(this.model.resultsFetchData.get("count"), 10);
                var offset = this.model.resultsFetchData.get("offset");
                var start;
                var end;
                var i;
                var mode;

                // Depending on the sort direction, iterate through a window of field values
                if (sortDir == "desc") {
                    start = offset;
                    end = Math.min(count + start, sortedModes.length);

                    for (i = start; i < end; i++) {
                        mode = sortedModes[i];
                        fieldValues.push({"Values": mode.value,
                            "Count": mode.count,
                            "%": mode.count / Math.max(this._fieldCount, 1)});
                    }
                } else {
                    start = sortedModes.length - offset - 1;
                    end = Math.max(start - count, -1);

                    for (i = start; i > end; i--) {
                        mode = sortedModes[i];
                        fieldValues.push({"Values": mode.value,
                            "Count": mode.count,
                            "%": mode.count / Math.max(this._fieldCount, 1)});
                    }
                }

                // Apply the field values subset to the results model
                if (fieldValues.length > 0)
                    this.model.resultsModel.set("rows", fieldValues);
                else
                    this.model.resultsModel.set("rows",[]);
            },

            render:function () {
                // Detach children

                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them
                this.children.resultsControlBar.render().appendTo(this.$(".results-control-bar-placeholder"));
                this.children.resultsTable.render().appendTo(this.$(".preview-table-wrapper"));
                return this;
            },

            template:'\
                <div class="results-control-bar-placeholder"></div>\
                <div class="preview-table-wrapper"></div>\
            '
        });

        _.extend(ViewValuesPane.prototype, ViewPane);

        return ViewValuesPane;
    });

