define(function(require, exports, module) {

    var _ = require('underscore');
    var Class = require('jg/Class');
    var CSS = require('jg/CSS');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var ColorEditor = require('splunk/editors/ColorEditor');
    var Editor = require('splunk/editors/Editor');
    var EditorAddButton = require('splunk/editors/EditorAddButton');
    var EditorAlert = require('splunk/editors/EditorAlert');
    var EditorLabel = require('splunk/editors/EditorLabel');
    var EditorRemoveButton = require('splunk/editors/EditorRemoveButton');
    var SimpleTypeEditor = require('splunk/editors/SimpleTypeEditor');
    var ListColorPalette = require('splunk/palettes/ListColorPalette');
    var HStackPanel = require('splunk/panels/HStackPanel');
    var VStackPanel = require('splunk/panels/VStackPanel');
    var ThresholdScale = require('splunk/scales/ThresholdScale');

    require('./ColorScaleThresholdEditor.pcss');

    return Class(module.id, Editor, function(ColorScaleThresholdEditor, base) {

        // Public Properties

        this.scale = new ObservableProperty('scale', ThresholdScale, null)
            .onChange(function(e) {
                if ((e.event !== e.target.valueMapChange) && (e.event !== e.target.scaleMapChange)) {
                    this.invalidate('renderInputPass');
                }
            });

        this.colorPalette = new ObservableProperty('colorPalette', ListColorPalette, null)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        // Private Properties

        this._errorMessage = null;
        this._rowsPanel = null;
        this._addButton = null;

        // Protected Methods

        this.setupOverride = function() {
            var addButton = this._addButton = new EditorAddButton(),
                rowsPanel = this._rowsPanel = new VStackPanel();

            this.addChild(rowsPanel);
            this.addChild(addButton);

            addButton.set('label', '+ ' + _('Add Range').t());
            addButton.on('click', function(e) {
                rowsPanel.addChildAt(new Row(this), rowsPanel.numChildren() - 1);
                this.onInputChange();
            }, this);
        };

        this.renderInputOverride = function() {
            var i = 0,
                l, row, thresholds, colors, colorsLength = 0,
                scale = this.getInternal('scale'),
                colorPalette = this.getInternal('colorPalette'),
                rowsPanel = this._rowsPanel,
                rows = rowsPanel.get('children'),
                rowsCount = rows.length,
                hasError = false;

            if (colorPalette && scale) {
                thresholds = scale.get('thresholds');
                colors = colorPalette.get('colors');
                colorsLength = colors.length;

                if (colorsLength === (thresholds.length + 1)) {
                    for (l = colorsLength; i < l; i++) {
                        row = (i < rowsCount) ? rows[i] : null;

                        if (!row) {
                            row = new Row(this);
                            rowsPanel.addChild(row);
                        }

                        row.renderInput(thresholds, colors, i, colorsLength);
                        if (row.hasError()) {
                            hasError = true;
                        }
                    }
                }
            }

            for (l = rowsCount; i < l; i++) {
                rows[i].remove();
            }

            this._addButton.set('visibility', (colorsLength > 0) ? 'visible' : 'collapsed');

            if (hasError && !this._errorMessage) {
                this._errorMessage = new EditorAlert('error', _('Color ranges must be entered from lowest to highest.').t());
                this.addChildAt(this._errorMessage, 0);
            } else if (!hasError && this._errorMessage) {
                this._errorMessage.remove();
                this._errorMessage = null;
            }
        };

        this.processInputOverride = function() {
            var i, l,
                thresholds = [],
                colors = [],
                scale = this.getInternal('scale'),
                colorPalette = this.getInternal('colorPalette'),
                rows = this._rowsPanel.get('children'),
                rowsCount = rows.length;

            if (colorPalette && scale) {
                for (i = 0, l = rowsCount; i < l; i++) {
                    rows[i].processInput(thresholds, colors, i, rowsCount);
                }
                scale.set('thresholds', thresholds);
                colorPalette.set('colors', colors);
            }
        };

        // Private Nested Classes

        var Row = Class(HStackPanel, function(Row, base) {

            // Private Properties

            this._fromLabel = null;
            this._fromValue = null;
            this._toLabel = null;
            this._toValue = null;
            this._toEditor = null;
            this._colorEditor = null;
            this._removeButton = null;

            // Constructor

            this.constructor = function(editor) {
                base.constructor.call(this);

                this.addClass(CSS.formatClassName(module.id, 'row'));

                this._fromLabel = new EditorLabel(_('from').t())
                    .addClass('fromLabel');

                this._fromValue = new EditorLabel(_('min').t())
                    .addClass('fromValue');

                this._toLabel = new EditorLabel(_('to').t())
                    .addClass('toLabel');

                this._toValue = new EditorLabel(_('max').t())
                    .addClass('toValue');

                this._toEditor = new SimpleTypeEditor(Number)
                    .addClass('toEditor')
                    .set('value', Infinity)
                    .on('value.change', editor.onInputChange, editor);

                this._colorEditor = new ColorEditor()
                    .addClass('colorEditor')
                    .on('value.change', editor.onInputChange, editor);

                this._removeButton = new EditorRemoveButton()
                    .addClass('removeButton')
                    .on('click', function(e) {
                        this.remove();
                        editor.onInputChange();
                    }, this);

                this.addChild(this._fromLabel);
                this.addChild(this._fromValue);
                this.addChild(this._toLabel);
                this.addChild(this._toEditor);
                this.addChild(this._colorEditor);
                this.addChild(this._removeButton);
            };

            // Public Accessor Methods

            this.hasError = function() {
                return ((this._toEditor.parent() != null) && this._toEditor.get('hasError'));
            };

            // Public Methods

            this.dispose = function() {
                // manually dispose detached elements
                if (!this._toValue.parent()) {
                    this._toValue.dispose();
                }
                if (!this._toEditor.parent()) {
                    this._toEditor.dispose();
                }
                if (!this._removeButton.parent()) {
                    this._removeButton.dispose();
                }

                base.dispose.call(this);
            };

            this.renderInput = function(thresholds, colors, index, rowsCount) {
                var min = -Infinity;
                var threshold;
                for (var i = index - 1; i >= 0; i--) {
                    threshold = thresholds[i];
                    if (threshold > min) {
                        min = threshold;
                    }
                }

                this._fromValue.set('text', (index === 0) ? _('min').t() : ('' + min));

                if (index < (rowsCount - 1)) {
                    threshold = thresholds[index];
                    this._toValue.remove(false);
                    this._toEditor
                        .set('value', threshold)
                        .set('hasError', (threshold <= min))
                        .renderInput();
                    this.addChildAt(this._toEditor, 3);
                    this.addChild(this._removeButton);
                } else {
                    this._removeButton.remove(false);
                    this._toEditor.remove(false);
                    this.addChildAt(this._toValue, 3);
                }

                this._colorEditor
                    .set('value', colors[index]).renderInput()
                    .renderInput();
            };

            this.processInput = function(thresholds, colors, index, rowsCount) {
                if (index < rowsCount - 1) {
                    var threshold = this._toEditor.get('value');
                    if (threshold === Infinity) {
                        if (thresholds.length === 0) {
                            threshold = 0;
                        } else {
                            var prevThreshold = thresholds[thresholds.length - 1];
                            if (prevThreshold > 0) {
                                threshold = Math.ceil(prevThreshold * 2);
                            } else if (prevThreshold < 0) {
                                threshold = Math.ceil(prevThreshold / 2);
                            } else {
                                threshold = 10;
                            }
                        }
                    }
                    thresholds.push(threshold);
                }
                colors.push(this._colorEditor.get('value'));
            };

        });

    });

});
