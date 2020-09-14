define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            './renderers/BaseCellRenderer',
            './renderers/BaseRowExpansionRenderer'
        ],
        function(
            $,
            _,
            module,
            Base,
            BaseCellRenderer,
            BaseRowExpansionRenderer
        ) {

    var ResultsTableRow = Base.extend({

        moduleId: module.id,

        tagName: 'tr',
        
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            _.defaults(this.options, {
                splitHighlight: true
            });
        },

        render: function() {
            this.$el.attr(ResultsTableRow.ROW_INDEX_ATTR, this.options.rowIndex);
            this.$el.addClass((this.options.rowIndex % 2) ? "even" : "odd");
            if (this.options.rowExpansion) {
                this._rowExpansionToggle = $('<td rowspan="1" class="expands"><a href="#"><i class="icon-triangle-right-small"></i></a></td>')
                    .addClass(ResultsTableRow.ROW_EXPANSION_CLASSNAME)
                    .appendTo(this.$el);
            }
            if(this.options.hasOwnProperty('rowNumber')) {
                this.$el.append($('<td class="row-number"></td>').text(this.options.rowNumber));
            }
            this.generateCells();
            return this;
        },

        remove: function() {
            this.collapseRow();
            this.disposeCells();
            return Base.prototype.remove.call(this);
        },

        generateCells: function() {
            this.disposeCells();

            var renderedCells = this._renderedCells = [];
            var renderedCell;
            var cellRenderers = this.getCellRenderers();
            var formatCellRenderers = this.getCellRenderers(true);
            var cellRenderer;

            _(this.options.cells).each(function(cellData) {
                var i, l;
                var $td = $("<td></td>");
                $td.attr(ResultsTableRow.CELL_INDEX_ATTR, cellData.index);

                renderedCell = {
                    $td: $td,
                    cellData: cellData,
                    cellRenderer: null,
                    formatCellRenderers: []
                };

                // setup and render cell renderer
                for (i = 0, l = cellRenderers.length; i < l; i++) {
                    cellRenderer = cellRenderers[i];
                    if (cellRenderer instanceof BaseCellRenderer) {
                        if (cellRenderer.canRender(cellData)) {
                            cellRenderer.setup($td, cellData);
                            cellRenderer.render($td, cellData);
                            renderedCell.cellRenderer = cellRenderer;
                            break;
                        }
                    } else if (typeof cellRenderer === "function") {
                        if (cellRenderer($td, cellData)) {
                            break;
                        }
                    }
                }

                // setup and render format cell renderers
                for (i = 0, l = formatCellRenderers.length; i < l; i++) {
                    cellRenderer = formatCellRenderers[i];
                    if (cellRenderer instanceof BaseCellRenderer) {
                        if (cellRenderer.canRender(cellData)) {
                            cellRenderer.setup($td, cellData);
                            cellRenderer.render($td, cellData);
                            renderedCell.formatCellRenderers.push(cellRenderer);
                        }
                    } else if (typeof cellRenderer === "function") {
                        cellRenderer($td, cellData);
                    }
                }

                this.$el.append($td);
                renderedCells.push(renderedCell);
            }, this);
        },

        disposeCells: function() {
            if (!this._renderedCells)
                return;

            _(this._renderedCells).each(function(renderedCell) {
                // teardown format cell renderers
                var formatCellRenderers = renderedCell.formatCellRenderers;
                for (var i = formatCellRenderers.length - 1; i >= 0; i--) {
                    formatCellRenderers[i].teardown(renderedCell.$td, renderedCell.cellData);
                }

                // teardown cell renderer
                if (renderedCell.cellRenderer) {
                    renderedCell.cellRenderer.teardown(renderedCell.$td, renderedCell.cellData);
                }

                renderedCell.$td.remove();
            }, this);

            this._renderedCells = null;
        },

        getCellRenderers: function(isFormatter) {
            if (this.options.table) {
                return this.options.table.getCellRenderers(isFormatter);
            }
            return [];
        },

        expandRow: function(rowExpansionRenderer, rowData) {
            if (!(rowExpansionRenderer instanceof BaseRowExpansionRenderer)) {
                throw new Error("Parameter rowExpansionRenderer must be an instance of views/shared/results_table/renderers/BaseRowExpansionRenderer.");
            }

            this.collapseRow();

            // update row class
            this.$el.addClass("expanded-row");

            // update toggle
            if (this._rowExpansionToggle) {
                $("i", this._rowExpansionToggle)
                    .removeClass("icon-triangle-right-small")
                    .addClass("icon-triangle-down-small");
                this._rowExpansionToggle.attr("rowspan", 2);
            }

            // store rowData
            this._rowExpansionData = rowData;

            // create expansion containers
            this._rowExpansionContainerTD = $(rowExpansionRenderer.createContainer(this._rowExpansionData));
            this._rowExpansionContainerTR = $('<tr></tr>')
                .addClass("expanded-content-row")
                .addClass((this.options.rowIndex % 2) ? "even" : "odd")
                .append(this._rowExpansionContainerTD);
            this.$el.after(this._rowExpansionContainerTR);

            // setup and render rowExpansionRenderer
            this._rowExpansionRenderer = rowExpansionRenderer;
            this._rowExpansionRenderer.setup(this._rowExpansionContainerTD, this._rowExpansionData);
            this._rowExpansionRenderer.render(this._rowExpansionContainerTD, this._rowExpansionData);
        },

        collapseRow: function() {
            if (!this._rowExpansionRenderer) {
                return;
            }

            // teardown rowExpansionRenderer
            this._rowExpansionRenderer.teardown(this._rowExpansionContainerTD, this._rowExpansionData);
            this._rowExpansionRenderer = null;

            // dispose expansion containers
            this._rowExpansionContainerTR.remove();
            this._rowExpansionContainerTR = null;
            this._rowExpansionContainerTD = null;

            // clear rowData
            this._rowExpansionData = null;

            // update toggle
            if (this._rowExpansionToggle) {
                this._rowExpansionToggle.attr("rowspan", 1);
                $("i", this._rowExpansionToggle)
                    .removeClass("icon-triangle-down-small")
                    .addClass("icon-triangle-right-small");
            }

            // update row class
            this.$el.removeClass("expanded-row");
        },

        getRowData: function() {
            var colspan = $("td", this.$el).length - (this._rowExpansionToggle ? 1 : 0);
            return _.extend({}, this.options, { colspan: colspan });
        },

        highlightRow: function() {
            this.$el.addClass('highlighted');
        },

        unHighlightRow: function() {
            this.$el.removeClass('highlighted');
        },

        // $target could be a cell or a multivalue sub-cell
        highlightCell: function($target, index) {
            var rowNumbersEnabled = this.options.hasOwnProperty('rowNumber'),
                rowExpansionEnabled = !!this.options.rowExpansion,
                $tds = this.$('td'),
                numRowSplits = this.options.numRowSplits,
                numRowSplitsOffset = (rowNumbersEnabled ? 1 : 0) + (rowExpansionEnabled ? 1 : 0),
                $rowSplitCells = $tds.slice(0, numRowSplits + numRowSplitsOffset);
            
            if (this.options.splitHighlight) {
                $rowSplitCells.addClass('highlighted'); 
            }
            $target.addClass('highlighted');
        },

        // $target could be a cell or a multivalue sub-cell
        unHighlightCell: function($target, index) {
            var rowNumbersEnabled = this.options.hasOwnProperty('rowNumber'),
                rowExpansionEnabled = !!this.options.rowExpansion,
                $tds = this.$('td'),
                numRowSplits = this.options.numRowSplits,
                numRowSplitsOffset = (rowNumbersEnabled ? 1 : 0) + (rowExpansionEnabled ? 1 : 0),
                $rowSplitCells = $tds.slice(0, numRowSplits + numRowSplitsOffset);

            if (this.options.splitHighlight) {
                $rowSplitCells.removeClass('highlighted');
            }
            $target.removeClass('highlighted');
        }

    },
    {
        ROW_INDEX_ATTR: 'data-row-index',
        CELL_INDEX_ATTR: 'data-cell-index',
        ROW_EXPANSION_CLASSNAME: 'row-expansion-toggle',
        MV_SUBCELL_CLASSNAME: 'multivalue-subcell',
        MV_INDEX_ATTR: 'data-mv-index'
    });

    return ResultsTableRow;

});