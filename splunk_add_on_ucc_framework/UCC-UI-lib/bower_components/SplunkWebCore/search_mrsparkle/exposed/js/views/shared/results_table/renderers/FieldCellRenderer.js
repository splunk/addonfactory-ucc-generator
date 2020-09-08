define(function(require, exports, module) {

    var BaseCellRenderer = require("./BaseCellRenderer");
    var Set = require("jg/utils/Set");

    return BaseCellRenderer.extend({

        // Public Properties

        field: null,
        cellRenderer: null,

        // Private Properties

        _tdSet: null,

        // Initialize

        initialize: function(field, cellRenderer) {
            if (field == null) {
                throw new Error("Parameter field must be non-null.");
            } else if ((cellRenderer != null) && !(cellRenderer instanceof BaseCellRenderer)) {
                throw new Error("Parameter cellRenderer must be an instance of views/shared/results_table/renderers/BaseCellRenderer.");
            }

            this.field = "" + field;
            this.cellRenderer = cellRenderer || null;  // we allow cellRenderer to be null so this class can be used as a base class

            this._tdSet = new Set();
        },

        // Public Methods

        canRender: function(cellData) {
            return (cellData.field === this.field) && ((this.cellRenderer == null) || this.cellRenderer.canRender(cellData));
        },

        setup: function($td, cellData) {
            if (this.cellRenderer) {
                this.cellRenderer.setup($td, cellData);
                if (this._tdSet.size() === 0) {
                    this.listenTo(this.cellRenderer, "change", this._onCellRendererChange);
                }
                this._tdSet.add($td);
            }
        },

        teardown: function($td, cellData) {
            if (this.cellRenderer) {
                this._tdSet.del($td);
                if (this._tdSet.size() === 0) {
                    this.stopListening(this.cellRenderer, "change", this._onCellRendererChange);
                }
                this.cellRenderer.teardown($td, cellData);
            }
        },

        render: function($td, cellData) {
            if (this.cellRenderer) {
                this.cellRenderer.render($td, cellData);
            }
        },

        // Private Methods

        _onCellRendererChange: function() {
            this.trigger("change");
        }

    });

});
