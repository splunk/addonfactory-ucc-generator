define(function(require, exports, module) {

    var _ = require('underscore');
    var Class = require('jg/Class');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var ColorEditor = require('splunk/editors/ColorEditor');
    var Editor = require('splunk/editors/Editor');
    var EditorLabel = require('splunk/editors/EditorLabel');
    var ObjectEditor = require('splunk/editors/ObjectEditor');
    var MapColorPalette = require('splunk/palettes/MapColorPalette');

    return Class(module.id, Editor, function(ColorScaleMapEditor, base) {

        // Public Properties

        this.colorPalette = new ObservableProperty('colorPalette', MapColorPalette, null)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        // Private Properties

        this._editor = null;

        // Protected Methods

        this.setupOverride = function() {
            this._editor = new InternalEditor()
                .on('value.change', this.onInputChange, this);
            this.addChild(this._editor);
        };

        this.renderInputOverride = function() {
            var colorPalette = this.getInternal('colorPalette');

            this._editor
                .set('value', colorPalette ? colorPalette.get('colors') : null)
                .renderInput();
        };

        this.processInputOverride = function() {
            var colorPalette = this.getInternal('colorPalette');

            if (colorPalette) {
                colorPalette.set('colors', this._editor.get('value'));
            }
        };

        // Private Nested Classes

        var InternalEditor = Class(ObjectEditor, function(InternalEditor, base) {

            // Protected Methods

            this.setupOverride = function() {
                base.setupOverride.call(this);

                var addButtonLabel = '+ ' + _('Add Rule').t(),
                    colorEditorFactory = function() {
                        return new ColorEditor();
                    };

                this.set('addButtonLabel', addButtonLabel);
                this.set('itemEditorFactory', colorEditorFactory);
                this.set('renderEmptyDefaultRow', true);
            };

            this.decorateRowOverride = function(row) {
                var text = _('Cell value is').t(),
                    label = new EditorLabel(text);

                row.addChildAt(label, 0);
            };

        });

    });

});
