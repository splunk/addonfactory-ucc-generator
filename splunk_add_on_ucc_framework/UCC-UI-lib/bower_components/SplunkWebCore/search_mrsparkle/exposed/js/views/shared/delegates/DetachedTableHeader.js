/**
 * An abstract base view that defines some shared behaviors for managing a detached table header.
 *
 * BEWARE: this the initial step in what should be a larger refactor to avoid repeated code in TableDock and TableHeadStatic,
 * currently this is pretty fragile and depends on the options and variables defined in those views having the same names and meanings.
 */

define([
            'jquery',
            'underscore',
            'views/shared/delegates/Base'
        ],
        function(
            $,
            _,
            Base
        ) {

    return Base.extend({

        syncColumnWidths: function() {
            if(!this.$table) {
                return;
            }
            var $baseRow = this.$table.find('thead:first > tr'),
                $baseRowCells =  $baseRow.find('th'),
                $headerRow = this.$headerTable.find('thead:first > tr'),
                $headerCells = $headerRow.find('th'),
                $skipCell = false,
                widths = [];

            this.$table.css('table-layout', this.options.defaultLayout);
            if(this.options.flexWidthColumn !== false) {
                $skipCell = $baseRowCells.eq(this.options.flexWidthColumn);
            }
            $baseRowCells.not($skipCell[0]).css('width', '');

            _($baseRowCells).each(function(cell, i) {
                if ($skipCell && (cell === $skipCell[0])) {
                    return;
                }

                var $cell = $(cell),
                    cellWidth = {
                        // SPL-71945, the correct way to measure width is to use the clientWidth minus all horizontal padding
                        // this will correctly account for differences caused by border-collapse
                        width: $cell[0].clientWidth - parseFloat($cell.css('padding-right')) - parseFloat($cell.css('padding-left')),
                        index: i
                    };

                widths.push(cellWidth);
            }, this);

            this.$headerTable.width(this.$table.outerWidth());

            _.each(widths, function(cell) {
                var $cell = $baseRowCells.eq(cell.index),
                    $headerCell = $headerCells.eq(cell.index);

                $cell.width(cell.width);
                $headerCell.width(cell.width);
            });

            this.$table.css('table-layout', 'fixed');
        },

        updateStyles: function(elementGetterFn, styles) {
            var $elementContainer= this.$(this.options.headerContainer),
                $elements = elementGetterFn($elementContainer);

            _.each($elements, function(element) {
                $(element).css(styles);
            }, this);
        }
    });

});