define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Editor = require("splunk/editors/Editor");

    return Class(module.id, Editor, function(ValueEditor, base) {

        // Public Properties

        this.value = new ObservableProperty("value")
            .readFilter(function(value) {
                return this.valueReadFilter(value);
            })
            .writeFilter(function(value) {
                return this.valueWriteFilter(value);
            })
            .getter(function() {
                return this._value;
            })
            .setter(function(value) {
                if (this.valueChangeComparator(this._value, value)) {
                    this._value = value;
                    this.fire("value.change");
                }
            })
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        // Private Properties

        this._value = null;

        // Protected Methods

        this.valueReadFilter = function(value) {
            // override in subclasses
            return value;
        };

        this.valueWriteFilter = function(value) {
            // override in subclasses
            return value;
        };

        this.valueChangeComparator = function(oldValue, newValue) {
            // default comparison that handles NaN, override in subclasses
            return ((oldValue !== newValue) && ((oldValue === oldValue) || (newValue === newValue)));
        };

    });

});
