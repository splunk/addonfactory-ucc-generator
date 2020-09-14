define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var MarkerBase = require("splunk/mapping2/layers/MarkerBase");
    var Circle = require("splunk/vectors/Circle");

    return Class(module.id, MarkerBase, function(CircleMarker, base) {

        // Public Properties

        this.color = new ObservableProperty("color", Color, Color.fromNumber(0x000000))
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                return value ? value.clone().normalize() : new Color();
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.opacity = new ObservableProperty("opacity", Number, 1)
            .writeFilter(function(value) {
                return ((value >= 0) && (value <= Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        // Constructor

        this.constructor = function(latLon, size, color, opacity) {
            base.constructor.call(this, new Circle(), latLon, size);

            if (color != null) {
                this.set("color", color);
            }
            if (opacity != null) {
                this.set("opacity", opacity);
            }
        };

        // Protected Methods

        this.renderOverride = function(element, x, y, size) {
            element.x(x);
            element.y(y);
            element.radius(size / 2);
            element.fillColor(this.getInternal("color").toNumber());
            element.fillOpacity(this.getInternal("opacity"));
        };

    });

});
