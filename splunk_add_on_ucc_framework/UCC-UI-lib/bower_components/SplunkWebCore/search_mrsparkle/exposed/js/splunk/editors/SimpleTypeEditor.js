define(function(require, exports, module) {

    var Backbone = require("backbone");
    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var StringUtil = require("jg/utils/StringUtil");
    var ValueEditor = require("splunk/editors/ValueEditor");
    var TextControl = require("views/shared/controls/TextControl");

    require("./SimpleTypeEditor.pcss");

    return Class(module.id, ValueEditor, function(SimpleTypeEditor, base) {

        // Private Static Constants

        var _R_REGEXP = /^\/(.+)\/([igm]*)$/;

        // Private Static Methods

        var _getFromStringMethod = function(type) {
            switch (type) {
                case Number:
                    return _numberFromString;
                case Boolean:
                    return _booleanFromString;
                case String:
                    return _stringFromString;
                case Date:
                    return _dateFromString;
                case RegExp:
                    return _regexpFromString;
                default:
                    if ((type.fromString != null) && Class.isFunction(type.fromString)) {
                        return FunctionUtil.bind(_customFromString, type);
                    }
                    return null;
            }
        };

        var _numberFromString = function(str) {
            str = StringUtil.trim("" + str);
            return str ? Number(str) : NaN;
        };

        var _booleanFromString = function(str) {
            str = StringUtil.trim("" + str).toLowerCase();
            return ((str === "true") || (str === "t") || (str === "1"));
        };

        var _stringFromString = function(str) {
            return ("" + str);
        };

        var _dateFromString = function(str) {
            str = StringUtil.trim("" + str);
            var date = str ? new Date(str) : null;
            return (date && !isNaN(date.getTime())) ? date : null;
        };

        var _regexpFromString = function(str) {
            str = StringUtil.trim("" + str);
            var match = str.match(_R_REGEXP);
            return match ? new RegExp(match[1], match[2]) : null;
        };

        var _customFromString = function(str) {
            str = StringUtil.trim("" + str);
            return str ? this.fromString(str) : null;
        };

        // Public Properties

        this.type = new ObservableProperty("type", Function, String)
            .setter(function(value) {
                if (value == null) {
                    throw Error("Value assigned to property \"type\" must be non-null.");
                }

                var fromStringMethod = _getFromStringMethod(value);
                if (!fromStringMethod) {
                    throw new Error("Value assigned to property \"type\" must define fromString method.");
                }

                this._fromString = fromStringMethod;
                this._typeChecker = Class.getTypeChecker(value);
                this._checkNaN = (value === Number);

                if (value === Number) {
                    this._nullValue = NaN;
                } else if (value === Boolean) {
                    this._nullValue = false;
                } else if (value === String) {
                    this._nullValue = "";
                } else {
                    this._nullValue = null;
                }
            })
            .onChange(function(e) {
                // reprocess the value using the new type
                this.processInput();
            });

        // Private Properties

        this._fromString = _stringFromString;
        this._typeChecker = Class.getTypeChecker(String);
        this._checkNaN = false;
        this._nullValue = "";
        this._model = null;
        this._view = null;

        // Constructor

        this.constructor = function(type) {
            base.constructor.call(this);

            if (type != null) {
                this.set('type', type);
            }
        };

        // Protected Methods

        this.valueWriteFilter = function(value) {
            return ((value != null) && this._typeChecker(value)) ? value : this._nullValue;
        };

        this.setupOverride = function() {
            this._model = new Backbone.Model({
                value: ''
            });

            this._view = new TextControl({
                model: this._model,
                modelAttribute: 'value'
            });

            this._model.on("change", this.onInputChange, this);
            this.element.appendChild(this._view.render().el);
        };

        this.teardownOverride = function() {
            this._view.remove();
        };

        this.renderInputOverride = function() {
            var value = this.getInternal('value');
            var str;
            if ((value != null) && (!this._checkNaN || !isNaN(value))) {
                str = value.toString();
            } else {
                str = "";
            }
            this._model.set('value', str);
        };

        this.processInputOverride = function() {
            var str = this._model.get('value') || '';
            var value = this._fromString(str);
            this.setInternal('value', value);
        };

        this.onDisabled = function() {
            base.onDisabled.call(this);

            this._view.disable();
        };

        this.onEnabled = function() {
            this._view.enable();

            base.onEnabled.call(this);
        };

    });

});
