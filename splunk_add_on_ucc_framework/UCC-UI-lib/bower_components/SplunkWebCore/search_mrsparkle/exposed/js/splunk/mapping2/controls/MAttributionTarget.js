define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");

    return Class(module.id, function(MAttributionTarget) {

        // Public Properties

        this.attribution = new ObservableProperty("attribution", String, null);

    });

});
