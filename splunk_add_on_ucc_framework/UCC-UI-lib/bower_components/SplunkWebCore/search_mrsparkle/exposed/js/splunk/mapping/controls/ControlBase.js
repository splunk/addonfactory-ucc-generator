define(function(require, exports, module) {

    var Class = require("jg/Class");
    var MPassTarget = require("jg/async/MPassTarget");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var MRenderTarget = require("splunk/viz/MRenderTarget");
    var ObservableProperty = require('jg/properties/ObservableProperty');

    return Class(module.id, Object, function(ControlBase, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget, MRenderTarget);

        // Public properties

        this.isVisible = new ObservableProperty('isVisible', Boolean, true)
            .onChange(function(e) {
                this.invalidate('renderPass');
            });

        // Constructor

        this.constructor = function() {
            this.leafletControl = this.createLeafletControl();
            if (!this.leafletControl) {
                throw new Error("Value returned from createLeafletControl() must be non-null.");
            }
        };

        // Public Methods

        this.render = function() {
        };

        // Protected Methods

        this.createLeafletControl = function() {
            throw new Error("Must implement method createLeafletControl.");
        };

        this.onAddedToMap = function(map) {
            this.map = map;
        };

        this.onRemovedFromMap = function(map) {
            this.map = null;
        };

    });

});
