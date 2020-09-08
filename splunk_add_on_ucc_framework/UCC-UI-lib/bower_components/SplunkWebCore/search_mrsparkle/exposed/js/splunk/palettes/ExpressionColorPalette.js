define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ErrorUtil = require("jg/utils/ErrorUtil");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var Eval = require("util/eval");

    return Class(module.id, ColorPalette, function(ExpressionColorPalette, base) {

        // Private Static Methods

        var _flattenTo = function(target, value, path) {
            if ((value != null) && (typeof value === "object")) {
                if (Class.isArray(value)) {
                    for (var i = 0, l = value.length; i < l; i++) {
                        _flattenTo(target, value[i], path + "." + i);
                    }
                    return target;
                } else if (Class.isObject(value)) {
                    for (var p in value) {
                        if (ObjectUtil.has(value, p)) {
                            _flattenTo(target, value[p], path + "." + p);
                        }
                    }
                    return target;
                }
            }
            target[path] = value;
            return target;
        };

        // Public Properties

        this.rule = new ObservableProperty("rule", String, null)
            .setter(function(value) {
                this._expression = value ? Eval.compile(value) : null;
            });

        this.defaultColorPalette = new ObservableProperty("defaultColorPalette", ColorPalette, null);

        // Private Properties

        this._expression = null;

        // Constructor

        this.constructor = function(rule, defaultColorPalette) {
            base.constructor.call(this);

            if (rule != null) {
                this.set("rule", rule);
            }
            if (defaultColorPalette != null) {
                this.set("defaultColorPalette", defaultColorPalette);
            }
        };

        // Protected Methods

        this.getItemOverride = function(properties, ratio, span, value) {
            var expression = this._expression;
            if (expression) {
                var context = { ratio: ratio, span: span, value: value };

                // TODO: support data parameter and flatten into context object
                //if (data) {
                //    _flattenTo(context, data, "data");
                //}

                var result;
                try {
                    result = Eval.executeCompiled(expression, context);
                } catch (e) {
                    ErrorUtil.nonBlockingThrow(e);
                    return null;
                }

                if ((result != null) && (result !== "")) {
                    if (Class.isString(result)) {
                        return Color.fromString(result).normalize();
                    } else if (Class.isNumber(result)) {
                        return Color.fromNumber(result).normalize();
                    } else if (Class.isArray(result)) {
                        return Color.fromArray(result).normalize();
                    } else {
                        return new Color();
                    }
                }
            }

            var defaultColorPalette = properties.defaultColorPalette;
            if (defaultColorPalette) {
                return defaultColorPalette.getItem(ratio, span, value);
            }

            return null;
        };

    });

});
