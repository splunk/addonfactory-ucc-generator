define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var Event = require("jg/events/Event");
    var EventData = require("jg/events/EventData");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var Map = require("jg/utils/Map");

    return Class(module.id, Object, function(Legend, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget);

        // Public Events

        this.settingLabels = new Event("settingLabels", EventData);
        this.labelIndexMapChanged = new ChainedEvent("labelIndexMapChanged", this.change);

        // Public Properties

        this.labels = new ObservableProperty("labels", Array, [])
            .readFilter(function(value) {
                return value.concat();
            })
            .writeFilter(function(value) {
                return value ? value.concat() : [];
            })
            .onChange(function(e) {
                this._updateLabelMap();
            });

        this.actualLabels = new ObservableProperty("actualLabels", Array, [])
            .readOnly(true)
            .readFilter(function(value) {
                return value.concat();
            });

        // Private Properties

        this._targetMap = null;
        this._targetList = null;
        this._labelMap = null;
        this._labelList = null;
        this._isSettingLabels = false;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._targetMap = new Map();
            this._targetList = [];
            this._labelMap = {};
            this._labelList = [];
        };

        // Public Methods

        this.register = function(target) {
            if (target == null) {
                throw new Error("Parameter target must be non-null.");
            }

            var targetData = this._targetMap.get(target);
            if (targetData) {
                return;
            }

            targetData = { labels: null };
            this._targetMap.set(target, targetData);
            this._targetList.push(targetData);
        };

        this.unregister = function(target) {
            if (target == null) {
                throw new Error("Parameter target must be non-null.");
            }

            var targetData = this._targetMap.get(target);
            if (!targetData) {
                return;
            }

            var targetIndex = ArrayUtil.indexOf(this._targetList, targetData);
            if (targetIndex >= 0) {
                this._targetList.splice(targetIndex, 1);
            }
            this._targetMap.del(target);

            this._updateLabelMap();
        };

        this.setLabels = function(target, labels) {
            if (target == null) {
                throw new Error("Parameter target must be non-null.");
            }
            if ((labels != null) && !Class.isArray(labels)) {
                throw new Error("Parameter labels must be of type Array.");
            }

            var targetData = this._targetMap.get(target);
            if (!targetData) {
                return;
            }

            targetData.labels = labels ? labels.concat() : null;

            this.notifySettingLabels();
        };

        this.getLabelIndex = function(label) {
            if (label == null) {
                throw new Error("Parameter label must be non-null.");
            }
            if (!Class.isString(label)) {
                throw new Error("Parameter label must be of type String.");
            }

            var index = this.getLabelIndexOverride(label);
            if (index < 0) {
                var labelIndex = this._labelMap[label];
                index = (labelIndex != null) ? labelIndex : -1;
            }
            return index;
        };

        this.getNumLabels = function() {
            var value = this.getNumLabelsOverride();
            if (value < 0) {
                value = this._labelList.length;
            }
            return value;
        };

        this.notifySettingLabels = function() {
            if (this._isSettingLabels) {
                return;
            }

            try {
                this._isSettingLabels = true;
                this.fire(this.settingLabels, new EventData());
                this._updateLabelMap();
            } finally {
                this._isSettingLabels = false;
            }
        };

        this.notifyLabelIndexMapChanged = function() {
            this.fire(this.labelIndexMapChanged, new EventData());
        };

        // Protected Methods

        this.getNumLabelsOverride = function() {
            return -1;
        };

        this.getLabelIndexOverride = function(label) {
            return -1;
        };

        this.updateLabelsOverride = function(labels) {
            return false;
        };

        // Private Methods

        this._updateLabelMap = function() {
            var currentLabelList = this._labelList;
            var changed = false;

            var labelMap = {};
            var labelList = [];

            var targetList = this._targetList;
            var targetData;
            var targetLabels;
            var targetLabel;

            var i;
            var j;
            var l;
            var m;

            targetLabels = this.getInternal("labels");
            for (i = 0, l = targetLabels.length; i < l; i++) {
                targetLabel = String(targetLabels[i]);
                if (labelMap[targetLabel] == null) {
                    labelMap[targetLabel] = labelList.length;
                    labelList.push(targetLabel);
                }
            }

            for (i = 0, l = targetList.length; i < l; i++) {
                targetData = targetList[i];
                targetLabels = targetData.labels;
                if (targetLabels) {
                    for (j = 0, m = targetLabels.length; j < m; j++) {
                        targetLabel = String(targetLabels[j]);
                        if (labelMap[targetLabel] == null) {
                            labelMap[targetLabel] = labelList.length;
                            labelList.push(targetLabel);
                        }
                    }
                }
            }

            if (labelList.length != currentLabelList.length) {
                changed = true;
            } else {
                for (i = 0, l = labelList.length; i < l; i++) {
                    if (labelList[i] !== currentLabelList[i]) {
                        changed = true;
                        break;
                    }
                }
            }

            if (changed) {
                this._labelMap = labelMap;
                this._labelList = labelList;

                this.setInternal("actualLabels", labelList.concat());

                if (!this.updateLabelsOverride(labelList.concat())) {
                    this.notifyLabelIndexMapChanged();
                }
            }
        };

    });

});
