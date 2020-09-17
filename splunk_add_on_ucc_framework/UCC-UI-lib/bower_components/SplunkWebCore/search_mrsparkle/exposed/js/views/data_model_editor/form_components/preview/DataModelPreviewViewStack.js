/**
 * @author jszeto
 * @date 12/27/13
 *
 * Preview view for Add / Edit Rex Calculation. It contains three PreviewResultsPane views to display all events,
 * matching events and non-matching events. It also has a ViewValuesPane for each output field.
 *
 * The panes use the same Job model. Each has its own ResultJsonRows and ResultsFetchData models. The ResultsFetchData
 * models are given the count, offset, sort info and sub search.
 *
 * The output field panes use the Job summary model
 *
 * Inputs:
 *
 *  model: {
 *      searchJob {models/search/Job} - shared search job
 *      application {models/shared/Application}
 *      dataModel {models/services/datamodel/DataModel} the data model currently being edited
        sampleSize {models/Base} - contains one string attribute called "sampleSize". Used to restrict sample size of search
 *  }
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'models/services/search/jobs/Summary',
    'models/shared/fetchdata/ResultsFetchData',
    'models/services/search/jobs/ResultJsonRows',
    'views/Base',
    'views/shared/tabcontrols/TabbedViewStack',
    'views/shared/results_table/MatchResultsTableMaster',
    'views/shared/dataenrichment/preview/components/PreviewResultsPane',
    'views/shared/dataenrichment/preview/components/ViewValuesPane',
    'util/splunkd_utils',
    'util/datamodel/search_utils'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseModel,
        SummaryModel,
        ResultsFetchData,
        ResultJsonRows,
        BaseView,
        TabbedViewStack,
        MatchResultsTableMaster,
        PreviewResultsPane,
        ViewValuesPane,
        splunkdUtils,
        search_utils) {

        var PreviewViewStack = BaseView.extend({
                moduleId:module.id,


                initialize:function (options) {
                    BaseView.prototype.initialize.call(this, options);
                    this.model.searchJob.on("prepared", this.searchJobPrepared, this);
                    this.model.searchJob.on('change:id', this.searchJobClear, this);

                    this.model.summary = new SummaryModel();
                    this.model.searchJob.entry.links.on('change', function() {
                        this.model.summary.set("id", this.model.searchJob.entry.links.get('summary'));
                    },this);
                },

                createSubViews: function() {
                    // Create the TabbedViewStack and the three View panes (All, Match, Non-match)
                    //var calculationModel = this.model.calculation;
                    var objectModel = this.model.object;
                    //var inputField = calculationModel.get("inputField");

                    if (this.previewPane) {
                        this.previewPane.remove();
                    }
                    if (this.viewValuesPanes) {
                        _(this.viewValuesPanes).each(function(viewValuesPane) {
                            viewValuesPane.remove();
                        }, this);
                    }
                    if (this.children.viewStack) {
                        this.children.viewStack.remove();
                    }

                    if (this.model.results) {
                        this.options.flashMessagesView.unregister(this.model.results);
                    }

                    var fetchData = {output_mode: 'json_rows', segmentation:"full", count:20, max_lines: 20};
                    // If we are previewing a field, then just show _raw and the field
                    if (this.model.field) {
                        fetchData.search = search_utils.generateFieldSubSearch([this.model.field.get("fieldName")], "_raw");
                    }
                    // Create the fetch data for each pane, each with its own unique sub search
                    this.model.fetchData = new ResultsFetchData(fetchData);

                    // Create the results models
                    this.model.results = new ResultJsonRows({}, {fetchData: this.model.fetchData});
                    this.options.flashMessagesView.register(this.model.results, [splunkdUtils.ERROR, splunkdUtils.FATAL]);

                    // Hookup the results model id to the search job links url
                    this.model.results.set("id", this.model.searchJob.entry.links.get("results_preview"));

                    // Create each of the preview panes
                    this.previewPane = new PreviewResultsPane({
                        model: {
                            dataModel: this.model.dataModel,
                            application: this.model.application,
                            state: this.model.sampleSize,
                            searchJob: this.model.searchJob,
                            resultsFetchData: this.model.fetchData,
                            results: this.model.results},
                        flashMessagesView: this.options.flashMessagesView,
                        label:_("Events").t(),
                        noResultsMessage: { type: splunkdUtils.ERROR,
                            html: _("No results found.").t()}});

                    // For each output field, create a ViewValues Pane
                    this.viewValuesPanes = [];
                    var errorMsg = { type: splunkdUtils.WARNING,
                        html: _("The field was not found in the events. Try changing the sample size or the regular expression.").t()};

                    if (this.model.calculation) {
                        var useDisplayName = this.model.calculation.outputFields.length > 1;
                        this.model.calculation.withEachField(function(field) {
                            var label = useDisplayName ? field.get("displayName") : _("Values").t();
                            this.viewValuesPanes.push(new ViewValuesPane({label:label,
                                fieldName: field.get('fieldName'),
                                model: {
                                    sampleSize: this.model.sampleSize,
                                    searchJob: this.model.searchJob,
                                    summary: this.model.summary
                                },
                                noResultsMessage: errorMsg}));
                        }, this);
                    } else {
                        this.viewValuesPanes.push(new ViewValuesPane({label:_("Values").t(),
                            fieldName: this.model.field.get('fieldName'),
                            model: {
                                state: this.model.sampleSize,
                                searchJob: this.model.searchJob,
                                summary: this.model.summary
                            },
                            noResultsMessage: errorMsg}));
                    }

                    // Combine all the panes into an array
                    this.children.previewPanes = [this.previewPane].concat(this.viewValuesPanes);

                    // Create array of visited panes
                    this.visitedPanes = [];
                    for (var i = 0; i < this.children.previewPanes.length; i++) {
                        this.visitedPanes[i] = false;
                    }

                    // Create the view stack to toggle between the panes
                    this.children.viewStack = new TabbedViewStack({selectedIndex:0});

                    this.children.viewStack.on("change:selectedIndex", this.selectedIndexChangeHandler, this);
                    this.children.viewStack.render().appendTo(this.$(".viewstack-placeholder"));

                    this.toggleViewStackPanes();
                },

                /**
                 * Called by parent to pass in the current Object and Calculation models
                 *
                 * @param objectModel {models/services/datamodel/private/Object}
                 * @param calculationModel {models/services/datamodel/private/Calculation}
                 * @param fieldModel {models/services/datamodel/private/Field}
                 */
                setModels: function(objectModel, calculationModel, fieldModel) {
                    this.model.object = objectModel;
                    this.model.calculation = calculationModel;
                    this.model.field = fieldModel;
                },

                /**
                 * Job has been kicked off. Let's create all of the panes
                 */
                searchJobPrepared: function() {
                    this.previousHasEvents = undefined;
                    this.model.searchJob.on("jobProgress", this.searchJobProgress, this);
                    this.model.searchJob.entry.content.on("change:eventCount", this.toggleViewStackPanes, this);
                    this.createSubViews();
                },

                /**
                 * Job has been cleared. Let's reset our state
                 */
                searchJobClear: function() {
                    if (this.model.searchJob.isNew()) {
                        this.model.searchJob.off("jobProgress", this.searchJobProgress, this);
                        this.model.searchJob.entry.content.off("change:eventCount", this.toggleViewStackPanes, this);
                        this.model.summary.clear();
                    }
                },

                /**
                 * Job is making progress. Fetch the summary info and the results for the currently visible pane
                 */
                searchJobProgress: function() {
                    this.model.summary.safeFetch({data: {top_count:1000}});
                    this.fetchDataForSelectedPane(this.children.viewStack.getSelectedIndex());
                },

                normalizeEventCount: function(value) {
                    if (value == undefined)
                        return false;
                    value = parseInt(value, 10);
                    if (value == 0)
                        return false;
                    return true;
                },

                toggleViewStackPanes: function() {
                    var hasEvents = this.normalizeEventCount(this.model.searchJob.entry.content.get("eventCount"));
//                console.log("PreviewViewStack eventCount",this.model.searchJob.entry.content.get("eventCount"),"hasEvents",hasEvents,"previousHasEvents",this.previousHasEvents);
                    if (hasEvents != this.previousHasEvents) {
                        var panesLength = this.children.viewStack.getLength();
                        if (hasEvents) {
                            if (panesLength <= 1) {
//                            console.log("PreviewViewStack.toggleViewStackPanes adding panes");
                                var length = this.children.previewPanes.length;
                                for (var j=panesLength; j < length; j++) {
                                    var pane = this.children.previewPanes[j];
                                    this.children.viewStack.addPane(pane);
                                }
                            }
                        } else {
                            if (panesLength > 1) {
//                            console.log("PreviewViewStack.toggleViewStackPanes removing panes");
                                // Remove all but the first pane
                                for (var i = panesLength - 1; i > 0; i--) {
                                    this.children.viewStack.removePaneAt(i);
                                }
                            } else if (panesLength == 0) {
//                            console.log("PreviewViewStack.toggleViewStackPanes adding first pane");
                                this.children.viewStack.addPane(this.children.previewPanes[0]);
                            }

                        }
                    }
                    this.previousHasEvents = hasEvents;
                },


                /**
                 * The user has navigated to a new pane. Fetch the results for the pane if needed.
                 */
                selectedIndexChangeHandler: function() {
                    var selectedIndex = this.children.viewStack.getSelectedIndex();
                    // Only fetch if job is still running or we haven't visited the pane yet
                    if (this.model.searchJob.isRunning() || !this.visitedPanes[selectedIndex]) {
                        this.fetchDataForSelectedPane(selectedIndex);
                    }

                    this.visitedPanes[selectedIndex] = true;
                },

                fetchDataForSelectedPane: function(selectedIndex) {
                    if (selectedIndex == 0)
                        this.model.results.safeFetch();
                },

                /**
                 * Helper function to generate a fields sub search
                 * @param fieldArray
                 * @param inputField
                 * @return {String}
                 */
                generateFieldSubSearch: function(fieldArray, inputField) {
                    var result = " | fields " + fieldArray.join(",");

                    var fieldsToRemove = [];
                    if (inputField != "_raw") {
                        fieldsToRemove.push("_raw");
                    }
                    if (inputField != "_time") {
                        fieldsToRemove.push("_time");
                    }

                    if (fieldsToRemove.length > 0)
                        result += " | fields - " + fieldsToRemove.join(",");

                    return result;
                },

                render:function () {
                    // Detach children

                    // Use template
                    this.$el.html(this.compiledTemplate({}));
                    // Attach children and render them

                    return this;
                },

                template:'\
                <div class="viewstack-placeholder"></div>\
            '
            },
            {
                SUMMARY_TOP_COUNT:1000
            });

        return PreviewViewStack;

    });

