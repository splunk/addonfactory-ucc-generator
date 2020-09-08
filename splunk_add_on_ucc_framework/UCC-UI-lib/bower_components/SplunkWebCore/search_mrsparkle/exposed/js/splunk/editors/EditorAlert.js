define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableEnumProperty = require("jg/properties/ObservableEnumProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var StringUtil = require("jg/utils/StringUtil");
    var Element = require("splunk/display/Element");

    require("./EditorAlert.pcss");

    return Class(module.id, Element, function(EditorAlert, base) {

        // Private Static Constants

        var _LEVEL_CLASS_MAP = {
            "info": "alert-info",
            "warn": "alert-warning",
            "error": "alert-error"
        };

        // Public Properties

        this.level = new ObservableEnumProperty("level", String, [ "info", "warn", "error" ])
            .onChange(function(e) {
                this.removeClass(_LEVEL_CLASS_MAP[e.oldValue]);
                this.addClass(_LEVEL_CLASS_MAP[e.newValue]);
            });

        this.text = new ObservableProperty("text", String, "")
            .writeFilter(function(value) {
                return value || "";
            })
            .setter(function(value) {
                this._span.innerHTML = value ? StringUtil.escapeHTML(value) : "";
            });

        // Private Properties

        this._icon = null;
        this._span = null;

        // Constructor

        this.constructor = function(level, text) {
            base.constructor.call(this);

            this.addClass("alert");
            this.addClass(_LEVEL_CLASS_MAP["info"]);

            this._icon = document.createElement("i");
            this._icon.className = "icon-alert";

            this._span = document.createElement("span");

            this.element.appendChild(this._icon);
            this.element.appendChild(this._span);

            if (level != null) {
                this.set("level", level);
            }
            if (text != null) {
                this.set("text", text);
            }
        };

    });

});
