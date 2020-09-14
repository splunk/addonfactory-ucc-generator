define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var StringUtil = require("jg/utils/StringUtil");
    var Element = require("splunk/display/Element");

    return Class(module.id, Element, function(EditorAddButton, base) {

        // Private Static Methods

        var _preventDefault = function(e) {
            e.preventDefault();
        };

        // Public Properties

        this.label = new ObservableProperty("label", String, null)
            .setter(function(value) {
                this.element.innerHTML = value ? StringUtil.escapeHTML(value) : "+";
            });

        // Constructor

        this.constructor = function() {
            base.constructor.call(this, 'a');

            this.addClass('btn');

            this.element.href = '#';
            this.element.innerHTML = '+';

            this.on("click", _preventDefault, this, Infinity);
        };

    });

});
