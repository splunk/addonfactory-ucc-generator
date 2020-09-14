define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Rectangle = require("jg/geom/Rectangle");
    var TileLayerBase = require("splunk/mapping2/layers/TileLayerBase");
    var Group = require("splunk/vectors/Group");
    var Image = require("splunk/vectors/Image");
    var Viewport = require("splunk/vectors/Viewport");

    return Class(module.id, TileLayerBase, function(SVGTileLayer, base) {

        // Private Properties

        this._tileViewport = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-SVGTileLayer");

            this._tileViewport = new Viewport()
                .appendTo(this.element);
        };

        // Public Methods

        this.toSVGString = function() {
            this.validate();

            return this._tileViewport.toSVGString();
        };

        // Protected Methods

        this.renderOverride = function(map) {
            var width = map.get("width");
            var height = map.get("height");

            var tileViewport = this._tileViewport;
            tileViewport.width(width);
            tileViewport.height(height);
            tileViewport.viewBox(new Rectangle(0, 0, width, height));

            base.renderOverride.call(this, map);
        };

        this.createTileContainer = function() {
            var container = new Group();
            container.appendTo(this._tileViewport);
            return container;
        };

        this.destroyTileContainer = function(container) {
            container.remove();
        };

        this.displayTileContainer = function(container, display) {
            if (display) {
                container.display(null);
                container.appendTo(this._tileViewport);
            } else {
                container.display("none");
            }
        };

        this.createTile = function(container, url, onLoad, onError) {
            var tile = new Image();
            tile.onLoad(onLoad);
            tile.onError(onError);
            tile.preserveAspectRatio("none");
            tile.href(url);
            tile.appendTo(container);
            tile.element.style.opacity = this.getInternal("tileOpacity");
            return tile;
        };

        this.destroyTile = function(container, tile) {
            tile.onLoad(null);
            tile.onError(null);
            tile.href(null);
            tile.remove();
        };

        this.positionTile = function(tile, x, y, width, height) {
            tile.x(x);
            tile.y(y);
            tile.width(width);
            tile.height(height);
        };

    });

});
