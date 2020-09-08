define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Rectangle = require("jg/geom/Rectangle");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var ControlBase = require("splunk/mapping2/controls/ControlBase");
    var MAttributionTarget = require("splunk/mapping2/controls/MAttributionTarget");
    var Rect = require("splunk/vectors/Rect");
    var Text = require("splunk/vectors/Text");
    var Viewport = require("splunk/vectors/Viewport");

    return Class(module.id, ControlBase, function(SVGAttributionControl, base) {

        // Private Static Constants

        var _R_TRIM_HTML = /<[^>]*>/g;

        // Private Properties

        this._layers = null;
        this._attributionViewport = null;
        this._attributionText = null;
        this._attributionRect = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-controls-SVGAttributionControl");

            this._map_layersChanged = FunctionUtil.bind(this._map_layersChanged, this);
            this._layer_attribution_change = FunctionUtil.bind(this._layer_attribution_change, this);

            this._layers = [];

            this._attributionViewport = new Viewport()
                .appendTo(this.element);

            this._attributionRect = new Rect()
                .fillColor(0xFFFFFF)
                .fillOpacity(0.7)
                .appendTo(this._attributionViewport);

            this._attributionText = new Text()
                .fillColor(0x333333)
                .fontFamily("Helvetica, Arial, sans-serif")
                .fontSize("11px")
                .dominantBaseline("text-before-edge")
                .appendTo(this._attributionViewport);
        };

        // Public Methods

        this.toSVGString = function() {
            this.validate();

            return this._attributionViewport.toSVGString();
        };

        // Protected Methods

        this.renderOverride = function(map) {
            var width = map.get("width");
            var height = map.get("height");

            var str = "";
            var layers = this._layers;
            var attribution;
            for (var i = 0, l = layers.length; i < l; i++) {
                attribution = layers[i].get(MAttributionTarget.attribution);
                if (attribution) {
                    if (str) {
                        str += " ";
                    }
                    str += attribution;
                }
            }
            str = str.replace(_R_TRIM_HTML, "");

            var text = this._attributionText;
            text.text(str);

            var padding = str ? { left: 5, top: 1, right: 0, bottom: 1 } : { left: 0, top: 0, right: 0, bottom: 0 };

            var textBounds = text.getBounds();

            var rectWidth = Math.round(textBounds.width + padding.left + padding.right);
            var rectHeight = Math.round(textBounds.height + padding.top + padding.bottom);
            var rectX = Math.round(width - rectWidth);
            var rectY = Math.round(height - rectHeight);

            var textX = Math.round(rectX + padding.left);
            var textY = Math.round(rectY + padding.top);

            text.x(textX);
            text.y(textY);
            text.display(str ? null : "none");

            var rect = this._attributionRect;
            rect.x(rectX);
            rect.y(rectY);
            rect.width(rectWidth);
            rect.height(rectHeight);
            rect.display(str ? null : "none");

            var viewport = this._attributionViewport;
            viewport.width(width);
            viewport.height(height);
            viewport.viewBox(new Rectangle(0, 0, width, height));
        };

        this.onAddedToMap = function(map) {
            base.onAddedToMap.call(this, map);

            map.on("layersChanged", this._map_layersChanged);

            this._updateLayers();
        };

        this.onRemovedFromMap = function(map) {
            map.off("layersChanged", this._map_layersChanged);

            base.onRemovedFromMap.call(this, map);

            this._updateLayers();
        };

        // Private Methods

        this._updateLayers = function() {
            var map = this.getInternal("map");
            var oldLayers = this._layers;
            var newLayers = this._layers = map ? map.getLayers() : [];
            var layer;
            var i, l;

            for (i = 0, l = oldLayers.length; i < l; i++) {
                oldLayers[i].off("attribution.change", this._layer_attribution_change);
            }

            for (i = 0, l = newLayers.length; i < l; i++) {
                newLayers[i].on("attribution.change", this._layer_attribution_change);
            }

            this.invalidate("renderPass");
        };

        this._map_layersChanged = function(e) {
            this._updateLayers();
        };

        this._layer_attribution_change = function(e) {
            this.invalidate("renderPass");
        };

    });

});
