define(function(require, exports, module) {

    var Class = require('jg/Class');
    var CSS = require('jg/CSS');
    var ObservableProperty = require('jg/properties/ObservableProperty');
    var Property = require('jg/properties/Property');
    var EditorAddButton = require('splunk/editors/EditorAddButton');
    var EditorRemoveButton = require('splunk/editors/EditorRemoveButton');
    var ValueEditor = require('splunk/editors/ValueEditor');
    var HStackPanel = require('splunk/panels/HStackPanel');
    var VStackPanel = require('splunk/panels/VStackPanel');

    require('./ArrayEditor.pcss');

    return Class(module.id, ValueEditor, function(ArrayEditor, base) {

        // Private Static Properties

        var _editor = new Property('_editor', ValueEditor, null);

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

        // Private Properties

        this._itemEditorFactoryChanged = false;
        this._rowsPanel = null;
        this._addButton = null;

        // Protected Methods

        this.valueReadFilter = function(value) {
            return value ? value.concat() : [];
        };

        this.valueWriteFilter = function(value) {
            return ((value != null) && Class.isArray(value)) ? value.concat() : [];
        };

        this.setupOverride = function() {
            var addButton = this._addButton = new EditorAddButton(),
                rowsPanel = this._rowsPanel = new VStackPanel();

            this.addChild(rowsPanel);
            this.addChild(addButton);

            addButton.on('click', function(e) {
                var itemEditorFactory = this.getInternal('itemEditorFactory'),
                    editor = itemEditorFactory ? itemEditorFactory.call(this) : null;

                if (editor instanceof ValueEditor) {
                    this._addRow(editor);
                    this.onInputChange();
                }
            }, this);
        };

        this.renderInputOverride = function() {
            var values = this.getInternal('value'),
                editor, value, rows, oldRowsCount,
                valuesCount = values.length,
                rowIdx = 0,
                valIdx = 0,
                itemEditorFactory = this.getInternal('itemEditorFactory');

            if (this._itemEditorFactoryChanged) {
                this._rowsPanel.set('children', null);
                this._itemEditorFactoryChanged = false;
            }

            rows = this._rowsPanel.get('children');
            oldRowsCount = rows.length;

            if (itemEditorFactory) {
                for (; rowIdx < oldRowsCount && valIdx < valuesCount; rowIdx++) {
                    editor = rows[rowIdx].get(_editor);
                    value = values[valIdx];

                    // if value of editor == null && value != null, keep unused editor without assigning it a value
                    if ((editor.get('value') != null) || (value == null)) {
                        editor.set('value', value);
                        valIdx++;
                    }

                    editor.renderInput();
                }

                // if # of existing editors < # of values, create new editors
                for (; valIdx < valuesCount; valIdx++) {
                    editor = itemEditorFactory.call(this);

                    if (editor instanceof ValueEditor) {
                        value = values[valIdx];
                        editor.set('value', value);
                        editor.renderInput();
                        this._addRow(editor);
                    }
                }

            }

            // if # existing editors > # of values, set remaining editors to null
            for (; rowIdx < oldRowsCount; rowIdx++) {
                editor = rows[rowIdx].get(_editor);
                editor.set('value', null);
                editor.renderInput();
            }
        };

        this.processInputOverride = function() {
            var i, l, editor,
                rows = this._rowsPanel.get('children'),
                values = [];

            for (i = 0, l = rows.length; i < l; i++) {
                editor = rows[i].get(_editor);
                values.push(editor.get('value'));
            }

            this.setInternal('value', values);
        };

        this.decorateRowOverride = function(row) {
            // implement in subclasses
        };

        // Private Methods

        this._addRow = function(editor) {
            var removeButton = new EditorRemoveButton(),
                row = new HStackPanel();

            row.addClass(CSS.formatClassName(module.id, 'row'));

            editor.on('value.change', this.onInputChange, this);
            removeButton.on('click', function(e) {
                row.remove();
                this.onInputChange();
            }, this);

            row
                .set(_editor, editor)
                .addChild(editor)
                .addChild(removeButton);

            this._rowsPanel.addChild(row);
            this.decorateRowOverride(row);

            return row;
        };

    });

});
