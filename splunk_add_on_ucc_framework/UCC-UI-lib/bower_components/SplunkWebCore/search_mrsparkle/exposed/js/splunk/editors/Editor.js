define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Element = require("splunk/display/Element");

    return Class(module.id, Element, function(Editor, base) {

        // Private Static Constants

        var _ID_PREFIX = module.id.replace(/[^\w]+/g, "-") + "-";

        // Private Static Properties

        var _idCount = 0;

        // Public Passes

        this.renderInputPass = new Pass("renderInput", 1, "topDown");

        // Public Properties

        this.hasError = new ObservableProperty("hasError", Boolean, false)
            .onChange(function(e) {
                this.invalidate("renderInputPass");
            });

        // Private Properties

        this._isRendering = false;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.element.id = _ID_PREFIX + (++_idCount);

            this.setupOverride();
            this.processInput();
        };

        // Public Methods

        this.dispose = function() {
            this.teardownOverride();

            base.dispose.call(this);
        };

        this.renderInput = function() {
            if (this._isRendering || this.isValid("renderInputPass")) {
                return this;
            }

            try {
                this._isRendering = true;

                if (this.getInternal("hasError")) {
                    this.addClass("error");
                } else {
                    this.removeClass("error");
                }

                this.renderInputOverride();
            } finally {
                this._isRendering = false;
            }

            this.markValid("renderInputPass");

            return this;
        };

        this.processInput = function() {
            if (this._isRendering) {
                return this;
            }

            this.setInternal("hasError", false);
            this.processInputOverride();
            this.invalidate("renderInputPass");

            return this;
        };

        // Protected Methods

        this.setupOverride = function() {
            // implement in subclasses
        };

        this.teardownOverride = function() {
            // implement in subclasses
        };

        this.renderInputOverride = function() {
            // implement in subclasses
        };

        this.processInputOverride = function() {
            // implement in subclasses
        };

        this.onInputChange = function() {
            // call onInputChange from subclasses when input changes
            this.processInput();
        };

        this.onDisabled = function() {
            this.addClass("disabled");
        };

        this.onEnabled = function() {
            this.removeClass("disabled");
        };

    });

});
