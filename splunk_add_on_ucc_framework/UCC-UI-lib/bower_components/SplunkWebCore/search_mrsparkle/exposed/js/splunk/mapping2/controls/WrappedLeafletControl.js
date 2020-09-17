define(function(require, exports, module) {

    var Class = require('jg/Class');
    var Property = require('jg/properties/Property');
    var LeafletControlBase = require('splunk/mapping/controls/ControlBase');
    var ControlBase = require('splunk/mapping2/controls/ControlBase');
    var VectorUtils = require('splunk/vectors/VectorUtils');

    return Class(module.id, ControlBase, function(WrappedLeafletControl, base) {

        // Private Static Constants

        var _CONTROL_MARGIN = 10;

        // Public Properties

        this.wrappedControl = new Property('wrappedControl', LeafletControlBase, null);

        // Constructor

        this.constructor = function(wrappedControl) {
            base.constructor.call(this);
            this.set('wrappedControl', wrappedControl);
        };

        // Public Methods

        this.toSVGString = function() {
            var wrappedControl = this.getInternal('wrappedControl');
            if (!wrappedControl) {
                throw new Error('wrappedControl must be set before toSVGString is called');
            }
            var map = this.getInternal('map');
            if (!map) {
                throw new Error('toSVGString cannot be called before adding to the map');
            }
            this.validate();
            var svg = wrappedControl.leafletControl.getContainer().getElementsByTagName('svg')[0];
            if (!svg) {
                window.console.warn('No SVG node found in wrapped control, rendering nothing.');
                return '';
            }
            var mapWidth = map.get('width');
            var mapHeight = map.get('height');
            var controlWidth = svg.getAttribute('width');
            var controlHeight = svg.getAttribute('height');
            var controlPosition = wrappedControl.leafletControl.options.position;
            var viewBox = null;
            if (controlPosition === 'bottomright') {
                viewBox = [
                    controlWidth - mapWidth + _CONTROL_MARGIN,
                    controlHeight - mapHeight + _CONTROL_MARGIN,
                    mapWidth,
                    mapHeight
                ];
            }
            if (viewBox) {
                svg.setAttribute('viewBox', viewBox.join(' '));
            }
            return VectorUtils.toSVGString(svg);
        };

        // Protected Methods

        this.onAddedToMap = function(map) {
            var wrappedControl = this.getInternal('wrappedControl');
            if (!wrappedControl) {
                throw new Error('wrappedControl must be set before adding to the map');
            }
            base.onAddedToMap.call(this, map);
            wrappedControl.onAddedToMap({});
        };

        this.onRemovedFromMap = function(map) {
            var wrappedControl = this.getInternal('wrappedControl');
            if (wrappedControl) {
                wrappedControl.onRemovedFromMap({});
            }
            base.onRemovedFromMap.call(this, map);
        };

    });

});
