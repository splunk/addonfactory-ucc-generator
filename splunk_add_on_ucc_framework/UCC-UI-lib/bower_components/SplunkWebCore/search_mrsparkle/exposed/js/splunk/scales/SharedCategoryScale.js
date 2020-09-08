define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ArrayProperty = require("jg/properties/ArrayProperty");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var Set = require("jg/utils/Set");
    var UID = require("jg/utils/UID");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");
    var LegacySplunkLegend = require("splunk.legend");

    return Class(module.id, Scale, function(SharedCategoryScale, base) {

        // Private Static Constants

        var _ID_PREFIX = module.id.replace(/[^\w]/g, "-") + "-";

        // Public Properties

        this.categories = new ArrayProperty("categories", String)
            .readOnly(true)
            .getter(function() {
                var categories = [];
                if (this._isRegistered) {
                    for (var i = 0, l = LegacySplunkLegend.numLabels(); i < l; i++) {
                        categories.push(LegacySplunkLegend.getLabelAt(i));
                    }
                }
                return categories;
            });

        this.isDiscreteScale = true;

        // Private Properties

        this._registerID = null;
        this._registerSet = null;
        this._isRegistered = false;
        this._wasRegistered = false;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._legendLabelIndexMapChanged = FunctionUtil.bind(this._legendLabelIndexMapChanged, this);

            this._registerID = _ID_PREFIX + UID.get(this);
            this._registerSet = new Set();
        };

        // Public Methods

        this.register = function(key) {
            base.register.call(this, key);

            this._registerSet.add(key);

            if ((this._registerSet.size() === 1) && !this._isRegistered) {
                LegacySplunkLegend.register(this._registerID);
                LegacySplunkLegend.addEventListener("labelIndexMapChanged", this._legendLabelIndexMapChanged);

                this._isRegistered = true;

                this.invalidate("computeValueMapPass");
            }
        };

        this.unregister = function(key) {
            base.unregister.call(this, key);

            this._registerSet.del(key);

            if ((this._registerSet.size() === 0) && this._isRegistered) {
                this._isRegistered = false;

                LegacySplunkLegend.removeEventListener("labelIndexMapChanged", this._legendLabelIndexMapChanged);
                LegacySplunkLegend.unregister(this._registerID);

                this.invalidate("computeValueMapPass");
            }
        };

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var wasRegistered = this._wasRegistered;
            this._wasRegistered = this._isRegistered;

            if (!this._isRegistered) {
                return wasRegistered;
            }

            // remove empty values
            for (var i = values.length - 1; i >= 0; i--) {
                if (!values[i]) {
                    values.splice(i, 1);
                }
            }

            LegacySplunkLegend.setLabels(this._registerID, values);
            return !wasRegistered;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            if (!this._isRegistered) {
                return [];
            }

            return [ 0, Math.max(LegacySplunkLegend.numLabels() - 1, 0) ];
        };

        this.parseValueOverride = function(value) {
            return DataUtil.parseString(value);
        };

        this.valueToLinearOverride = function(value) {
            if (!this._isRegistered) {
                return NaN;
            }

            var index = LegacySplunkLegend.getLabelIndex(value);
            return (index >= 0) ? index : NaN;
        };

        this.linearToValueOverride = function(linear) {
            if (!this._isRegistered) {
                return null;
            }

            var label = LegacySplunkLegend.getLabelAt(linear);
            return (label != null) ? label : null;
        };

        // Private Methods

        this._legendLabelIndexMapChanged = function() {
            this.invalidate("computeContainedRangePass");
            this.fire("valueMapChange");
        };

    });

});
