/**
 * @author sfishel
 *
 * Table renderer for search results
 *
 * Child Views:
 *
 * header <views/shared/results_table/ResultsTableHeader> the table header
 * rows <views/shared/results_table/ResultsTableRow> one for each row in the table
 *
 * Custom Events:
 *
 * cellClick - triggered when a cell is clicked for a drilldown action
 *     @param drilldownInfo {Object} {
 *         name {String} the name of the row-split field
 *         value {String} the value of the row-split field for the clicked row
 *         name2 {String} (only applicable if the user did not click on the first cell of the row)
 *                        the name of the column header for the clicked cell
 *         value2 {String} (only applicable if the user did not click on the first cell of the row)
 *                         the value contained in the clicked cell
 *         _span {Integer} (only applicable if the row-split field is time-based)
 *                         the number of seconds that the clicked row represents in time
 *         rowContext {Object} a dictionary with key-value pairs for all of the cells in the clicked row
 *         rowIndex {Integer} index of the row in the table
 *         originalEvent {jQuery Event} the original browser event
 *     }
 *
 *     In the case of a multivalue field, the value that was clicked will appear as 'value2',
 *     but the rowContext will include the entire array of values.
 */

define([
            'jquery',
            'underscore',
            'module',
            'collections/Base',
            'views/shared/viz/Base',
            './ColumnEditorPopTart',
            './ResultsTableHeader',
            './ResultsTableRow',
            './ResultsTableSummaryRow',
            'views/shared/delegates/ColumnSort',
            'views/shared/delegates/TableDock',
            'views/shared/delegates/TableHeadStatic',
            'helpers/grid/RowIterator',
            'splunk.util',
            'util/general_utils',
            'util/time',
            'util/math_utils',
            'util/numeral',
            'jquery.sparkline',
            './renderers/BaseCellRenderer',
            './renderers/BaseRowExpansionRenderer',
            './renderers/NullCellRenderer',
            './renderers/NumberCellRenderer',
            './renderers/SparklineCellRenderer',
            './renderers/StringCellRenderer',
            './renderers/TimeCellRenderer',
            'splunk/parsers/ArrayParser',
            'splunk/parsers/CellRendererParser',
            'util/console',
            './ResultsTableMaster.pcss'
        ],
        function(
            $,
            _,
            module,
            BaseCollection,
            VisualizationBase,
            ColumnEditorPopTart,
            ResultsTableHeader,
            ResultsTableRow,
            ResultsTableSummaryRow,
            ColumnSort,
            TableDock,
            TableHeadStatic,
            RowIterator,
            splunkUtils,
            generalUtils,
            timeUtils,
            mathUtils,
            numeral,
            _sparkline,
            BaseCellRenderer,
            BaseRowExpansionRenderer,
            NullCellRenderer,
            NumberCellRenderer,
            SparklineCellRenderer,
            StringCellRenderer,
            TimeCellRenderer,
            ArrayParser,
            CellRendererParser,
            console,
            css
        ) {

    var DATA_FIELD_REGEX = /^[^_]|^_time$|^_raw$/;

    var TIMESTAMP_FORMATS = timeUtils.RESULTS_TIMESTAMP_FORMATS;

    var SUMMARY_ATTRIBUTES = [
        'display.statistics.totalsRow',
        'display.statistics.percentagesRow'
    ];

    var REPORT_FORMAT_ATTRIBUTES = [
        'display.statistics.wrap',
        'display.statistics.rowNumbers',
        'display.statistics.overlay',
        'display.statistics.sparkline.format'
    ].concat(SUMMARY_ATTRIBUTES);

    var MV_SUBCELL_SELECTOR = '.' + ResultsTableRow.MV_SUBCELL_CLASSNAME;

    var ENTER_KEY = 13;

    return VisualizationBase.extend({

        moduleId: module.id,

        events: {
            'click th .btn-col-format': function(e) {
                this.handleColumnFormatClick($(e.currentTarget), e);
            },
            'mouseover tbody td': function(e) {
                this.handleCellMouseover($(e.target));
            },
            'mouseout tbody td': function(e) {
                this.handleCellMouseout($(e.target));
            },
            'mousedown tbody td': function(e) {
                this.handleCellMousedown($(e.target), e);
            },
            'click tbody td': function(e) {
                this.handleCellClick($(e.target), e);
            },
            'keypress tbody td': function(e) {
                if(e.which === ENTER_KEY) {
                    this.handleCellClick($(e.target), e);
                }
            },
            'keypress tbody tr': function(e) {
                if(e.which === ENTER_KEY) {
                    // treat the target as the first cell in the row
                    this.handleCellClick($(e.target).find('td[data-cell-index]').first(), e);
                }
            }
        },

        /**
         * @constructor
         * @param options {Object} {
         *    model: {
         *        searchData <models/services/search/jobs/ResultsRow> the search results in row-major format
         *        searchDataParams {Model} a model containing the fetch data for the results
         *        config <model> the table format settings
         *    },
         *    collection: {
         *        customCellRenderers {Collection} custom cell renderers to be used by this table
         *        customRowExpansionRenderers {Collection} custom row expansion renderers to be used by this table
         *    }
         *    {String} enableTableDock: (Optional) whether or not to dock table header. defalut true,
         *    {Number} tableDockOffset: (Optional) the amount to offset the table header from the top when docked
         *    {Boolean} sortableFields (Optional) disable/enable the sortable fields. default is true
         * }
         */
        initialize: function(options) {
            VisualizationBase.prototype.initialize.call(this, options);
            var defaults = {
                sortKeyAttr: 'sortKey',
                sortDirAttr: 'sortDirection',
                sortableFields: true,
                sortableFieldsExcluded: [],
                countAttr: 'count',
                offsetAttr: 'offset',
                numRowSplits: 1,
                headerClass: ResultsTableHeader,
                enableTableDock: true
            };
            this.options = $.extend(true, defaults, this.options);


            if(this.options.enableStaticHeader && this.options.enableTableDock) {
                throw new Error('Static header and docking header cannot be enabled at the same time');
            }

            // Since this view is often subclassed, add a class here as a hook for CSS styles, as opposed to the one
            // derived from its module id.
            this.$el.addClass('results-table');

            this.collection = this.collection || {};
            if (!this.collection.customCellRenderers) {
                this.collection.customCellRenderers = new BaseCollection();
            }
            this.collection.customCellRenderers.each(function(model) {
                this.ensureValidCellRenderer(model.get('renderer'));
            }, this);
            if (!this.collection.customRowExpansionRenderers) {
                this.collection.customRowExpansionRenderers = new BaseCollection();
            }
            this.collection.customRowExpansionRenderers.each(function(model) {
                this.ensureValidRowExpansionRenderer(model.get('renderer'));
            }, this);

            this._cellRenderers = [];
            this._formatCellRenderers = [];
            this._rowExpansionRenderers = [];

            // delegates
            this.children.columnSort = new ColumnSort({
                el: this.el,
                model: this.model.searchDataParams,
                autoUpdate: true,
                sortKeyAttr: this.options.sortKeyAttr,
                sortDirAttr: this.options.sortDirAttr
            });
            if (this.options.enableTableDock) {
                this.children.tableDock = new TableDock({ el: this.el, offset: this.options.tableDockOffset, disableAutoResize: true });
                this.listenTo(this.children.tableDock, 'headCellClick', this.handleDetachedHeadClick);
            }

            this.addCellRenderer(new StringCellRenderer());
            this.addCellRenderer(new TimeCellRenderer());
            this.addCellRenderer(new NumberCellRenderer());
            this.addCellRenderer(new SparklineCellRenderer());
            this.addCellRenderer(new NullCellRenderer());

            this.rawFields = [];
            this.rawRows = [];
            this.dataFields = [];
            this.dataRows = [];

            this.columnTypes = {};
            this.fieldHeatRanges = {};
            this.fieldHeatOffsets = {};
            this.fieldExtremes = {};
            this.fieldTimestampFormats = {};
            this.sparklineFormatSettings = {};

            this.syncFormatAndMetadata();
            this.updateFormatSettings();

            this.listenTo(this.collection.customCellRenderers, 'add', function(model) {
                this.ensureValidCellRenderer(model.get('renderer'));
            });
            this.listenTo(this.collection.customRowExpansionRenderers, 'add', function(model) {
                this.ensureValidRowExpansionRenderer(model.get('renderer'));
            });
        },

        activate: function(options) {
            if (this.active) {
                return VisualizationBase.prototype.activate.apply(this, arguments);
            }
            if (this.options.disable) {
                this.$el.addClass("table-disabled");
            }
            return VisualizationBase.prototype.activate.apply(this, arguments);
        },

        deactivate: function(options) {
            if (this.active) {
                this.collapseRow();
            }
            return VisualizationBase.prototype.deactivate.apply(this, arguments);
        },

        /*
         * To be used internally by this view and its subclasses.  To specify a custom cell
         * renderer from external code, use the customCellRenderers constructor argument.
         */
        addCellRenderer: function(cellRenderer, isFormatter) {
            this.ensureValidCellRenderer(cellRenderer);
            if (cellRenderer instanceof BaseCellRenderer) {
                this.listenTo(cellRenderer, "change", this._onCellRendererChange);
            }
            if (isFormatter === true) {
                this._formatCellRenderers.push(cellRenderer);
            } else {
                this._cellRenderers.unshift(cellRenderer);
            }
            this.invalidate('updateViewPass');
        },

        removeCellRenderer: function(cellRenderer, isFormatter) {
            this.ensureValidCellRenderer(cellRenderer);
            var cellRenderers, i, l;
            if (isFormatter === true) {
                cellRenderers = this._formatCellRenderers;
                for (i = cellRenderers.length - 1; i >= 0; i--) {
                    if (cellRenderers[i] === cellRenderer) {
                        if (cellRenderer instanceof BaseCellRenderer) {
                            this.stopListening(cellRenderer, "change", this._onCellRendererChange);
                        }
                        cellRenderers.splice(i, 1);
                        this.invalidate('updateViewPass');
                        break;
                    }
                }
            } else {
                cellRenderers = this._cellRenderers;
                for (i = 0, l = cellRenderers.length; i < l; i++) {
                    if (cellRenderers[i] === cellRenderer) {
                        if (cellRenderer instanceof BaseCellRenderer) {
                            this.stopListening(cellRenderer, "change", this._onCellRendererChange);
                        }
                        cellRenderers.splice(i, 1);
                        this.invalidate('updateViewPass');
                        break;
                    }
                }
            }
        },

        ensureValidCellRenderer: function(cellRenderer) {
            if ((typeof cellRenderer !== "function") && !(cellRenderer instanceof BaseCellRenderer)) {
                throw new Error("Parameter cellRenderer must be a function or an instance of views/shared/results_table/renderers/BaseCellRenderer.");
            }
        },

        getCellRenderers: function(isFormatter) {
            if (isFormatter === true) {
                return this._formatCellRenderers.concat();
            } else {
                return this.collection.customCellRenderers.pluck('renderer').concat(this._cellRenderers);
            }
        },

        /*
         * To be used internally by this view and its subclasses.  To specify a custom row expansion
         * renderer from external code, use the customRowExpansionRenderers constructor argument.
         */
        addRowExpansionRenderer: function(rowExpansionRenderer) {
            this.ensureValidRowExpansionRenderer(rowExpansionRenderer);
            if (rowExpansionRenderer instanceof BaseRowExpansionRenderer) {
                this.listenTo(rowExpansionRenderer, "change", this._onRowExpansionRendererChange);
            }
            this._rowExpansionRenderers.unshift(rowExpansionRenderer);
        },

        removeRowExpansionRenderer: function(rowExpansionRenderer) {
            this.ensureValidRowExpansionRenderer(rowExpansionRenderer);
            var rowExpansionRenderers = this._rowExpansionRenderers;
            for (var i = 0, l = rowExpansionRenderers.length; i < l; i++) {
                if (rowExpansionRenderers[i] === rowExpansionRenderer) {
                    if (rowExpansionRenderer instanceof BaseRowExpansionRenderer) {
                        this.stopListening(rowExpansionRenderer, "change", this._onRowExpansionRendererChange);
                    }
                    rowExpansionRenderers.splice(i, 1);
                    break;
                }
            }
        },

        getRowExpansionRenderers: function() {
            return this.collection.customRowExpansionRenderers.pluck('renderer').concat(this._rowExpansionRenderers);
        },

        ensureValidRowExpansionRenderer: function(rowExpansionRenderer) {
            if ((typeof rowExpansionRenderer !== "function") && !(rowExpansionRenderer instanceof BaseRowExpansionRenderer)) {
                throw new Error("Parameter rowExpansionRenderer must be a function or an instance of views/shared/results_table/renderers/BaseCellRenderer.");
            }
        },

        expandRow: function(rowIndex) {
            if (typeof rowIndex !== "number") {
                throw new Error("Parameter rowIndex must be a Number.");
            }

            this.collapseRow();

            var rowView = this.children["row_" + rowIndex];
            if (!rowView) {
                return;
            }

            var rowData = rowView.getRowData();
            var rowExpansionRenderers = this.getRowExpansionRenderers();
            var rowExpansionRenderer;
            for (var i = 0, l = rowExpansionRenderers.length; i < l; i++) {
                rowExpansionRenderer = rowExpansionRenderers[i];
                if (rowExpansionRenderer.canRender(rowData)) {
                    this._expandedRow = rowView;
                    this._expandedRowIndex = rowIndex;
                    rowView.expandRow(rowExpansionRenderer, rowData);
                    break;
                }
            }
        },

        collapseRow: function() {
            var rowView = this._expandedRow;
            if (!rowView) {
                return;
            }

            this._expandedRowIndex = -1;
            this._expandedRow = null;
            rowView.collapseRow();
        },

        getExpandedRowIndex: function() {
            return (this._expandedRowIndex >= 0) ? this._expandedRowIndex : -1;
        },

        remove: function() {
            this.collapseRow();
            return VisualizationBase.prototype.remove.apply(this, arguments);
        },

        // Unlike other visualizations, multiple data structures are parsed from the raw data.
        // So formatData creates instance members to be used in updateView, instead of returning something.
        formatData: function() {
            this.rawFields = this.getFieldList();
            this.rawRows = this.model.searchData.get('rows') || [];
            this.dataFields = _(this.rawFields).filter(this.isDataField, this);
            this.dataRows = _(this.rawRows).map(function(row) {
                return _(row).filter(function(data, i) { return this.isDataField(this.rawFields[i]); }, this);
            }, this);
            this.resultsAsColumns = this.getResultsAsColumns();
            this.updateColumnTypes(this.resultsAsColumns);
        },

        syncFormatAndMetadata: function() {
            var relationship = {
                sortKey: 'display.statistics.sortColumn',
                sortDirection: 'display.statistics.sortDirection',
                count: 'display.prefs.statistics.count',
                offset: 'display.prefs.statistics.offset'
            };
            _(relationship).each(function(formatKey, metadataKey) {
                if (this.model.config.has(formatKey)) {
                    this.model.searchDataParams.set(metadataKey, this.model.config.get(formatKey));
                }
                this.listenTo(this.model.config, 'change:' + formatKey, function(model, newVal) {
                    if (this.model.searchDataParams.get(metadataKey) !== newVal) {
                        this.model.searchDataParams.set(metadataKey, newVal);
                    }
                });
                this.listenTo(this.model.searchDataParams, 'change:' + metadataKey, function(model, newVal) {
                    if (this.model.config.get(formatKey) !== newVal) {
                        this.model.config.set(formatKey, newVal);
                    }
                });
            }, this);

            _(SUMMARY_ATTRIBUTES).each(function(attr) {
                this.listenTo(this.model.config, 'change:' + attr, function() {
                    this.model.searchDataParams.set('add_summary_to_metadata', this.needsSummaryMetadata());
                });
            }, this);
            if (this.needsSummaryMetadata()) {
                this.model.searchDataParams.set('add_summary_to_metadata', true);
            }
        },

        /* Consult the whitelist of which report attributes require the table to be updated, only if one of
         * those has changed is the updateView pass invalidated.
         *
         * The updateView pass will also update the drilldown classes, but those can be updated in-place
         * if they are the only thing that changed.
         *
         * There is currently no report attribute change that requires re-formatting the data.
         */
        onConfigChange: function(changedAttributes) {
            var formatAttributes = REPORT_FORMAT_ATTRIBUTES;
            if (this.options.enableEditingReportProperty) {
                formatAttributes = formatAttributes.concat(this.options.enableEditingReportProperty);
            }

            var needsUpdate = !_(changedAttributes).chain().pick(formatAttributes).isEmpty().value();
            if (needsUpdate) {
                if (changedAttributes.hasOwnProperty('display.statistics.sparkline.format')) {
                    this.updateFormatSettings();
                }
                this.invalidate('updateViewPass');
            } else if (changedAttributes.hasOwnProperty('display.statistics.drilldown')) {
                this.updateDrilldownClasses();
            }
        },

        setupView: function() {
            if(this.options.enableStaticHeader) {
                this.$el.html(this.staticHeaderTemplate);
                this.children.staticHead = new TableHeadStatic({
                    el: this.el,
                    flexWidthColumn: false,
                    disableAutoResize: true
                });
                this.listenTo(this.children.staticHead, 'headCellClick', this.handleDetachedHeadClick);
            }
        },

        updateView: function() {
            var html = this.compiledTemplate({
                    wrapResults: splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.wrap')),
                    numDataColumns: this.dataFields.length
                }),
                $html = $(html);

            this.disposeOfChildren();

            if(this.dataFields.length > 0 && this.dataRows.length > 0) {
                console.debug('rendering results table with data:', { fields: this.dataFields, rows: this.dataRows });
                if (!this._areFormattersDeserialized) {
                    this._areFormattersDeserialized = true;
                    this._deserializeFormatters(this._readFormatAttributes());
                }
                this.insertHeader($html, this.dataFields);
                this.insertRows($html, this.dataFields, this.dataRows, this.resultsAsColumns);
                this.children.columnSort.update($html);
            }
            if(this.options.enableStaticHeader) {
                this.$('.scroll-table-wrapper').html($html);
                this.children.staticHead.update();
            }
            else {
                this.$el.html($html);
            }
            try {
                // render the sparklines that have been created with hidden elements or elements not attached to DOM
                $.sparkline_display_visible();
            } catch (e) {
                console.warn('Unable to render sparklines:', e);
            } 
            if(this.children.tableDock) {
                this.children.tableDock.update();
            }

            if (this.options.disable) {
                this.$tableDisabled = $('<div class="table-disabled-screen"></div>');
                this.$el.append(this.$tableDisabled);
            }
            this.updateDrilldownClasses();

            // store a reference to the base table (not any created by delegates)
            this.$table = this.$('table').last();
            this.invalidateReflow();
        },

        reflow: function() {
            if(this.children.tableDock) {
                this.children.tableDock.update();
                this.children.tableDock.handleContainerResize();
            }
            if(this.$tableDisabled && this.$table.length > 0) {
                this.$tableDisabled.width(this.$table[0].scrollWidth || '100%');
            }
            if (this.children.staticHead){
                this.children.staticHead.handleContainerResize();
            }
        },

        onAddedToDocument: function() {
            VisualizationBase.prototype.onAddedToDocument.apply(this, arguments);
            $.sparkline_display_visible();
        },

        onPrintStart: function() {
            // TODO: Remove these onPrintStart/onPrintEnd handlers when print styles are
            // less aggressive at overriding background/foreground colors.
            // This is a temporary hack that adds an !important flag to the inline styles
            // for color formatted table cells so they override the aggressive print styles.
            // The hack is removed in the onPrintEnd handler.

            VisualizationBase.prototype.onPrintStart.apply(this, arguments);

            var tdList = this.$('td.color-formatted');
            var tdStyle;
            for (var i = 0, l = tdList.length; i < l; i++) {
                tdStyle = tdList[i].style;
                if (tdStyle.setProperty && tdStyle.getPropertyValue) {
                    tdStyle.setProperty("color", tdStyle.getPropertyValue("color"), "important");
                    tdStyle.setProperty("background-color", tdStyle.getPropertyValue("background-color"), "important");
                }
            }
        },

        onPrintEnd: function() {
            // Invalidate updateViewPass to restore original rendering.
            this.invalidate('updateViewPass');

            VisualizationBase.prototype.onPrintEnd.apply(this, arguments);
        },

        handleDetachedHeadClick: function(event) {
            var $target = $(event.target), 
                $columnFormatButton = $target.closest('.btn-col-format', $target.closest('th'));
                
            if ($columnFormatButton.length === 0) {
                return;
            }
            this.handleColumnFormatClick($columnFormatButton, event);
        },

        handleColumnFormatClick: function($target, event) {
            event.preventDefault();

            if (this.children.columnEditorPopTart) {
                return;
            }

            // FIXME: this is pretty lame
            var rowNumbers = splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.rowNumbers'));
            var rowExpansion = (this.getRowExpansionRenderers().length > 0);
            var cellIndexOffset = (rowNumbers ? 1 : 0) + (rowExpansion ? 1 : 0);

            var $th = $target.closest("th");
            var index = $th.index() - cellIndexOffset;
            var field = this.dataFields[index];
            if (!field) {
                return;
            }

            this.children.columnEditorPopTart = new ColumnEditorPopTart({
                onHiddenRemove: true,
                ignoreToggleMouseDown: true,
                table: this,
                field: field,
                configModel: this.model.config
            });

            this.listenToOnce(this.children.columnEditorPopTart, 'hidden', function() {
                this.stopListening(this.children.columnEditorPopTart);
                delete this.children.columnEditorPopTart;
                this._writeFormatAttributes(this._serializeFormatters());
                this._selectedColumnIndex = null;
                this.invalidate('updateViewPass');
            });

            this.children.columnEditorPopTart.render().appendTo($('body')).show($target, {
                $toggle: $target
            });

            this._selectedColumnIndex = index;
            this.invalidate('updateViewPass');
        },

        handleCellMouseover: function($target) {
            var drilldown = this.model.config.get('display.statistics.drilldown'),
                rowNumbers = splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.rowNumbers')),
                rowExpansion = (this.getRowExpansionRenderers().length > 0);

            if(drilldown === 'none') {
                return;
            }
            var $cell = $target.closest('td'),
                cellInfo = this.getCellInfo($cell),
                rowView = this.children['row_' + cellInfo.rowIndex];

            // If we didn't get a row view, then we should just stop
            if (!rowView) {
                return;
            }

            if(drilldown === 'cell') {
                // if the cell is multivalue but the mouse is not over one of the subcells, ignore the event
                if($cell.find(MV_SUBCELL_SELECTOR).length > 0 && !$target.is(MV_SUBCELL_SELECTOR)) {
                    return;
                }
                this.children.header.highlightColumn(cellInfo.cellIndex);
                // FIXME: this is pretty lame
                var cellIndexOffset = (rowNumbers ? 1 : 0) + (rowExpansion ? 1 : 0);
                if(this.children.tableDock && this.children.tableDock.$headerTable) {
                    this.children.tableDock.$headerTable.find('th').eq(parseInt(cellInfo.cellIndex, 10) + cellIndexOffset).addClass('highlighted');
                }
                if(this.children.staticHead && this.children.staticHead.$headerTable) {
                    this.children.staticHead.$headerTable.find('th').eq(parseInt(cellInfo.cellIndex, 10) + cellIndexOffset).addClass('highlighted');
                }
                rowView.highlightCell($target, cellInfo.cellIndex);
            }
            else {
                // drilldown === 'row'
                rowView.highlightRow();
            }
        },

        handleCellMouseout: function($target) {
            var drilldown = this.model.config.get('display.statistics.drilldown'),
                rowNumbers = splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.rowNumbers')),
                rowExpansion = (this.getRowExpansionRenderers().length > 0);

            if(drilldown === 'none') {
                return;
            }
            var $cell = $target.closest('td'),
                cellInfo = this.getCellInfo($cell),
                rowView = this.children['row_' + cellInfo.rowIndex];

            // If we didn't get a row view, then we should just stop
            if (!rowView) {
                return;
            }

            if(drilldown === 'cell') {
                // if the cell is multivalue but the mouse did not leave one of the subcells, ignore the event
                if($cell.find(MV_SUBCELL_SELECTOR).length > 0 && !$target.is(MV_SUBCELL_SELECTOR) && !$target.parent().is(MV_SUBCELL_SELECTOR)) {
                    return;
                }
                this.children.header.unHighlightColumn(cellInfo.cellIndex);
                // FIXME: this is pretty lame
                var cellIndexOffset = (rowNumbers ? 1 : 0) + (rowExpansion ? 1 : 0);
                if(this.children.tableDock && this.children.tableDock.$headerTable) {
                    this.children.tableDock.$headerTable.find('th').eq(parseInt(cellInfo.cellIndex, 10) + cellIndexOffset).removeClass('highlighted');
                }
                if(this.children.staticHead && this.children.staticHead.$headerTable) {
                    this.children.staticHead.$headerTable.find('th').eq(parseInt(cellInfo.cellIndex, 10) + cellIndexOffset).removeClass('highlighted');
                }
                rowView.unHighlightCell($target, cellInfo.cellIndex);
            }
            else {
                // drilldown === 'row'
                rowView.unHighlightRow();
            }
        },

        handleCellMousedown: function($target, event) {
            this.mouseDownX = event.pageX;
            this.mouseDownY = event.pageY;
        },

        handleCellClick: function($target, clickEvent) {
            clickEvent.preventDefault();

            // compute mouse deltas, carefully handling missing/invalid mouse coordinates
            var deltaMouseX = (clickEvent.pageX && this.mouseDownX) ? Math.abs(clickEvent.pageX - this.mouseDownX) : 0;
            var deltaMouseY = (clickEvent.pageY && this.mouseDownY) ? Math.abs(clickEvent.pageY - this.mouseDownY) : 0;

            // zero out mouse coordinates to handle cases where mousedown is not triggered (ENTER key press)
            this.mouseDownX = 0;
            this.mouseDownY = 0;

            var $cell = $target.closest('td'),
                cellInfo = this.getCellInfo($cell),
                rowView = this.children['row_' + cellInfo.rowIndex];

            // If we didn't get a row view, then we should just stop
            if (!rowView) {
                return;
            }

            // if mouse deltas are greater than threshold, abort click actions
            var dragThreshold = 2;
            if ((deltaMouseX > dragThreshold) || (deltaMouseY > dragThreshold)) {
                // trigger a custom event in case observers or subclasses want to add text highlighting behavior
                this.trigger('cellHighlight', $target, clickEvent);
                return;
            }

            if ($cell.hasClass(ResultsTableRow.ROW_EXPANSION_CLASSNAME)) {
                var $row = $cell.closest('tr');
                var rowIndex = Number($row.attr(ResultsTableRow.ROW_INDEX_ATTR));
                if (this.getExpandedRowIndex() != rowIndex) {
                    this.expandRow(rowIndex);
                } else {
                    this.collapseRow();
                }
                return;
            }

            var drilldown = this.model.config.get('display.statistics.drilldown');
            if(drilldown === 'none') {
                return;
            }

            var isMultiValue = $cell.find(MV_SUBCELL_SELECTOR).length > 0;

            // if the cell is multivalue but the click was not on one of the subcells, ignore the event
            if(drilldown === 'cell' && isMultiValue && !$target.is(MV_SUBCELL_SELECTOR) && !$target.parent().is(MV_SUBCELL_SELECTOR)) {
                return;
            }

            if(isMultiValue) {
                cellInfo.mvIndex = this.getMultiValueIndex($target);
            }

            var drilldownPayload = this.generateDrilldownPayload(cellInfo, clickEvent, drilldown);
            if (!drilldownPayload) {
                return;
            }

            this.emitDrilldownEvent(drilldownPayload);
        },

        generateDrilldownPayload: function(cellInfo, clickEvent, type) {
            // If somebody clicked on an invalid row, we cannot create a drilldown
            // event for them.

            if(cellInfo.rowIndex === undefined || cellInfo.cellIndex === undefined) {
                return null;
            }

            var rowIndex = cellInfo.rowIndex,
                cellIndex = cellInfo.cellIndex,
                rowName = this.dataFields[0],
                rowSplitIsTime = this.isTimeField(rowName),
                rowValue = this.dataRows[rowIndex][0],
                drilldownInfo = {
                    name: rowName,
                    value: rowSplitIsTime ? splunkUtils.getEpochTimeFromISO(rowValue) : rowValue,
                    type: type,
                    originalEvent: clickEvent
                };

            // for a time-based row split, add the _span information for the row
            if(rowSplitIsTime) {
                var spanSeries = this.getSpanSeriesForTimeField(rowName);
                if(spanSeries) {
                    drilldownInfo._span = parseFloat(spanSeries[rowIndex]);
                }
                else {
                    // If there is no span series (we are drilling into discrete time points), set the span to one
                    // millisecond since this is the finest granularity the UI has.
                    drilldownInfo._span = 0.001;
                }
            }

            // can only add a name2/value2 if the click was not on the first cell of the row, unless it's a multi-value field
            var isMultiValue = _.isArray(this.dataRows[rowIndex][cellIndex]);
            if((cellIndex > this.options.numRowSplits - 1) || isMultiValue) {
                drilldownInfo.name2 = this.dataFields[cellIndex];
                // if value2 is an array (a multivalue field), use the mvIndex to pick the right value (or just take the first one)
                drilldownInfo.value2 = isMultiValue ? this.dataRows[rowIndex][cellIndex][cellInfo.mvIndex || 0] :
                    this.dataRows[rowIndex][cellIndex];
            }

            // add in the row context information
            var rowContext = {};
            _(this.dataRows[rowIndex]).each(function(value, i) {
                rowContext['row.' + this.dataFields[i]] = value;
            }, this);
            drilldownInfo.rowContext = rowContext;
            drilldownInfo.rowIndex = parseInt(rowIndex, 10);
            drilldownInfo.cellIndex = parseInt(cellIndex, 10);
            drilldownInfo.originalEvent = clickEvent;

            return drilldownInfo;
        },

        emitDrilldownEvent: function(payload) {
            if(!payload) {
                return;
            }
            this.trigger('cellClick drilldown', payload);
        },

        insertHeader: function($rootEl, dataFields) {
            this.children.header = new this.options.headerClass(this.generateHeaderViewOptions(dataFields));
            this.children.header.render().replaceAll($rootEl.find('thead'));
        },

        generateHeaderViewOptions: function(dataFields) {
            return ({
                rowNumbers: splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.rowNumbers')),
                rowExpansion: (this.getRowExpansionRenderers().length > 0),
                fields: dataFields,
                columnTypes: this.columnTypes,
                sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                sortableFields: this.options.sortableFields,
                sortableFieldsExcluded: this.options.sortableFieldsExcluded,
                enableEditing: this.options.enableEditingReportProperty ? (this.model.config.get(this.options.enableEditingReportProperty) === true) : (this.options.enableEditing === true),
                selectedColumnIndex: this._selectedColumnIndex
            });
        },

        insertRows: function($rootEl, dataFields, dataRows, dataColumns) {
            var dataOverlay = this.model.config.get('display.statistics.overlay'),
                showRowNumbers = splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.rowNumbers')),
                showTotalsRow = splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.totalsRow')),
                showPercentagesRow = splunkUtils.normalizeBoolean(this.model.config.get('display.statistics.percentagesRow')),
                rowExpansion = (this.getRowExpansionRenderers().length > 0);

            if(dataOverlay === 'heatmap') {
                this.updateHeatRanges(dataColumns);
            }
            else if(dataOverlay === 'highlow') {
                this.updateExtremes(dataColumns);
            }

            if(_(this.columnTypes).contains('timestamp')) {
                this.updateFieldTimestampFormats(dataFields, dataRows, dataColumns);
            }

            var rowIterator = new RowIterator({
                    offset: this.model.searchData.get('init_offset') || 0
                }),
                $tbody = $rootEl.find('tbody');

            // compute totals and percentages
            var fieldMetadataList = _(this.getFieldMetadataList()).filter(function(metadata) {
                return this.isDataField(metadata.name);
            }, this);
            var totals = _(fieldMetadataList).map(function(metadata) {
                return _(metadata).has("summary.sum") ? Number(metadata["summary.sum"]) : null;
            });
            var sum = _(totals).reduce(function(memo, num) {
                return (num != null) ? (memo + num) : memo;
            }, 0);
            var percentages = _(totals).map(function(num) {
                if (num == null) {
                    return null;
                } else if (sum > 0) {
                    return numeral((num / sum) * 100).format("0.[0]") + "%";
                } else {
                    return "0%";
                }
            });

            // render data rows
            rowIterator.eachRow(dataRows, function(row, i, rowNumber) {
                var viewOptions = {
                    table: this,
                    fields: dataFields,
                    values: row,
                    cells: this.generateCellObjects(row, dataFields, dataOverlay, i),
                    dataOverlay: dataOverlay,
                    rowIndex: i,
                    numRowSplits: this.options.numRowSplits,
                    rowExpansion: rowExpansion,
                    splitHighlight: this.options.splitHighlight
                };
                if(showRowNumbers) {
                    viewOptions.rowNumber = rowNumber;
                }
                var rowView = this.children['row_' + i] = new ResultsTableRow(viewOptions);
                rowView.render().appendTo($tbody);
            }, this);

            // render totals row, if enabled
            if (showTotalsRow) {
                this.children['row_totals'] = new ResultsTableSummaryRow({
                    table: this,
                    cells: this.generateCellObjects(totals, dataFields),
                    hasRowExpansion: rowExpansion,
                    hasRowNumber: showRowNumbers
                }).render().appendTo($tbody);
            }

            // render percentages row, if enabled
            if (showPercentagesRow) {
                this.children['row_percentages'] = new ResultsTableSummaryRow({
                    table: this,
                    cells: this.generateCellObjects(percentages, dataFields),
                    hasRowExpansion: rowExpansion,
                    hasRowNumber: showRowNumbers
                }).render().appendTo($tbody);
            }
        },

        generateCellObjects: function(row, fields, dataOverlay, rowNumber) {
            return _(row).map(function(value, i) {
                var field = fields[i];
                // TODO add configured format
                return ({
                    value: value,
                    field: field,
                    dataOverlay: dataOverlay,
                    columnType: this.columnTypes[field] || 'string',
                    heatRange: this.fieldHeatRanges[field],
                    heatOffset: this.fieldHeatOffsets[field],
                    extremes: this.fieldExtremes[field],
                    timestampFormat: this.fieldTimestampFormats[field],
                    sparklineFormat: this.sparklineFormatSettings[field],
                    index: i
                });
            }, this);
        },

        disposeOfChildren: function() {
            this.collapseRow();
            _(this.children).each(function(child, name) {
                if(name === 'header' || name.substr(0, 4) === 'row_') {
                    child.remove();
                    delete this.children[name];
                }
            }, this);
        },

        getResultsAsColumns: function() {
            var columns = {},
                rows = this.model.searchData.get('rows') || [];

            // make 'columns' into a dictionary of field name to array of values in the column
            _(this.getFieldList()).each(function(field, i) {
                columns[field] = _(rows).pluck(i);
            });
            return columns;
        },

        updateDrilldownClasses: function() {
            var drilldown = this.model.config.get('display.statistics.drilldown'),
                $table = this.$('.table'),
                $rows = $table.find('tbody > tr'),
                $cells = $table.find('tbody > tr > td'),
                $mvSubCells = $cells.find('.multivalue-subcell');

            if(drilldown === 'none') {
                $table.removeClass('table-drilldown table-drilldown-row table-drilldown-cell');
                $rows.removeAttr('tabindex');
                $cells.removeAttr('tabindex');
                $mvSubCells.removeAttr('tabindex');
            }
            else if(drilldown === 'cell') {
                $table.addClass('table-drilldown table-drilldown-cell').removeClass('table-drilldown-row');
                $rows.removeAttr('tabindex');
                $cells.attr('tabindex', '0');
                $mvSubCells.attr('tabindex', '0');
            }
            else {
                // drilldown === 'row'
                $table.addClass('table-drilldown table-drilldown-row').removeClass('table-drilldown-cell');
                $rows.attr('tabindex', '0');
                $cells.removeAttr('tabindex');
                $mvSubCells.removeAttr('tabindex');
            }

            $table.find('.row-expansion-toggle').removeAttr('tabindex');
            $table.find('tbody > tr.shared-resultstable-resultstablesummaryrow').removeAttr('tabindex');
            $table.find('tbody > tr.shared-resultstable-resultstablesummaryrow > td').removeAttr('tabindex');
        },

        updateFormatSettings: function() {
            var settings = this.sparklineFormatSettings = {};
            if(this.model.config.has('display.statistics.sparkline.format')) {
                _.extend(settings, this.model.config.get('display.statistics.sparkline.format'));
            }
        },

        updateColumnTypes: function(columns) {
            this.columnTypes = {};
            _(columns).each(function(column, field) {
                // non-data fields (i.e. _span) do not get assigned a column type
                if (!this.isDataField(field)) {
                    return;
                }
                if (this.isTimeField(field)) {
                    this.columnTypes[field] = 'timestamp';
                } else if (this.isSparklineData(column)) {
                    this.columnTypes[field] = 'sparkline';
                } else if (generalUtils.valuesAreNumeric(column)) {
                    this.columnTypes[field] = 'number';
                } else {
                    this.columnTypes[field] = 'string';
                }
            }, this);
        },

        updateHeatRanges: function(columns) {
            // create a data structure that holds the adjusted range (5th percentile to 95th) for each numeric field
            // the current implementation applies the same global heat delta to all numeric series
            // but the interface is designed so that different deltas could be applied to different columns in future
            var allNumericValues = this.getAllNumericValues(columns),
                bounds = generalUtils.getPercentiles(allNumericValues.sort(function(a, b) { return a - b; }), 0.05, 0.95),
                heatRange = bounds.upper - bounds.lower,
                heatOffset = bounds.lower;

            this.fieldHeatRanges = {};
            this.fieldHeatOffsets = {};

            _(columns).each(function(column, field) {
                if(this.columnTypes[field] === 'number') {
                    this.fieldHeatRanges[field] = heatRange;
                    this.fieldHeatOffsets[field] = heatOffset;
                }
            }, this);
        },

        updateExtremes: function(columns) {
            // create a data structure that holds the extremes (min and max) for each numeric field
            // the current implementation applies the same global extremes to all numeric series
            // but the interface is designed so that different extremes could be applied to different columns in future
            var allNumericValues = this.getAllNumericValues(columns),
                extremes = {
                    min: _(allNumericValues).chain().without(null).min().value(),
                    max: _(allNumericValues).max()
                };

            this.fieldExtremes = {};
            _(columns).each(function(column, field) {
                if(this.columnTypes[field] === 'number') {
                    this.fieldExtremes[field] = extremes;
                }
            }, this);
        },

        // used for calculating heat deltas and extremes
        // finds all columns that contain numeric data, then returns all of their contents as a single flattened array
        getAllNumericValues: function(columns) {
            var normalizeToNumber = function(value) {
                // convert to null if the value can't be parsed to a number
                return mathUtils.strictParseFloat(value) || null;
            };

            // find all of the columns that have been deemed numeric, flatten, then normalize all values to numbers
            return _(columns).chain()
                .filter(function(column, field) { return this.columnTypes[field] === 'number'; }, this)
                // this is a deep flattening operation, so multi-value fields will also be flattened out
                .flatten()
                .map(normalizeToNumber)
                .value();
        },

        updateFieldTimestampFormats: function(fields, rows, columns) {
            this.fieldTimestampFormats = {};
            _(fields).each(function(field, i) {
                if(this.isTimeField(field)) {
                    var labelGranularity = timeUtils.determineLabelGranularity(columns[field], this.getSpanSeriesForTimeField(field));
                    this.fieldTimestampFormats[field] = TIMESTAMP_FORMATS[labelGranularity];
                }
            }, this);
        },

        _onCellRendererChange: function() {
            this.invalidate('updateViewPass');
        },

        _onRowExpansionRendererChange: function() {
            this.invalidate('updateViewPass');
        },

        _deserializeFormatters: function(attributes) {
            var cellRendererArrayParser = ArrayParser.getInstance(CellRendererParser.getInstance());
            var formatters = cellRendererArrayParser.deserialize(attributes);
            if (formatters) {
                var formatter;
                for (var i = 0, l = formatters.length; i < l; i++) {
                    formatter = formatters[i];
                    if (formatter) {
                        this.addCellRenderer(formatter, true);
                    }
                }
            }
        },

        _serializeFormatters: function() {
            var cellRendererArrayParser = ArrayParser.getInstance(CellRendererParser.getInstance());
            var formatters = this.getCellRenderers(true);
            return cellRendererArrayParser.serialize(formatters);
        },

        _readFormatAttributes: function() {
            var attributes = this.model.config.toJSON();
            var formatAttributes = {};
            var formatPrefix = "display.statistics.format.";
            _.each(attributes, function(value, key) {
                if (key.substring(0, formatPrefix.length) === formatPrefix) {
                    formatAttributes[key.substring(formatPrefix.length)] = value;
                }
            });
            return formatAttributes;
        },

        _writeFormatAttributes: function(attributes) {
            var oldAttributes = this._readFormatAttributes();
            var newAttributes = {};

            // copy attributes that have changed from oldAttributes
            _.each(attributes, function(value, key) {
                if (!_.has(oldAttributes, key) || (oldAttributes[key] !== value)) {
                    newAttributes[key] = value;
                }
                delete oldAttributes[key];
            });

            // empty attributes that are no longer used
            _.each(oldAttributes, function(value, key) {
                if (value != "") {
                    newAttributes[key] = "";
                }
            });

            // add prefix and save
            if (!_.isEmpty(newAttributes)) {
                var formatAttributes = {};
                var formatPrefix = "display.statistics.format.";
                _.each(newAttributes, function(value, key) {
                    formatAttributes[formatPrefix + key] = value;
                });
                this.model.config.set(formatAttributes);
                if (this.options.saveOnApply === true) {
                    this.model.config.save();
                }
            }
        },

        // TODO [sff] a lot of these next methods should probably be extracted into a share-able helper

        // helper to normalize getting the list of field names
        // depending on whether 'show_metadata=true' was used to fetch the results
        // the "fields" could be a list of string names or a list of objects with a "name" property
        getFieldList: function() {
            return _(this.model.searchData.get('fields') || []).map(function(field) {
                return _(field).isString() ? field : field.name;
            });
        },

        getFieldMetadataList: function() {
            return _(this.model.searchData.get('fields') || []).map(function(field) {
                return _(field).isString() ? { name: field } : _(field).clone();
            });
        },

        needsSummaryMetadata: function() {
            var config = this.model.config;
            for (var i = 0, l = SUMMARY_ATTRIBUTES.length; i < l; i++) {
                if (splunkUtils.normalizeBoolean(config.get(SUMMARY_ATTRIBUTES[i]))) {
                    return true;
                }
            }
            return false;
        },

        isDataField: function(fieldName) {
            return DATA_FIELD_REGEX.test(fieldName);
        },

        isTimeField: function(fieldName) {
            return (fieldName === '_time' || fieldName === 'earliest_time' || fieldName === 'latest_time');
        },

        isSparklineData: function(column) {
            return (column.length > 0) && _.isArray(column[0]) && (column[0][0] === "##__SPARKLINE__##");
        },

        // hard-coded to use '_span' at the moment,
        // but we want an interface that could potentially support multiple time series with different spans
        getSpanSeriesForTimeField: function(fieldName) {
            var spanSeriesName = '_span';
            // find the column whose corresponding field matches the span series name
            return this.resultsAsColumns[spanSeriesName];
        },

        getCellInfo: function($cell) {
            return ({
                cellIndex: $cell.attr(ResultsTableRow.CELL_INDEX_ATTR),
                rowIndex: $cell.closest('tr').attr(ResultsTableRow.ROW_INDEX_ATTR)
            });
        },

        getMultiValueIndex: function($el) {
            return $el.attr(ResultsTableRow.MV_INDEX_ATTR);
        },

        template: '\
            <table class="table table-chrome table-striped <%= wrapResults ? "wrapped-results" : "not-wrapped-results" %> <%= numDataColumns === 1 ? \'single-column-table\' : \'\' %>">\
                <thead></thead>\
                <tbody></tbody>\
            </table>\
        ',

        staticHeaderTemplate: '\
            <div class="header-table-static"></div>\
            <div class="scroll-table-wrapper"></div>\
        '

    });

});
