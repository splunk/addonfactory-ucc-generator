define(function(require, exports, module) {

    var _ = require('underscore');
    var Class = require('jg/Class');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var Editor = require('splunk/editors/Editor');
    var EnumEditor = require('splunk/editors/EnumEditor');
    var NumberFormatEditor = require('splunk/editors/NumberFormatEditor');
    var NumberFormatCellRenderer = require('views/shared/results_table/renderers/NumberFormatCellRenderer');

    require('./TableFormatEditor.pcss');

    return Class(module.id, Editor, function(TableFormatEditor, base) {

        // Public Properties

        this.cellRenderer = new ObservableProperty('cellRenderer', NumberFormatCellRenderer, null)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        // Private Properties

        this._enumEditor = null;
        this._numberFormatEditor = null;
        this._cachedCellRenderer = null;

        // Protected Methods

        this.setupOverride = function() {
            this._enumEditor = new EnumEditor()
                .addOption(null, _('Disabled').t())
                .addOption('number', _('Enabled').t())
                .set('menuWidth', 'narrow')
                .on('value.change', this.onInputChange, this);

            this.addChild(this._enumEditor);
        };

        this.renderInputOverride = function() {
            var cellRenderer = this.getInternal('cellRenderer');

            this._enumEditor
                .set('value', cellRenderer ? 'number' : null)
                .renderInput();

            if (cellRenderer) {
                this._cachedCellRenderer = cellRenderer;
                if (!this._numberFormatEditor) {
                    this._numberFormatEditor = new NumberFormatEditor()
                        .on('change', this.onInputChange, this);
                    this.addChild(this._numberFormatEditor);
                }
                this._numberFormatEditor
                    .set('precision', cellRenderer.get('precision'))
                    .set('useThousandSeparators', cellRenderer.get('useThousandSeparators'))
                    .set('unit', cellRenderer.get('unit'))
                    .set('unitPosition', cellRenderer.get('unitPosition'))
                    .renderInput();
            } else {
                if (this._numberFormatEditor) {
                    this._numberFormatEditor.remove();
                    this._numberFormatEditor = null;
                }
            }
        };

        this.processInputOverride = function() {
            var cellRenderer = null;

            if (this._enumEditor.get('value') === 'number') {
                cellRenderer = this.getInternal('cellRenderer') || this._cachedCellRenderer || new NumberFormatCellRenderer();
                this._cachedCellRenderer = cellRenderer;
                if (this._numberFormatEditor) {
                    cellRenderer
                        .set('precision', this._numberFormatEditor.get('precision'))
                        .set('useThousandSeparators', this._numberFormatEditor.get('useThousandSeparators'))
                        .set('unit', this._numberFormatEditor.get('unit'))
                        .set('unitPosition', this._numberFormatEditor.get('unitPosition'));
                }
            }

            this.setInternal('cellRenderer', cellRenderer);
        };

    });

});
