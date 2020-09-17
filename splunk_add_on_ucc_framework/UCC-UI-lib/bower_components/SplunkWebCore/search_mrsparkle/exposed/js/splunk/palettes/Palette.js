define(function(require, exports, module) {

    var Class = require("jg/Class");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var Property = require("jg/properties/Property");
    var NumberUtil = require("jg/utils/NumberUtil");

    return Class(module.id, Object, function(Palette, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget);

        // Private Properties

        this._itemType = null;
        this._itemTypeChecker = null;
        this._itemNullValue = null;
        this._cachedProperties = null;
        this._hasChangeListener = false;

        // Constructor

        this.constructor = function(itemType) {
            if (itemType == null) {
                throw new Error("Parameter itemType must be non-null.");
            } else if (!Class.isFunction(itemType)) {
                throw new Error("Parameter itemType must be of type Function.");
            }

            this._itemType = itemType;
            this._itemTypeChecker = Class.getTypeChecker(itemType);

            if (itemType === Number) {
                this._itemNullValue = NaN;
            } else if (itemType === Boolean) {
                this._itemNullValue = false;
            } else {
                this._itemNullValue = null;
            }
        };

        // Public Accessor Methods

        this.itemType = function() {
            return this._itemType;
        };

        // Public Methods

        this.dispose = function() {
            this.listenOff();
            this.off();

            this._cachedProperties = null;
        };

        this.getItem = function(ratio, span, value) {
            if (ratio == null) {
                throw new Error("Parameter ratio must be non-null.");
            }

            ratio = +ratio;
            ratio = (ratio <= Infinity) ? NumberUtil.minMax(ratio, 0, 1) : 0;

            span = (span != null) ? +span : NaN;
            span = ((span >= 0) && (span < Infinity)) ? Math.floor(span) : NaN;

            if (!this._cachedProperties) {
                if (!this._hasChangeListener) {
                    this.on("change", this._selfChange, this, Infinity);
                    this._hasChangeListener = true;
                }
                this._cachedProperties = this._getProperties();
                this.extendProperties(this._cachedProperties);
            }

            var item = this.getItemOverride(this._cachedProperties, ratio, span, value);
            if (item == null) {
                item = this._itemNullValue;
            } else if (!this._itemTypeChecker(item)) {
                throw new Error("Value returned from getItemOverride must be of type " + (Class.getName(this._itemType) || "itemType") + ".");
            }

            return item;
        };

        // Protected Methods

        this.extendProperties = function(properties) {
        };

        this.getItemOverride = function(properties, ratio, span, value) {
            return null;
        };

        // Private Methods

        this._getProperties = function() {
            var properties = {};
            var property;
            for (var p in this) {
                property = this[p];
                if (property instanceof Property) {
                    properties[p] = this.getInternal(property);
                }
            }
            return properties;
        };

        this._selfChange = function(e) {
            this._cachedProperties = null;
        };

    });

});
