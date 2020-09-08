define(function(require, exports, module) {

    var Class = require("jg/Class");
    var MPassTarget = require("jg/async/MPassTarget");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var Property = require("jg/properties/Property");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var MRenderTarget = require("splunk/viz/MRenderTarget");

    return Class(module.id, Object, function(LayerBase, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget, MRenderTarget);

        // Public Static Constants

        LayerBase.METADATA_KEY = "__splunk_mapping_layers_LayerBase_metadata";

        // Public Properties

        this.map = new Property("map", Object, null)
            .readOnly(true);

        this.leafletLayer = null;

        // Constructor

        this.constructor = function() {
            this._map_boundsChanged = FunctionUtil.bind(this._map_boundsChanged, this);

            this.leafletLayer = this.createLeafletLayer();
            if (!this.leafletLayer) {
                throw new Error("Value returned from createLeafletLayer() must be non-null.");
            }
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

        this.createLeafletLayer = function() {
            throw new Error("Must implement method createLeafletLayer.");
        };

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
