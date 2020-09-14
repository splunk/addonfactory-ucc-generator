define(function(require, exports, module) {

    var Class = require('jg/Class');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var ColorScaleEditor = require('splunk/editors/ColorScaleEditor');
    var Editor = require('splunk/editors/Editor');
    var ColorCellRenderer = require('views/shared/results_table/renderers/ColorCellRenderer');

    return Class(module.id, Editor, function(TableColorEditor, base) {

        // Public Static Methods

        TableColorEditor.canEdit = function(cellRenderer) {
            if (cellRenderer == null) {
                return true;
            } else if (!(cellRenderer instanceof ColorCellRenderer)) {
                return false;
            } else {
                return ColorScaleEditor.canEdit(cellRenderer.get('scale'), cellRenderer.get('colorPalette'));
            }
        };

        // Public Properties

        this.cellRenderer = new ObservableProperty('cellRenderer', ColorCellRenderer, null)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        // Private Properties

        this._colorScaleEditor = null;

        // Protected Methods

        this.setupOverride = function() {
            this._colorScaleEditor = new ColorScaleEditor()
                .on('change', this.onInputChange, this);

            this.addChild(this._colorScaleEditor);
        };

        this.renderInputOverride = function() {
            var cellRenderer = this.getInternal('cellRenderer');

            this._colorScaleEditor
                .set('scale', cellRenderer ? cellRenderer.get('scale') : null)
                .set('colorPalette', cellRenderer ? cellRenderer.get('colorPalette') : null)
                .renderInput();
        };

        this.processInputOverride = function() {
            var cellRenderer = null;

            var scale = this._colorScaleEditor.get('scale');
            var colorPalette = this._colorScaleEditor.get('colorPalette');
            if (scale || colorPalette) {
                cellRenderer = this.getInternal('cellRenderer') || new ColorCellRenderer();
                cellRenderer
                    .set('scale', scale)
                    .set('colorPalette', colorPalette);
            }

            this.setInternal('cellRenderer', cellRenderer);
        };

    });

});
