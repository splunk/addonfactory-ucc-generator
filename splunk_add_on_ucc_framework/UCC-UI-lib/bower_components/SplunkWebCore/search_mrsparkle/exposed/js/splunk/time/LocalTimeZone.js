define(function(require, exports, module) {

    var Class = require("jg/Class");
    var TimeZone = require("splunk/time/TimeZone");

    return Class(module.id, TimeZone, function(LocalTimeZone, base) {

        // Public Methods

        this.getStandardOffset = function() {
            var date = new Date(0);
            return -date.getTimezoneOffset() * 60;
        };

        this.getOffset = function(time) {
            var date = new Date(time * 1000);
            return -date.getTimezoneOffset() * 60;
        };

    });

});
