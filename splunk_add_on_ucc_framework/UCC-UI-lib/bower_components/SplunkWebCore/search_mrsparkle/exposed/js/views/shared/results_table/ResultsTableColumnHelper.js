define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var BaseCellRenderer = require("views/shared/results_table/renderers/BaseCellRenderer");
    var FieldCellRenderer = require("views/shared/results_table/renderers/FieldCellRenderer");
    var MultiFieldCellRenderer = require("views/shared/results_table/renderers/MultiFieldCellRenderer");

    return Class(module.id, function(ResultsTableColumnHelper) {

        // Public Static Methods

        ResultsTableColumnHelper.canEdit = function(table, field, type) {
            _assertParameters(table, field, type);

            var cellRenderers = table.getCellRenderers(true);
            var cellRenderer;
            var matchCount = 0;

            for (var i = cellRenderers.length - 1; i >= 0; i--) {
                cellRenderer = cellRenderers[i];

                // table-level renderer found, can't edit
                if (cellRenderer instanceof type) {
                    return false;

                // multi-field renderer found, can't edit if multiple fields listed or if this is the second match
                } else if ((cellRenderer instanceof MultiFieldCellRenderer) && (cellRenderer.cellRenderer instanceof type) && (ArrayUtil.indexOf(cellRenderer.fields, field) >= 0)) {
                    matchCount += cellRenderer.fields.length;
                    if (matchCount > 1) {
                        return false;
                    }

                // field renderer found, can't edit if this is the second match
                } else if ((cellRenderer instanceof FieldCellRenderer) && (cellRenderer.cellRenderer instanceof type) && (cellRenderer.field === field)) {
                    matchCount++;
                    if (matchCount > 1) {
                        return false;
                    }
                }
            }

            return true;
        };

        ResultsTableColumnHelper.getCellRenderer = function(table, field, type) {
            _assertParameters(table, field, type);

            var cellRenderers = table.getCellRenderers(true);
            var cellRenderer;

            for (var i = cellRenderers.length - 1; i >= 0; i--) {
                cellRenderer = cellRenderers[i];
                if (((cellRenderer instanceof FieldCellRenderer) && (cellRenderer.field === field)) ||
                    ((cellRenderer instanceof MultiFieldCellRenderer) && (cellRenderer.fields.length === 1) && (cellRenderer.fields[0] === field))) {
                    if (cellRenderer.cellRenderer instanceof type) {
                        return cellRenderer.cellRenderer;
                    }
                }
            }

            return null;
        };

        ResultsTableColumnHelper.setCellRenderer = function(table, field, type, renderer) {
            _assertParameters(table, field, type, renderer);

            var cellRenderers = table.getCellRenderers(true);
            var cellRenderer;

            for (var i = cellRenderers.length - 1; i >= 0; i--) {
                cellRenderer = cellRenderers[i];
                if (((cellRenderer instanceof FieldCellRenderer) && (cellRenderer.field === field)) ||
                    ((cellRenderer instanceof MultiFieldCellRenderer) && (cellRenderer.fields.length === 1) && (cellRenderer.fields[0] === field))) {
                    if (cellRenderer.cellRenderer instanceof type) {
                        if (cellRenderer.cellRenderer === renderer) {
                            return;
                        }

                        table.removeCellRenderer(cellRenderer, true);
                        break;
                    }
                }
            }

            if (renderer) {
                table.addCellRenderer(new FieldCellRenderer(field, renderer), true);
            }
        };

        // Private Static Methods

        var _assertParameters = function(table, field, type, renderer) {
            if (table == null) {
                throw new Error("Parameter table must be non-null.");
            } else if (field == null) {
                throw new Error("Parameter field must be non-null.");
            } else if (!Class.isString(field)) {
                throw new Error("Parameter field must be of type String.");
            } else if (type == null) {
                throw new Error("Parameter type must be non-null.");
            } else if (!Class.isFunction(type)) {
                throw new Error("Parameter type must be of type Function.");
            } else if (!Class.isSubclassOf(type, BaseCellRenderer)) {
                throw new Error("Parameter type must be a subclass of views/shared/results_table/renderers/BaseCellRenderer.");
            } else if ((renderer != null) && !(renderer instanceof type)) {
                throw new Error("Parameter renderer must be of the given type.");
            }
        };

    });

});
