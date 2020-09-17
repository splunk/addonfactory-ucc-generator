define(function (require, exports, module) {
    var $ = require("jquery");
    var _ = require("underscore");
    var utils = require('./utils');
    var Collection = require('backbone').Collection;
    var BaseVisualizationView = require("./visualizationview");
    var ReportVisualizer = require('views/shared/ReportVisualizer');
    var Drilldown = require('./drilldown');
    var BaseCellRenderer = require('views/shared/results_table/renderers/BaseCellRenderer');
    var BaseRowExpansionRenderer = require('views/shared/results_table/renderers/BaseRowExpansionRenderer');
    var console = require('util/console');
    var GeneralUtils = require('util/general_utils');
    var DashboardParser = require('./simplexml/parser');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name TableView
     * @description The **Table** view displays a table of search results.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {String} [options.data="preview"] - The type of data to retrieve from the
     * search results </br>(`results | preview | events | summary | timeline`).
     * @param {String} [options.dataOverlayMode="none"] - The type of overlay to display
     * </br>(`heatmap | highlow | none`).
     * @param {Boolean} [options.displayRowNumbers=false] - Indicates whether to display
     * row numbers.
     * @param {String} [options.drilldown="row"] - The type of drilldown action </br>
     * (`row | cell | none`).
     * @param {Boolean} [options.drilldownRedirect=true] - Indicates whether to redirect
     * to a search page when clicked. When true, a refined search corresponding
     * to the point that was clicked is displayed in the search app. When false,
     * you must create a click event handler to define a drilldown action. You
     * can also use the **preventDefault** method in the click event handler to
     * bypass the default redirect to search.
     * @param {String} [options.fields=null] - The fields to display in the table.
     * Specify a comma-separated string or an array of strings.
     * @param {String} [options.format=null] - The properties for a sparkline, in the
     * format:</br>
     *
     *     format: {
     *         "<sparkline_fieldname>": [
     *             {
     *                 "type": "sparkline",
     *                 "options": // Sparkline options
     *                 {
     *                     "property-1": "value-1",
     *                     ...
     *                     "property-n": "value-n"
     *                 }
     *             }
     *         ]
     *     }
     *
     * where <i>`sparkline_fieldname`</i> and `type` are required. For more, see
     * <a href="http://dev.splunk.com/view/SP-CAAAEUB" target="_blank">How to customize table cells and format sparklines</a>.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind
     * this control to.
     * @param {String} [options.pagerPosition="bottom"] - The position on the page where
     * the page is displayed (`top | bottom`).
     * @param {Number} [options.pageSize=10] - The number of results per page.
     * @param {Object} [options.settings] - The properties of the view.
     * @param {Boolean} [options.showPager=true] - Indicates whether to display the
     * table pagination control.
     * @param {Boolean} [options.wrap=false] - Indicates whether to wrap text in the
     * results table.
     *
     * @example
     * require([
     *     "splunkjs/mvc/tableview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(TableView) {
     *
     *     // Instantiate components
     *     new TableView({
     *         id: "example-table",
     *         managerid: "example-search",
     *         pageSize: "5",
     *         el: $("#mytableview")
     *     }).render();
     *
     * });
     */

    /*
     * Helper methods for manipulating search results, used in the `formatData` method below.
     */
    var toFieldName = function (field) {
        return _.isString(field) ? field : field.name;
    };
    var createFieldEntry = function (fieldName, fields) {
        if (!fields || !fields.length || _.isString(fields[0])) {
            return fieldName;
        }
        return { name: fieldName };
    };

    var TableView = BaseVisualizationView.extend(/** @lends splunkjs.mvc.TableView.prototype */{
        moduleId: module.id,

        className: 'splunk-table',
        options: _.extend({}, BaseVisualizationView.prototype.options, {
            fields: []
        }),
        drilldownWithJobTimeOnly: true,

        normalizeSettings: function(settings, options) {
            BaseVisualizationView.prototype.normalizeSettings.apply(this, arguments);
            if(settings.has('wrap')) {
                if(GeneralUtils.isBooleanEquivalent(settings.get('wrap'))) {
                    settings.set('wrap', GeneralUtils.normalizeBoolean(settings.get('wrap')) ? '1' : '0');
                }
            }
            if(settings.has('rowNumbers')) {
                if(GeneralUtils.isBooleanEquivalent(settings.get('rowNumbers'))) {
                    settings.set('displayRowNumbers', GeneralUtils.normalizeBoolean(settings.get('rowNumbers')) ? '1' : '0');
                }
                else {
                    settings.set('displayRowNumbers', settings.get('rowNumbers'));
                }
            } else if(settings.has('displayRowNumbers')) {
                settings.set('displayRowNumbers', GeneralUtils.normalizeBoolean(settings.get('displayRowNumbers')) ? '1' : '0');
            }
            if(settings.has('overlay')) {
                settings.set('dataOverlayMode', settings.get('display.statistics.overlay'));
            }
            settings.set('drilldown', Drilldown.getNormalizedDrilldownType(settings.get('drilldown'), {
                validValues: ['row', 'cell', 'none'],
                aliasMap: { all: 'cell', off: 'none' },
                'default': 'cell'
            }));
            if(settings.get('format')) {
                var sparklineSettings = {};
                _.each(settings.get('format'), function(formats,field) {
                    _.each(formats, function(format){
                        if(format.type === 'sparkline') {
                            sparklineSettings[field] = format.options;
                        }
                    });
                });

                if(!_(sparklineSettings).isEmpty()) {
                    settings.set({
                        "sparkline.format": sparklineSettings
                    });
                }
            }
        },

        initialize: function (options) {
            BaseVisualizationView.prototype.initialize.apply(this, arguments);

            // NOTE: this instance member needs to be aliased to `table`, it is referenced directly in
            // some externally-facing examples.
            this.table = this.viz;

            // Some externally-facing example code access the custom cell renderer API of the `table` child view directly.
            // This is deprecated but for backward compatibility we intercept those methods here.
            _(['addCellRenderer', 'removeCellRenderer', 'getCellRenderers']).each(function(fnName) {
                if (this.viz[fnName]) {
                    throw new Error('Trying to hackily intercept the ' + fnName + ' method of the `table` child view but it already exists.  This should not happen.');
                }
                this.viz[fnName] = _(function() {
                    console.warn('Calling ' + fnName + ' on the `table` child view directly is deprecated.  Use the panel element\'s method of the same name.');
                    return this[fnName].apply(this, arguments);
                }).bind(this);
            }, this);

            this._rendered = false;
            this.listenTo(this.viz, 'rendered', function(){
                this._rendered = true;
            }, this);

            this.transformFieldsToArray();
            this.listenTo(this.settings, 'change:fields', this.onFieldsChanged);
        },

        updateMessageHeight: function() {
            // Give table message element the height a typical table with 10 rows would have (without wrapping, including paginator)
            this.$msg.height(306);
        },

        syncSettingsAndReportModel: function(settings, report) {
            this._settingsSync = utils.syncModels(settings, report, {
                auto: true,
                alias: {
                    'displayRowNumbers': 'display.statistics.rowNumbers',
                    'dataOverlayMode': 'display.statistics.overlay',
                    'pageSize': 'display.prefs.statistics.count',
                    'offset': 'display.prefs.statistics.offset',
                    'sortKey': 'display.statistics.sortColumn',
                    'sortDirection': 'display.statistics.sortDirection',
                    'totalsRow': 'display.statistics.totalsRow',
                    'percentagesRow': 'display.statistics.percentagesRow'
                },
                prefix: 'display.statistics.',
                exclude: ['data','editable','height','id','manager','managerid','name',
                    'pagerPosition','resizable','title','drilldownRedirect']
            });
        },

        getVisualizationRendererOptions: function() {
            this.cellRendererCollection = new Collection();
            this.rowExpansionRendererCollection = new Collection();
            return ({
                enableTableDock: false,
                generalTypeOverride: ReportVisualizer.GENERAL_TYPES.STATISTICS,
                sortableFieldsExcluded: this.settings.get('sortableFieldsExcluded'),
                collection: {
                    customCellRenderers: this.cellRendererCollection,
                    customRowExpansionRenderers: this.rowExpansionRendererCollection
                }
            });
        },

        canEnablePagination: function() {
            return true;
        },

        canEnableResize: function() {
            return false;
        },

        formatData: function(data) {
            var rows, fields;
            if (!data) {
                return data;
            }
            if (this.settings.has('fields') && !_.isEmpty(this.settings.get('fields'))) {
                // The field list in the settings will be a list of strings, which need to be used to
                // reduce the full data set into only the fields in the list (and their associated results).
                var settingsFields = this.settings.get('fields');

                // Begin by mapping each entry in the field list to the matching entry in the data,
                // preserving the structure of the fields in the data (with metadata or without).
                fields = _(settingsFields).chain().map(function(fieldName) {
                    // If the field is a wildcard, insert all fields from the raw data except those that already
                    // in the field list. The nested array will be flattened out later.
                    if (fieldName === '*') {
                        return _(data.fields).select(function(dataField) {
                            return !_(settingsFields).contains(toFieldName(dataField));
                        });
                    }
                    // Find the matching field entry, or if one doesn't exist create a dummy entry with the correct structure.
                    var matchingField = _(data.fields).find(function(field) {
                        return toFieldName(field) === fieldName;
                    });
                    return matchingField || createFieldEntry(fieldName, data.fields);
                }).flatten().unique(toFieldName).value();

                // Create a dictionary of each field name mapped to its index in the raw data,
                // which will be used to manipulate the rows of data.
                var fieldsIdx = {};
                _(data.fields).each(function(dataField, i) {
                    fieldsIdx[toFieldName(dataField)] = i;
                });
                // Map over each row of raw data, using the dictionary from above to keep
                // only the values that correspond to fields in the field list.
                rows = _(data.rows).map(function(row) {
                    return _(fields).map(function(field) {
                        var fieldName = toFieldName(field);
                        return fieldsIdx.hasOwnProperty(fieldName) ? row[fieldsIdx[fieldName]] : null;
                    });
                });
                data.rows = rows;
                data.fields = fields;
            }
            return data;
        },

        getDrilldownData: function(e) {
            var data = BaseVisualizationView.prototype.getDrilldownData.apply(this, arguments);
            // Get all original row data, as the original rowContext only had data
            // for the visible fields in the table.
            var originalRows = this.resultsModel ? this.resultsModel.data().rows : null;
            var rowIndex = e.rowIndex;
            if (originalRows && (rowIndex < originalRows.length)) {
                var originalRow = originalRows[rowIndex];
                _(this.resultsModel.data().fields).each(function(originalField, i) {
                    var originalFieldName = _.isString(originalField) ? originalField : originalField.name;
                    data["row." + originalFieldName] = originalRow[i];
                });
            }
            return data;
        },

        onDrilldown: function(e, payload) {
            var model = this.resultsModel.collection().at(e.rowIndex);
            if (model) {
                var key = e.hasOwnProperty("name2") ? e.name2 : e.name;
                var value = e.hasOwnProperty("value2") ? e.value2 : e.value;
                var originalEvent = e.originalEvent;

                this.trigger("clicked:row click:row", _.extend({
                    model: model,
                    index: e.rowIndex,
                    originalEvent: originalEvent,
                    component: this,
                    event: originalEvent
                }, payload), this);

                this.trigger("clicked:cell click:cell", _.extend({
                    model: model,
                    index: e.rowIndex,
                    column: e.cellIndex,
                    key: key,
                    value: value,
                    originalEvent: originalEvent,
                    event: originalEvent,
                    component: this
                }, payload), this);
            }
        },

        onFieldsChanged: function(){
            this.transformFieldsToArray();
            if (this.searchData) {
                this.searchData.set(this.formatData(this.resultsModel.data()));
            }
        },

        transformFieldsToArray: function(){
            var fields = this.settings.get('fields');
            if (_.isString(fields)) {
                fields = DashboardParser.parseFieldsList($.trim(fields));
                this.settings.set('fields', fields, { silent: true });
            }
        },

        remove: function() {
            if(this._settingsSync) {
                this._settingsSync.destroy();
            }
            return BaseVisualizationView.prototype.remove.call(this);
        },

        /**
         * Adds a row renderer to the table.
         * @param {Object} renderer - An instance of your custom row renderer.
         */
        addRowExpansionRenderer: function(rowExpansionRenderer) {
            // consumer of the collection validates rowExpansionRenderer
            this.rowExpansionRendererCollection.unshift({ renderer: rowExpansionRenderer });
            if (this._rendered) {
                this.render();
            }
        },

        /**
         * Removes a row renderer from the table.
         * @param {Object} renderer - An instance of your custom row renderer.
         */
        removeRowExpansionRenderer: function(rowExpansionRenderer) {
            this.rowExpansionRendererCollection.remove(
                this.rowExpansionRendererCollection.findWhere({ renderer: rowExpansionRenderer })
            );
            if (this._rendered) {
                this.render();
            }
        },

        /**
         * Gets an array of the row renderers that have been added to the table.
         * @return {Object[]}
         */
        getRowExpansionRenderers: function() {
            return this.rowExpansionRendererCollection.pluck('renderer');
        },

        /**
         * Expands the row specified by <i>index</i>, and collapses the currently-expanded row.
         * @param {Number} index - The row index.
         */
        expandRow: function(rowIndex) {
            // internal method validates rowIndex
            this.viz.expandRow(rowIndex);
        },

        /**
         * Collapses the currently-expanded row.
         */
        collapseRow: function() {
            this.viz.collapseRow();
        },

        /**
         * Adds a cell renderer to the table.
         * @param {Object} renderer - An instance of your custom row renderer.
         */
        addCellRenderer: function(cellRenderer) {
            // consumer of the collection validates cellRenderer
            this.cellRendererCollection.unshift({ renderer: cellRenderer });
            if (this._rendered) {
                this.render();
            }
        },

        /**
         * Removes a cell renderer from the table.
         * @param {Object} renderer - An instance of your custom row renderer.
         */
        removeCellRenderer: function(cellRenderer) {
            this.cellRendererCollection.remove(
                this.cellRendererCollection.findWhere({ renderer: cellRenderer })
            );
            if (this._rendered) {
                this.render();
            }
        },

        /**
         * Gets an array of the cell renderers that have been added to the table.
         * @return {Object[]}
         */
        getCellRenderers: function() {
            return this.cellRendererCollection.pluck('renderer');
        }
    });

    TableView.BaseCellRenderer = BaseCellRenderer;
    TableView.BaseRowExpansionRenderer = BaseRowExpansionRenderer;

    return TableView;
});
