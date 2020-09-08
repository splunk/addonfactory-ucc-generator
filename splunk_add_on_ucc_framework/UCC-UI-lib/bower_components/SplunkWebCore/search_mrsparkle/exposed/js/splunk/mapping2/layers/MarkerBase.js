define(function(require, exports, module) {

    var Class = require("jg/Class");
    var MPassTarget = require("jg/async/MPassTarget");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var Point = require("jg/geom/Point");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var LatLon = require("splunk/mapping2/LatLon");
    var VectorElement = require("splunk/vectors/VectorElement");
    var MRenderTarget = require("splunk/viz/MRenderTarget");

    return Class(module.id, Object, function(MarkerBase, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget, MRenderTarget);

        // Public Properties

        this.latLon = new ObservableProperty("latLon", LatLon, new LatLon())
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                return (value && value.isFinite()) ? value.clone() : new LatLon();
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            });

        this.size = new ObservableProperty("size", Number, 50)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.markerLayer = new Property("markerLayer", Object, null)
            .readOnly(true);

        this.renderPriority = 1;

        this.element = null;

        this.metadata = null;

        // Private Properties

        this._position = null;

        // Constructor

        this.constructor = function(element, latLon, size) {
            if (element == null) {
                throw new Error("Parameter element must be non-null.");
            }
            if (!(element instanceof VectorElement)) {
                throw new Error("Parameter element must be of type " + Class.getName(VectorElement) + ".");
            }

            base.constructor.call(this);

            this.element = element;

            this.metadata = {};

            if (latLon != null) {
                this.set("latLon", latLon);
            }
            if (size != null) {
                this.set("size", size);
            }

            this._position = new Point();
        };

        // Public Methods

        this.render = function(position) {
            if (position == null) {
                position = this._position;
            } else if (!(position instanceof Point)) {
                throw new Error("Parameter position must be of type " + Class.getName(Point) + ".");
            }

            if (this.isValid("renderPass")) {
                if (this._position.equals(position)) {
                    return;
                }
                this.invalidate("renderPass");
            }

            if (this._position !== position) {
                this._position = position.clone();
            }

            this.renderOverride(this.element, position.x, position.y, this.getInternal("size"));

            this.markValid("renderPass");
        };

        // Protected Methods

        this.renderOverride = function(element, x, y, size) {
        };

        this.onAddedToLayer = function(markerLayer) {
            this.setInternal("markerLayer", markerLayer);
        };

        this.onRemovedFromLayer = function(markerLayer) {
            this.setInternal("markerLayer", null);
        };

    });

});
