define(function(require, exports, module) {

    var Class = require('jg/Class');
    var CSS = require('jg/CSS');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var Property = require('jg/properties/Property');
    var ObjectUtil = require('jg/utils/ObjectUtil');
    var StringUtil = require('jg/utils/StringUtil');
    var Set = require('jg/utils/Set');
    var EditorAddButton = require('splunk/editors/EditorAddButton');
    var EditorRemoveButton = require('splunk/editors/EditorRemoveButton');
    var SimpleTypeEditor = require('splunk/editors/SimpleTypeEditor');
    var ValueEditor = require('splunk/editors/ValueEditor');
    var HStackPanel = require('splunk/panels/HStackPanel');
    var VStackPanel = require('splunk/panels/VStackPanel');

    require('./ObjectEditor.pcss');

    return Class(module.id, ValueEditor, function(ObjectEditor, base) {

        // Private Static Properties

        var _keyEditor = new Property('_keyEditor', ValueEditor, null);
        var _valueEditor = new Property('_valueEditor', ValueEditor, null);

        // Public Properties

        this.itemEditorFactory = new ObservableProperty('itemEditorFactory', Function, null)
            .onChange(function(e) {
                this._itemEditorFactoryChanged = true;
                this.invalidate('renderInputPass');
            });

        this.addButtonLabel = new ObservableProperty('addButtonLabel', String, null)
            .setter(function(value) {
                this._addButton.set('label', value);
            });

        this.renderEmptyDefaultRow = new ObservableProperty('renderEmptyDefaultRow', Boolean, false)
            .onChange(function(e) {
                this.invalidate('renderInputPass');
            });

        // Private Properties

        this._itemEditorFactoryChanged = null;
        this._rowsPanel = null;
        this._addButton = null;

        // Protected Methods

        this.valueReadFilter = function(value) {
            return value ? ObjectUtil.extend({}, value) : {};
        };

        this.valueWriteFilter = function(value) {
            return ((value != null) && Class.isObject(value)) ? ObjectUtil.extend({}, value) : {};
        };

        this.setupOverride = function() {
            var addButton = this._addButton = new EditorAddButton(),
                rowsPanel = this._rowsPanel = new VStackPanel();

            this.addChild(rowsPanel);
            this.addChild(addButton);
            
            addButton.on('click', function(e) {
                var itemEditorFactory = this.getInternal('itemEditorFactory'),
                    valueEditor = itemEditorFactory ? itemEditorFactory.call(this) : null;

                if (valueEditor instanceof ValueEditor) {
                    this._addRow(valueEditor);
                    this.onInputChange();
                }
            }, this);
        };

        this.renderInputOverride = function() {
            var valueEditor,
                values = this.getInternal('value'),
                itemEditorFactory = this.getInternal('itemEditorFactory'),
                rows = this._rowsPanel.get('children'),
                keyToRowMap = {},
                duplicateRows = new Set(),
                updatedRows = new Set(),
                emptyRow;

            if (this._itemEditorFactoryChanged) {
                this._rowsPanel.set('children', null);
                this._itemEditorFactoryChanged = false;
            }

            this._computeKeyToRowMap(rows, keyToRowMap, duplicateRows);

            if (itemEditorFactory) {
                this._updateRows(values, keyToRowMap, updatedRows);
            }

            this._updateUnusedRows(rows, updatedRows, duplicateRows);

            // Render an empty row if the object is empty
            if ((this._rowsPanel.numChildren() === 0) && this.get('renderEmptyDefaultRow')) {
                valueEditor = itemEditorFactory ? itemEditorFactory.call(this) : null;

                if (valueEditor instanceof ValueEditor) {
                    emptyRow = this._addRow(valueEditor);
                    emptyRow.get(_keyEditor).renderInput();
                    emptyRow.get(_valueEditor).renderInput();
                }
            }
        };

        this.processInputOverride = function() {
            var i, l, row, key, value,
                rows = this._rowsPanel.get('children'),
                keySet = new Set(),
                values = {};

            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                key = StringUtil.trim(row.get(_keyEditor).get('value') || '');
                value = row.get(_valueEditor).get('value');

                if (key && !keySet.has(key)) {
                    keySet.add(key);
                    values[key] = value;
                }
            }

            this.setInternal('value', values);
        };

        this.decorateRowOverride = function(row) {
            // implement in subclasses
        };

        // Private Methods

        this._addRow = function(valueEditor) {
            var keyEditor = new SimpleTypeEditor(String),
                removeButton = new EditorRemoveButton(),
                row = new HStackPanel();

            keyEditor.addClass(CSS.formatClassName(module.id, 'key'));
            row.addClass(CSS.formatClassName(module.id, 'row'));

            keyEditor.on('value.change', this.onInputChange, this);
            valueEditor.on('value.change', this.onInputChange, this);
            removeButton.on('click', function(e) {
                row.remove();
                this.onInputChange();
            }, this);

            row
                .set(_keyEditor, keyEditor)
                .set(_valueEditor, valueEditor)
                .addChild(keyEditor)
                .addChild(valueEditor)
                .addChild(removeButton);

            this._rowsPanel.addChild(row);
            this.decorateRowOverride(row);

            return row;
        };

        this._computeKeyToRowMap = function(rows, keyToRowMap, duplicateRows) {
            var i, l, row, key;

            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                key = row.get(_keyEditor).get('value');

                if (key) {
                    if (!ObjectUtil.has(keyToRowMap, key)) {
                        keyToRowMap[key] = row;
                    } else {
                        duplicateRows.add(row);
                    }
                }
            }
        };

        this._updateRows = function(values, keyToRowMap, updatedRows) {
            var i, l, key, value, row, keyEditor, valueEditor,
                keys = ObjectUtil.keys(values),
                itemEditorFactory = this.getInternal('itemEditorFactory');

            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                value = values[key];
                row = ObjectUtil.get(keyToRowMap, key);
                valueEditor = row ? row.get(_valueEditor) : itemEditorFactory.call(this);

                if (valueEditor instanceof ValueEditor) {
                    if (!row) {
                        row = this._addRow(valueEditor);
                    }

                    keyEditor = row.get(_keyEditor);
                    keyEditor.set('value', key);
                    keyEditor.set('hasError', false);
                    keyEditor.renderInput();

                    valueEditor.set('value', value);
                    valueEditor.renderInput();

                    updatedRows.add(row);
                }
            }
        };

        this._updateUnusedRows = function(rows, updatedRows, duplicateRows) {
            var i, l, row, keyEditor, valueEditor;

            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                keyEditor = row.get(_keyEditor);

                // TODO: duplicate rows are not cleared when value is nulled
                if (duplicateRows.has(row)) {
                    keyEditor.set('hasError', true);
                    keyEditor.renderInput();
                } else if (!updatedRows.has(row)) {
                    valueEditor = row.get(_valueEditor);

                    if (keyEditor.get('value') && valueEditor.get('value') != null) {
                        // TODO: some editors like boolean may need a default value
                        keyEditor.set('value', null);
                        keyEditor.set('hasError', false);
                        keyEditor.renderInput();
                        valueEditor.set('value', null);
                        valueEditor.renderInput();
                    }
                }
            }
        };

    });

});
