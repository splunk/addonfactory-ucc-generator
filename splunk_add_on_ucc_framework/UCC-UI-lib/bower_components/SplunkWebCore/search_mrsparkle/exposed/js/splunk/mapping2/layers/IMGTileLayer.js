define(function(require, exports, module) {

    var Class = require("jg/Class");
    var TileLayerBase = require("splunk/mapping2/layers/TileLayerBase");

    return Class(module.id, TileLayerBase, function(IMGTileLayer, base) {

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-IMGTileLayer");
        };

        // Protected Methods

        this.createTileContainer = function() {
            var container = document.createElement("div");
            container.style.position = "absolute";
            container.style.left = "0px";
            container.style.top = "0px";

            this.element.appendChild(container);

            return container;
        };

        this.destroyTileContainer = function(container) {
            this.element.removeChild(container);
        };

        this.displayTileContainer = function(container, display) {
            if (display) {
                container.style.display = "";
                this.element.appendChild(container);
            } else {
                container.style.display = "none";
            }
        };

        this.createTile = function(container, url, onLoad, onError) {
            var tile = document.createElement("img");
            tile.style.position = "absolute";
            tile.style.margin = "0px";
            tile.style.padding = "0px";
            tile.style.border = "0px none";
            tile.style.visibility = "hidden";
            tile.style.opacity = "0";
            tile.style.transition = "opacity 0.2s linear";
            tile.style.OTransition = "opacity 0.2s linear";
            tile.style.MozTransition = "opacity 0.2s linear";
            tile.style.WebkitTransition = "opacity 0.2s linear";

            tile.onload = function() {
                tile.style.visibility = "";
                tile.style.opacity = "1";

                tile.onload.transitionTimeout = setTimeout(onLoad, 200);
            };

            tile.onerror = function() {
                onError();
            };

            tile.src = url;

            container.appendChild(tile);

            return tile;
        };

        this.destroyTile = function(container, tile) {
            clearTimeout(tile.onload.transitionTimeout);

            tile.onload = null;
            tile.onerror = null;

            container.removeChild(tile);

            tile.src = null;
        };

        this.positionTile = function(tile, x, y, width, height) {
            tile.style.left = x + "px";
            tile.style.top = y + "px";
            tile.style.width = width + "px";
            tile.style.height = height + "px";
        };

    });

});
