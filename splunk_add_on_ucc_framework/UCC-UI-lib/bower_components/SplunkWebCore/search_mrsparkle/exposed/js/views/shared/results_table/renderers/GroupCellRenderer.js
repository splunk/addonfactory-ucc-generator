define(function(require, exports, module) {

    var _ = require("underscore");
    var BaseCellRenderer = require("./BaseCellRenderer");
    var Set = require("jg/utils/Set");

    return BaseCellRenderer.extend({

        // Private Properties

        _cellRenderers: null,
        _tdSet: null,

        // Initialize

        initialize: function(cellRenderers) {
            var filteredCellRenderers = [];

            if (cellRenderers != null) {
                if (!_.isArray(cellRenderers)) {
                    throw new Error("Parameter cellRenderers must be of type Array<views/shared/results_table/renderers/BaseCellRenderer>.");
                }

                var cellRenderer;
                for (var i = 0, l = cellRenderers.length; i < l; i++) {
                    cellRenderer = cellRenderers[i];
                    if (cellRenderer != null) {
                        if (!(cellRenderer instanceof BaseCellRenderer)) {
                            throw new Error("Parameter cellRenderers must be of type Array<views/shared/results_table/renderers/BaseCellRenderer>.");
                        }

                        filteredCellRenderers.push(cellRenderer);
                    }
                }
            }

            this._cellRenderers = filteredCellRenderers;
            this._tdSet = new Set();
        },

        // Public Methods

        canRender: function(cellData) {
            var cellRenderers = this._cellRenderers;
            if (cellRenderers.length === 0) {
                return false;
            }

            for (var i = 0, l = cellRenderers.length; i < l; i++) {
                if (!cellRenderers[i].canRender(cellData)) {
                    return false;
                }
            }

            return true;
        },

        setup: function($td, cellData) {
            var cellRenderers = this._cellRenderers;
            var i, l;

            for (i = 0, l = cellRenderers.length; i < l; i++) {
                cellRenderers[i].setup($td, cellData);
            }

            if (this._tdSet.size() === 0) {
                for (i = 0, l = cellRenderers.length; i < l; i++) {
                    this.listenTo(cellRenderers[i], "change", this._onCellRendererChange);
                }
            }
            this._tdSet.add($td);
        },

        teardown: function($td, cellData) {
            var cellRenderers = this._cellRenderers;
            var i;

            this._tdSet.del($td);
            if (this._tdSet.size() === 0) {
                for (i = cellRenderers.length - 1; i >= 0; i--) {
                    this.stopListening(cellRenderers[i], "change", this._onCellRendererChange);
                }
            }

            for (i = cellRenderers.length - 1; i >= 0; i--) {
                cellRenderers[i].teardown($td, cellData);
            }
        },

        render: function($td, cellData) {
            var cellRenderers = this._cellRenderers;
            for (var i = 0, l = cellRenderers.length; i < l; i++) {
                cellRenderers[i].render($td, cellData);
            }
        },

        // Private Methods

        _onCellRendererChange: function() {
            this.trigger("change");
        }

    });

});
