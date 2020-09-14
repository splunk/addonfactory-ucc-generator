define(function(require, exports, module) {

    var Class = require("jg/Class");
    var LocalTimeZone = require("splunk/time/LocalTimeZone");
    var SimpleTimeZone = require("splunk/time/SimpleTimeZone");

    return Class(module.id, function(TimeZones) {

        // Public Static Constants

        TimeZones.LOCAL = new LocalTimeZone();
        TimeZones.UTC = new SimpleTimeZone(0);

    });

});
