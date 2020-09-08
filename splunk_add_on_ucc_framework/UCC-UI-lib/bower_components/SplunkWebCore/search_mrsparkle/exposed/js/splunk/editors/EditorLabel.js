define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var StringUtil = require("jg/utils/StringUtil");
    var Element = require("splunk/display/Element");
    var Editor = require("splunk/editors/Editor");

    require("./EditorLabel.pcss");

    return Class(module.id, Element, function(EditorLabel, base) {

        // Public Properties

        this.text = new ObservableProperty("text", String, "")
            .writeFilter(function(value) {
                return value || "";
            })
            .setter(function(value) {
                this.element.innerHTML = value ? StringUtil.escapeHTML(value) : "";
            });

        this.editor = new ObservableProperty("editor", Editor, null)
            .setter(function(value) {
                if (value) {
                    this.element.setAttribute("for", value.element.id);
                } else {
                    this.element.removeAttribute("for");
                }
            });

        // Constructor

        this.constructor = function(text) {
            base.constructor.call(this, "label");

            if (text != null) {
                this.set("text", text);
            }
        };

    });

});
