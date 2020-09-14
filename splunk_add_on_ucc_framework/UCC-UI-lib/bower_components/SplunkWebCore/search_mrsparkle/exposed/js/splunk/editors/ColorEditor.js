define(function(require, exports, module) {

    var Backbone = require("backbone");
    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ValueEditor = require("splunk/editors/ValueEditor");
    var ColorPickerControl = require("views/shared/controls/ColorPickerControl");

    require("./ColorEditor.pcss");

    return Class(module.id, ValueEditor, function(ColorEditor, base) {

        // Private Static Constants

        var _PALETTE_COLORS = [
            '#FFFFFF', '#555555', '#D93F3C', '#F7BC38', '#65A637',
            '#ED8440', '#6A5C9E', '#A2CC3E', '#3863A0', '#6DB7C6'
        ];

        // Private Properties

        this._model = null;
        this._view = null;
        this._disabledSquare = null;

        // Protected Methods

        this.valueReadFilter = function(value) {
            return value ? value.clone() : new Color();
        };

        this.valueWriteFilter = function(value) {
            return ((value != null) && (value instanceof Color)) ? value.clone().normalize() : new Color();
        };

        this.valueChangeComparator = function(oldValue, newValue) {
            return (oldValue && newValue) ? !oldValue.equals(newValue) : (oldValue !== newValue);
        };

        this.setupOverride = function() {
            this._model = new Backbone.Model({
                value: _PALETTE_COLORS[2 + Math.floor(Math.random() * (_PALETTE_COLORS.length - 2))]
            });

            this._view = new ColorPickerControl({
                model: this._model,
                modelAttribute: 'value',
                paletteColors: _PALETTE_COLORS
            });

            this._disabledSquare = document.createElement("div");
            this._disabledSquare.className = "color-square color-square-standalone disabled-square";

            this._model.on("change", this.onInputChange, this);
            this.element.appendChild(this._view.render().el);
            this.element.appendChild(this._disabledSquare);
        };

        this.teardownOverride = function() {
            this._view.remove();
        };

        this.renderInputOverride = function() {
            var value = this.getInternal('value');
            this._model.set('value', value.toString("hex"));
        };

        this.processInputOverride = function() {
            var value = Color.fromString(this._model.get('value'));
            this.setInternal('value', value);
        };

    });

});
