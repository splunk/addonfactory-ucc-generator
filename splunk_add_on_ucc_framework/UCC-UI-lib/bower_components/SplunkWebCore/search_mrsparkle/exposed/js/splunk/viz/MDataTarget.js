define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Legend = require("splunk/charting/Legend");

    return Class(module.id, function(MDataTarget) {

        // Public Passes

        this.processDataPass = new Pass("processData", 0.1);
        this.updateLegendLabelsPass = new Pass("updateLegendLabels", 0.2);
        this.renderDataPass = new Pass("renderData", 0.3);

        // Public Properties

        this.data = new ObservableProperty("data", Array, null)
            .onChange(function(e) {
                this.invalidate("processDataPass");
            });

        this.fields = new ObservableArrayProperty("fields", String, null)
            .onChange(function(e) {
                this.invalidate("processDataPass");
            });

        this.legend = new ObservableProperty("legend", Legend, null)
            .onChange(function(e) {
                if (e.target === this) {
                    var oldLegend = e.oldValue;
                    var newLegend = e.newValue;

                    if (oldLegend) {
                        oldLegend.off("settingLabels", this._legend_settingLabels, this);
                        oldLegend.unregister(this);
                    }

                    if (newLegend) {
                        newLegend.register(this);
                        newLegend.on("settingLabels", this._legend_settingLabels, this);
                    }

                    this.invalidate("updateLegendLabelsPass");
                    return;
                }

                if (e.event === e.target.labelIndexMapChanged) {
                    this.invalidate("renderDataPass");
                    return;
                }
            });

        // Private Properties

        this._cachedData = null;
        this._cachedFields = null;
        this._cachedLegend = null;

        // Public Methods

        this.processData = function() {
            if (this.isValid("processDataPass")) {
                return;
            }

            this.invalidate("updateLegendLabelsPass");

            var data = this._cachedData = this.getInternal("data") || [];
            var fields = this._cachedFields = this.getInternal("fields") || [];

            this.processDataOverride(data, fields);

            this.markValid("processDataPass");
        };

        this.updateLegendLabels = function() {
            if (this.isValid("updateLegendLabelsPass")) {
                return;
            }

            this.invalidate("renderDataPass");

            var legend = this._cachedLegend = this.getInternal("legend");
            var labels = null;

            if (legend) {
                labels = this.updateLegendLabelsOverride(this._cachedData, this._cachedFields);
            }

            this.markValid("updateLegendLabelsPass");

            // this must run last to avoid recursion
            if (legend) {
                legend.setLabels(this, labels);
            }
        };

        this.renderData = function() {
            if (this.isValid("renderDataPass")) {
                return;
            }

            this.renderDataOverride(this._cachedData, this._cachedFields, this._cachedLegend);

            this.markValid("renderDataPass");
        };

        // Protected Methods

        this.processDataOverride = function(data, fields) {
        };

        this.updateLegendLabelsOverride = function(data, fields) {
            return null;
        };

        this.renderDataOverride = function(data, fields, legend) {
        };

        // Private Methods

        this._legend_settingLabels = function(e) {
            this.validate("updateLegendLabelsPass");
            this.updateLegendLabels();
        };

    });

});
