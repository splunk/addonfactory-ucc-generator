define(function(require, exports, module) {

    var _ = require("underscore");
    var BaseCellRenderer = require("./BaseCellRenderer");
    var Set = require("jg/utils/Set");

    return BaseCellRenderer.extend({

        // Public Properties

        fields: null,
        cellRenderer: null,

        // Private Properties

        _fieldsMap: null,
        _tdSet: null,

        // Initialize

        initialize: function(fields, cellRenderer) {
            if (fields == null) {
                throw new Error("Parameter fields must be non-null.");
            } else if (!_.isArray(fields)) {
                throw new Error("Parameter fields must be of type Array.");
            } else if ((cellRenderer != null) && !(cellRenderer instanceof BaseCellRenderer)) {
                throw new Error("Parameter cellRenderer must be an instance of views/shared/results_table/renderers/BaseCellRenderer.");
            }

            this.fields = fields.concat();
            this.cellRenderer = cellRenderer || null;  // we allow cellRenderer to be null so this class can be used as a base class

            var fieldsMap = this._fieldsMap = {};
            var field;
            for (var i = 0, l = fields.length; i < l; i++) {
                field = fields[i];
                if (field != null) {
                    fieldsMap["" + field] = true;
                }
            }

            this._tdSet = new Set();
        },

        // Public Methods

        canRender: function(cellData) {
            return _.has(this._fieldsMap, cellData.field) && ((this.cellRenderer == null) || this.cellRenderer.canRender(cellData));
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
