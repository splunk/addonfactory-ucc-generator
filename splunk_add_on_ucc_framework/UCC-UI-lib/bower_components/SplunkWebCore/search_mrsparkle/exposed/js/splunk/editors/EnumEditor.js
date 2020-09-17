define(function(require, exports, module) {

    var Backbone = require("backbone");
    var Class = require("jg/Class");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableEnumProperty = require("jg/properties/ObservableEnumProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Set = require("jg/utils/Set");
    var ValueEditor = require("splunk/editors/ValueEditor");
    var SelectControl = require("views/shared/controls/SyntheticSelectControl");

    return Class(module.id, ValueEditor, function(EnumEditor, base) {

        // Private Static Methods

        var _safeKey = function(key) {
            // Backbone.extend copies all 'static' class members from base classes to subclasses.
            // If a Backbone class is used in the list of values, it will have a uid stored on it
            // when it's passed through the Set for deduping. That uid could be copied to subclasses
            // and cause false positive key matches in the Set. To avoid this, if we detect a
            // function being used as a key, we will use its prototype as the key instead.
            return ((key != null) && Class.isFunction(key)) ? (key.prototype || key) : key;
        };

        // Public Properties

        this.values = new ObservableArrayProperty("values")
            .allowNull(true)
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        this.labels = new ObservableArrayProperty("labels", String, [])
            .allowNull(true)
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        this.defaultLabel = new ObservableProperty("defaultLabel", String, null)
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        this.menuWidth = new ObservableEnumProperty("menuWidth", String, [ "normal", "narrow", "wide" ])
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        // Private Properties

        this._model = null;
        this._view = null;

        // Public Methods

        this.addOption = function(value, label) {
            var values = this.getInternal("values").concat();
            values.push((value != null) ? value : null);

            if (label != null) {
                var labels = this.getInternal("labels").concat();
                var valueCount = values.length;
                for (var i = labels.length; i < valueCount; i++) {
                    labels.push(null);
                }
                labels[valueCount - 1] = label;

                this.setInternal("labels", labels);
            }

            this.setInternal("values", values);

            return this;
        };

        // Protected Methods

        this.setupOverride = function() {
            this._model = new Backbone.Model({
                value: null
            });

            this._view = new SelectControl({
                model: this._model,
                modelAttribute: 'value',
                toggleClassName: 'btn'
            });

            this._model.on("change", this.onInputChange, this);
            this.element.appendChild(this._view.render().el);
        };

        this.teardownOverride = function() {
            this._view.remove();
        };

        this.renderInputOverride = function() {
            var i, l, itemValue, itemLabel,
                value = this.getInternal('value'),
                values = this.getInternal('values'),
                labels = this.getInternal('labels'),
                labelsCount= labels.length,
                valuesSet = new Set(),
                dropdownItems = [];

            for (i = 0, l = values.length; i < l; i++) {
                itemValue = values[i];
                itemLabel = (i < labelsCount) ? labels[i] : null;

                if (!valuesSet.has(_safeKey(itemValue))) {
                    dropdownItems.push({
                        value: itemValue,
                        label: itemLabel || String(itemValue)
                    });
                    valuesSet.add(_safeKey(itemValue));
                }
            }

            if (!valuesSet.has(_safeKey(value))) {
                dropdownItems.unshift({
                    value: value,
                    label: this.getInternal('defaultLabel') || '...'
                });
            }

            this._view.options.menuWidth = this.getInternal('menuWidth');
            this._view.setItems(dropdownItems);
            this._model.set('value', value);
        };

        this.processInputOverride = function() {
            var value = this._model.get('value');
            this.setInternal('value', value);
        };

    });

});
