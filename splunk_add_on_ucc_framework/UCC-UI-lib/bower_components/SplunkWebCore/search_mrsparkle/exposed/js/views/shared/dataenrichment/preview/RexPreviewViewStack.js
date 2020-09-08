/**
 * @author jszeto
 * @date 11/6/13
 *
 * Preview view for Add / Edit Rex Calculation. It contains three PreviewResultsPane views to display all events,
 * matching events and non-matching events. It also has a ViewValuesPane for each output field.
 *
 * The panes use the same Job model. Each has its own ResultJsonRows and ResultsFetchData models. The ResultsFetchData
 * models are given the count, offset, sort info and sub search.
 *
 * The output field panes use the Job summary model
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'models/services/search/jobs/Summary',
    'models/shared/fetchdata/ResultsFetchData',
    'models/shared/dataenrichment/ExtractionEventsFetchData',
    'models/services/search/jobs/ResultJsonRows',
    'views/Base',
    'views/shared/tabcontrols/TabbedViewStack',
    'views/shared/results_table/MatchResultsTableMaster',
    './components/PreviewResultsPane',
    './components/MatchResultsControlBar',
    './components/ViewValuesPane',
    './components/DrillDownResultsTable',
    'util/splunkd_utils',
    'util/field_extractor_utils',
    'util/datamodel/search_utils',
    'splunk.util'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseModel,
        SummaryModel,
        ResultsFetchData,
        ExtractionEventsFetchData,
        ResultJsonRows,
        BaseView,
        TabbedViewStack,
        MatchResultsTableMaster,
        PreviewResultsPane,
        MatchResultsControlBar,
        ViewValuesPane,
        DrillDownResultsTable,
        splunkdUtils,
        fieldExtractorUtils,
        search_utils,
        splunkUtils) {

        var RexPreviewViewStack = BaseView.extend({

            moduleId:module.id,

            /**
             * @constructor
             *
             * @param options {Object} {
             *     model: {
             *         searchJob <models.search.Job> shared search job
             *         application <models.shared.Application>
             *         state {Model} model to track the state of the previewing operation
             *     }
             * }
             */

            initialize:function (options) {
                BaseView.prototype.initialize.call(this, options);
                this.$el.addClass('rex-preview-view-stack');
                this.model.searchJob.on("prepared", this.searchJobPrepared, this);
                this.model.searchJob.on('change:id', this.searchJobClear, this);

                this.model.summary = new SummaryModel();
                this.model.searchJob.entry.links.on('change', function() {
                    this.model.summary.set("id", this.model.searchJob.entry.links.get('summary'));
                },this);
                this.autoDrilldownEnabled = this.options.autoDrilldownEnabled !== false;
            },

            setAddSamplesEnabled: function(isEnabled) {
                if(this.eventsPane) {
                    this.eventsPane.setAddSamplesEnabled(isEnabled);
                }
            },

            createSubViews: function() {
                if (this.eventsPane) {
                    this.eventsPane.remove();
                }
                if (this.viewValuesPanes) {
                    _(this.viewValuesPanes).each(function(viewValuesPane) {
                        viewValuesPane.remove();
                    }, this);
                }
                if (this.children.viewStack) {
                    this.children.viewStack.remove();
                }

                // Create the fetch data for each pane, each with its own unique sub search
                this.model.eventsFetchData = new ExtractionEventsFetchData({
                    output_mode: 'json_rows',
                    segmentation:"full",
                    count: '20',
                    max_lines: fieldExtractorUtils.MAX_EVENT_LINES,
                    search: this.getEventsPostProcessSearch()
                });
                this.model.drillDownFetchData = new ResultsFetchData({
                    output_mode: 'json_rows',
                    segmentation: 'full',
                    count: '20',
                    max_lines: fieldExtractorUtils.MAX_EVENT_LINES,
                    search: ''
                });

                // Create the results models
                this.model.eventResults = new ResultJsonRows({}, { fetchData: this.model.eventsFetchData });
                this.model.drillDownResults = new ResultJsonRows({}, { fetchData: this.model.drillDownFetchData });

                // Hookup the results model id to the search job links url
                this.model.eventResults.set('id', this.model.searchJob.entry.links.get('results_preview'));
                this.model.drillDownResults.set('id', this.model.searchJob.entry.links.get('results_preview'));

                var regex = this.model.state.get('regex'),
                    outputFields = fieldExtractorUtils.getCaptureGroupNames(regex),
                    inputField = this.model.state.get('inputField');

                this.eventsPane = new PreviewResultsPane({
                    model: {
                        application: this.model.application,
                        state: this.model.state,
                        searchJob: this.model.searchJob,
                        resultsFetchData: this.model.eventsFetchData,
                        results: this.model.eventResults
                    },
                    label: inputField === '_raw' ? _('Events').t() : inputField,
                    resultsTableMasterOptions: this.model.state.pick('regex', 'inputField', 'requiredText'),
                    resultsTableMasterClass: MatchResultsTableMaster,
                    resultsControlBarClass: MatchResultsControlBar,
                    controlBarOptions: { showMatchControl: !!regex },
                    noResultsMessage: {
                        type: splunkdUtils.ERROR,
                        html: _('No results found.').t()
                    }
                });

                // re-broadcast the action:removeExtraction and action:selectSampleEvent events with the arguments unchanged
                this.listenTo(this.eventsPane, 'action:removeExtraction', _(this.trigger).partial('action:removeExtraction'));
                this.listenTo(this.eventsPane, 'action:selectEvent', _(this.trigger).partial('action:selectEvent'));
                this.listenTo(this.eventsPane, 'action:nextStep', _(this.trigger).partial('action:nextStep'));
                
                // For each output field, create a ViewValues Pane
                this.viewValuesPanes = [];
                _(outputFields).each(function(field) {
                    var valuesPane = new ViewValuesPane({
                        label: this.getFieldDisplayName(field),
                        fieldName: field,
                        model: {
                            state: this.model.state,
                            searchJob: this.model.searchJob,
                            summary: this.model.summary
                        },
                        resultsControlBarClass: MatchResultsControlBar,
                        noResultsMessage: {
                            type: splunkdUtils.WARNING,
                            html: _("The attribute was not found in the events. Try changing the sample size or the regular expression.").t()
                        }
                    });
                    this.viewValuesPanes.push(valuesPane); 
                    valuesPane.on('cellClick', this.handleCellClick, this);
                }, this);

                // Combine all the panes into an array
                this.children.previewPanes = [this.eventsPane].concat(this.viewValuesPanes);

                // Create array of visited panes
                this.visitedPanes = [];
                for (var i = 0; i < this.children.previewPanes.length; i++) {
                    this.visitedPanes[i] = false;
                }

                // Create the view stack to toggle between the panes
                if(this.children.viewStack) {
                    this.stopListening(this.children.viewStack);
                }
                this.children.viewStack = new TabbedViewStack({ selectedIndex: 0 });
                this.children.viewStack.render().appendTo(this.$(".viewstack-placeholder"));
                this.toggleViewStackPanes();
            },

            getEventsPostProcessSearch: function() {
                var inputField = this.model.state.get('inputField'),
                    regex = this.model.state.get('regex'),
                    outputFields = fieldExtractorUtils.getCaptureGroupNames(regex),
                    eventsView = this.model.state.get('eventsView');

                if(regex && eventsView === fieldExtractorUtils.VIEW_MATCHING_EVENTS) {
                    return (this.getPreviewMatchSearch(inputField, regex) +
                        search_utils.generateFieldSubSearch(_.union([inputField], outputFields), inputField));
                }
                if(regex && eventsView === fieldExtractorUtils.VIEW_NON_MATCHING_EVENTS) {
                    return (this.getPreviewNonMatchSearch(inputField, regex) +
                        search_utils.generateFieldSubSearch([inputField], inputField));
                }
                // Fall through to viewing all events
                var allFields = _.union([inputField], outputFields);
                if(regex) {
                    allFields.unshift(fieldExtractorUtils.MATCH_FIELD_NAME);
                }
                return (this.getPreviewAllSearch(inputField, regex) +
                    search_utils.generateFieldSubSearch(allFields, inputField));
            },

            getPreviewAllSearch: function(inputField, regex) {
                if(!regex) {
                    return '';
                }
                return splunkUtils.sprintf(
                    'eval %s = if(match(%s, %s), 1, 0)',
                    fieldExtractorUtils.MATCH_FIELD_NAME,
                    splunkUtils.searchEscape(inputField),
                    splunkUtils.searchEscape(regex, { forceQuotes: true })
                );
            },

            getPreviewMatchSearch: function(inputField, regex) {
                return splunkUtils.sprintf(
                    'where match(%s, %s)',
                    splunkUtils.searchEscape(inputField),
                    splunkUtils.searchEscape(regex, { forceQuotes: true })
                );
            },

            getPreviewNonMatchSearch: function(inputField, regex) {
                return splunkUtils.sprintf(
                    'where NOT match(%s, %s)',
                    splunkUtils.searchEscape(inputField),
                    splunkUtils.searchEscape(regex, { forceQuotes: true })
                );
            },

            getFieldDisplayName: function(fieldName) {
                var fieldAliases = this.model.state.get('fieldAliases');
                if(fieldAliases && fieldAliases[fieldName]) {
                    return fieldAliases[fieldName];
                }
                return fieldName;
            },

            handleCellClick: function(rowInfo) {
                if(!this.autoDrilldownEnabled) {
                    this.trigger('action:valueDrilldown', rowInfo.fieldName, rowInfo.value);
                    return;
                }
                var inputField = this.model.state.get("inputField");
                var drillDownFields = _.union(
                    ['_raw', inputField],
                    fieldExtractorUtils.getCaptureGroupNames(this.model.state.get('regex'))
                );
                var drillDownSearch = "search " + rowInfo.fieldName + '=' + '"' + rowInfo.value.replace(/"/g, '\\"') + '"' +  search_utils.generateFieldSubSearch(drillDownFields, inputField);
                this.model.drillDownFetchData.set('search', drillDownSearch);
                this.model.drillDownResults.safeFetch();

                this.model.rowInfo = new Backbone.Model();
                this.drillDownTable = new DrillDownResultsTable({
                        model: {
                            searchJob: this.model.searchJob,
                            resultsFetchData: this.model.drillDownFetchData,
                            rowInfo: this.model.rowInfo,
                            results: this.model.drillDownResults
                        },
                        label:_("Drill-down").t(),
                        tabClassName: "tab-results-last",
                        noResultsMessage: { type: splunkdUtils.WARNING,
                            html: _("None of the results match the selected row.").t()}
                });

                this.drillDownTable.on("backToRegexClicked", function() {
                        this.trigger('hideDrillDownView', this.drillDownTable);
                }, this);
                this.model.rowInfo.set('field', rowInfo.fieldName);
                this.model.rowInfo.set('value', rowInfo.value);
                this.trigger('showDrillDownView', this.drillDownTable.render());
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
                this.model.summary.safeFetch({ data: { top_count: 1000, min_freq: 0 } });
                this.model.eventResults.safeFetch();
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
//                console.log("RexPreviewViewStack eventCount",this.model.searchJob.entry.content.get("eventCount"),"hasEvents",hasEvents,"previousHasEvents",this.previousHasEvents);
                if (hasEvents != this.previousHasEvents) {
                    var panesLength = this.children.viewStack.getLength();
                    if (hasEvents) {
                        if (panesLength <= 1) {
//                            console.log("RexPreviewViewStack.toggleViewStackPanes adding panes");
                            var length = this.children.previewPanes.length;
                            for (var j=panesLength; j < length; j++) {
                                var pane = this.children.previewPanes[j];
                                this.children.viewStack.addPane(pane);
                            }
                        }
                    } else {
                        if (panesLength > 1) {
//                            console.log("RexPreviewViewStack.toggleViewStackPanes removing panes");
                            // Remove all but the first pane
                            for (var i = panesLength - 1; i > 0; i--) {
                                this.children.viewStack.removePaneAt(i);
                            }
                        } else if (panesLength == 0) {
//                            console.log("RexPreviewViewStack.toggleViewStackPanes adding first pane");
                            this.children.viewStack.addPane(this.children.previewPanes[0]);
                        }

                    }
                }
                this.previousHasEvents = hasEvents;
            },

            render:function () {
                this.$el.html(this.compiledTemplate({}));
                return this;
            },

            template:'\
                <div class="viewstack-placeholder"></div>\
            '
        },
        {
            SUMMARY_TOP_COUNT:1000
        });

        return RexPreviewViewStack;

    });

