define(function(require, exports, module) {

    var SplunkLegend = require("splunk.legend");
    var Class = require("jg/Class");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var Legend = require("splunk/charting/Legend");

    return Class(module.id, Legend, function(ExternalLegend, base) {

        // Private Static Properties

        var _instanceCount = 0;

        // Private Properties

        this._id = null;
        this._isConnected = false;
        this._cachedExternalNumLabels = -1;
        this._cachedExternalLabelMap = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._external_setLabels = FunctionUtil.bind(this._external_setLabels, this);
            this._external_labelIndexMapChanged = FunctionUtil.bind(this._external_labelIndexMapChanged, this);

            this._id = "splunk-charting-ExternalLegend-" + (++_instanceCount);
        };

        // Public Methods

        this.connect = function() {
            this.close();

            SplunkLegend.register(this._id);
            SplunkLegend.addEventListener("setLabels", this._external_setLabels);
            SplunkLegend.addEventListener("labelIndexMapChanged", this._external_labelIndexMapChanged);

            this._isConnected = true;
        };

        this.close = function() {
            if (!this._isConnected) {
                return;
            }

            this._isConnected = false;

            SplunkLegend.removeEventListener("labelIndexMapChanged", this._external_labelIndexMapChanged);
            SplunkLegend.removeEventListener("setLabels", this._external_setLabels);
            SplunkLegend.unregister(this._id);
        };

        this.isConnected = function() {
            return this._isConnected;
        };

        // Protected Methods

        this.getNumLabelsOverride = function() {
            if (this._isConnected) {
                var value = this._cachedExternalNumLabels;
                if (value < 0) {
                    value = this._cachedExternalNumLabels = SplunkLegend.numLabels();
                }
                return value;
            }

            return -1;
        };

        this.getLabelIndexOverride = function(label) {
            if (this._isConnected) {
                var labelMap = this._cachedExternalLabelMap;
                if (!labelMap) {
                    labelMap = this._cachedExternalLabelMap = {};
                }
                var index = labelMap[label];
                if (index == null) {
                    index = labelMap[label] = SplunkLegend.getLabelIndex(label);
                }
                return index;
            }

            return -1;
        };

        this.updateLabelsOverride = function(labels) {
            if (this._isConnected) {
                this._cachedExternalNumLabels = -1;
                this._cachedExternalLabelMap = null;
                SplunkLegend.setLabels(this._id, labels);
                return true;
            }

            return false;
        };

        // Private Methods

        this._external_setLabels = function() {
            this.notifySettingLabels();
        };

        this._external_labelIndexMapChanged = function() {
            this._cachedExternalNumLabels = -1;
            this._cachedExternalLabelMap = null;

            this.notifyLabelIndexMapChanged();
        };

    });

});
