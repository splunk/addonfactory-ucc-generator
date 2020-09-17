define(function(require, exports, module) {

    var Backbone = require("backbone");
    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ValueEditor = require("splunk/editors/ValueEditor");
    var BooleanRadioControl = require("views/shared/controls/BooleanRadioControl");

    return Class(module.id, ValueEditor, function(BooleanEditor, base) {

        // Public Properties

        this.trueLabel = new ObservableProperty("trueLabel", String, null)
            .onChange(function(e) {
                this._labelChanged = true;
                this.invalidate("renderInputPass");
            });

        this.falseLabel = new ObservableProperty("falseLabel", String, null)
            .onChange(function(e) {
                this._labelChanged = true;
                this.invalidate("renderInputPass");
            });

        // Private Properties

        this._model = null;
        this._view = null;
        this._labelChanged = false;

        // Protected Methods

        this.valueWriteFilter = function(value) {
            return (value === true);
        };

        this.setupOverride = function() {
            this._model = new Backbone.Model({
                value: '0'
            });

            this._model.on("change", this.onInputChange, this);

            this._createView();
        };

        this.teardownOverride = function() {
            this._view.remove();
        };

        this.renderInputOverride = function() {
            var value = this.getInternal('value');
            this._model.set('value', value ? '1' : '0');

            if (this._labelChanged) {
                this._labelChanged = false;
                this._createView();
            }
        };

        this.processInputOverride = function() {
            var value = this._model.get('value') === '1';
            this.setInternal('value', value);
        };

        // Private Methods

        this._createView = function() {
            if (this._view) {
                this._view.remove();
            }

            this._view = new BooleanRadioControl({
                model: this._model,
                modelAttribute: 'value',
                trueLabel: this.getInternal('trueLabel'),
                falseLabel: this.getInternal('falseLabel')
            });

            this.element.appendChild(this._view.render().el);
        };

    });

});
