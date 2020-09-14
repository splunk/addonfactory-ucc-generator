define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");

    return Class(module.id, Scale, function(CategoryScale, base){

        // Public Properties

        this.categories = new ObservableArrayProperty("categories", String, [])
            .onChange(function(e){
                this.invalidate("computeValueMapPass");
            });

        this.comparator = new ObservableProperty("comparator", Function, null)
            .onChange(function(e){
                this.invalidate("computeValueMapPass");
            });

        this.actualCategories = new ObservableArrayProperty("actualCategories", String, [])
            .readOnly(true);

        this.isDiscreteScale = true;

        // Private Properties

        this._cachedCategories = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._cachedCategories = [];
        };

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var categories = this.getInternal("categories");
            var comparator = this.getInternal("comparator");
            var oldCategories = this._cachedCategories;
            var newCategories = [];
            var uniqueMap = {};
            var changed = false;
            var value;
            var i, l;

            // compute unique non-empty categories
            values = categories.concat(values);
            for (i = 0, l = values.length; i < l; i++) {
                value = values[i];
                if (value && !ObjectUtil.has(uniqueMap, value)) {
                    uniqueMap[value] = true;
                    newCategories.push(value);
                }
            }

            // sort categories
            if (comparator) {
                newCategories.sort(comparator);
            }

            // check if categories changed
            if (newCategories.length !== oldCategories.length) {
                changed = true;
            } else {
                for (i = 0, l = newCategories.length; i < l; i++) {
                    if (newCategories[i] !== oldCategories[i]) {
                        changed = true;
                        break;
                    }
                }
            }

            if (!changed) {
                return false;
            }

            this._cachedCategories = newCategories;
            this.setInternal("actualCategories", newCategories);

            return true;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            return [0, Math.max(this._cachedCategories.length - 1, 0)];
        };

        this.parseValueOverride = function(value) {
            return DataUtil.parseString(value);
        };

        this.valueToLinearOverride = function(value) {
            var index = ArrayUtil.indexOf(this._cachedCategories, value);
            if (index >= 0) {
                return index;
            } else {
                return NaN;
            }
        };

        this.linearToValueOverride = function(linear) {
            linear = Math.floor(linear);
            if ((linear >= 0) && (linear < this._cachedCategories.length)) {
                return this._cachedCategories[linear];
            } else {
                return null;
            }
        };

    });

});
