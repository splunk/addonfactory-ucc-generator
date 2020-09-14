define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Property = require("jg/properties/Property");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var MAttributionTarget = require("splunk/mapping2/controls/MAttributionTarget");
    var MRenderTarget = require("splunk/viz/MRenderTarget");
    var VizBase = require("splunk/viz/VizBase");

    return Class(module.id, VizBase, function(LayerBase, base) {

        Class.mixin(this, MRenderTarget, MAttributionTarget);

        // Public Properties

        this.map = new Property("map", Object, null)
            .readOnly(true);

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-LayerBase");

            this.setStyle({ position: "absolute" });

            this._map_boundsChanged = FunctionUtil.bind(this._map_boundsChanged, this);
        };

        // Public Methods

        this.render = function() {
            if (this.isValid("renderPass")) {
                return;
            }

            var map = this.getInternal("map");
            if (map) {
                this.renderOverride(map);
            }

            this.markValid("renderPass");
        };

        // Protected Methods

        this.renderOverride = function(map) {
        };

        this.onAddedToMap = function(map) {
            this.setInternal("map", map);

            map.on("boundsChanged", this._map_boundsChanged);

            this.invalidate("renderPass");
        };

        this.onRemovedFromMap = function(map) {
            map.off("boundsChanged", this._map_boundsChanged);

            this.setInternal("map", null);
        };

        // Private Methods

        this._map_boundsChanged = function(e) {
            this.invalidate("renderPass");
        };

    });

});
