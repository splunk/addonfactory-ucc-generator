define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            './ResultsTableRow',
            './renderers/BaseCellRenderer',
            './renderers/FieldCellRenderer',
            './renderers/MultiFieldCellRenderer',
            './renderers/NullCellRenderer',
            './renderers/NumberCellRenderer',
            './renderers/NumberFormatCellRenderer',
            './ResultsTableSummaryRow.pcss'
        ],
        function(
            $,
            _,
            module,
            Base,
            ResultsTableRow,
            BaseCellRenderer,
            FieldCellRenderer,
            MultiFieldCellRenderer,
            NullCellRenderer,
            NumberCellRenderer,
            NumberFormatCellRenderer,
            css
        ) {

    return Base.extend({

        moduleId: module.id,

        tagName: 'tr',

        render: function() {
            if (this.options.hasRowExpansion) {
                this.$el.append($('<td>&nbsp;</td>'));
            }
            if(this.options.hasRowNumber) {
                this.$el.append($('<td>&nbsp;</td>'));
            }
            this.generateCells();
            return this;
        },

        remove: function() {
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
                var $td = $('<td></td>');
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
                    } else if (typeof cellRenderer === 'function') {
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
                    } else if (typeof cellRenderer === 'function') {
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
                return _(this.options.table.getCellRenderers(isFormatter)).filter(this._isValidCellRenderer, this);
            }
            return [];
        },

        _isValidCellRenderer: function(cellRenderer) {
            var type = cellRenderer ? cellRenderer.constructor : null;
            switch (type) {
                case FieldCellRenderer:
                case MultiFieldCellRenderer:
                    return this._isValidCellRenderer(cellRenderer.cellRenderer);
                case NullCellRenderer:
                case NumberCellRenderer:
                case NumberFormatCellRenderer:
                    return true;
                default:
                    return false;
            }
        }

    });

});
