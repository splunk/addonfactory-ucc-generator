/*
 * See the "Changes to PDF Rendering Code" section of https://confluence.splunk.com/display/PROD/Choropleth+UI+ERD
 * for discussion of the purpose of this file.
 */
define(function(require, exports, module) {

    var Class = require("jg/Class");
    var LayerBase = require("splunk/mapping/layers/LayerBase");
    var Viewport = require("splunk/vectors/Viewport");

    return Class(module.id, LayerBase, function(DummyLeafletVectorLayerBase, base) {

        // Public Properties

        this.vectorContainer = null;
        this.vectorBounds = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);
            var element = document.createElement('div');
            this.vectorContainer = new Viewport()
                .appendTo(element);
            this.vectorBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        };

        // Protected Methods

        this.onAddedToMap = function(map) {
            base.onAddedToMap.call(this, map);
            this.vectorBounds = map.leafletMap._vectorLayerBounds;
        };

        this.onRemovedFromMap = function(map) {
            this.vectorBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
            base.onRemovedFromMap.call(this, map);
        };

        this.createLeafletLayer = function() {
            return {};
        };

    });

});
