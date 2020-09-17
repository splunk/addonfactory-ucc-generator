define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, Object, function(Duration, base) {

        // Private Static Constants

        var _ISO_DURATION_PATTERN = /P(?:(\-?\d+(?:\.\d+)?)Y)?(?:(\-?\d+(?:\.\d+)?)M)?(?:(\-?\d+(?:\.\d+)?)D)?(?:T(?:(\-?\d+(?:\.\d+)?)H)?(?:(\-?\d+(?:\.\d+)?)M)?(?:(\-?\d+(?:\.\d+)?)S)?)?/;

        // Public Properties

        this.years = 0;
        this.months = 0;
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;

        // Constructor

        this.constructor = function(yearsOrTimestring, months, days, hours, minutes, seconds) {
            if ((arguments.length == 1) && (typeof yearsOrTimestring === "string")) {
                var matches = _ISO_DURATION_PATTERN.exec(yearsOrTimestring);
                var numMatches = matches ? matches.length : 0;
                var match;

                match = (numMatches > 1) ? matches[1] : null;
                this.years = match ? Number(match) : 0;

                match = (numMatches > 2) ? matches[2] : null;
                this.months = match ? Number(match) : 0;

                match = (numMatches > 3) ? matches[3] : null;
                this.days = match ? Number(match) : 0;

                match = (numMatches > 4) ? matches[4] : null;
                this.hours = match ? Number(match) : 0;

                match = (numMatches > 5) ? matches[5] : null;
                this.minutes = match ? Number(match) : 0;

                match = (numMatches > 6) ? matches[6] : null;
                this.seconds = match ? Number(match) : 0;
            } else {
                this.years = (typeof yearsOrTimestring === "number") ? yearsOrTimestring : 0;
                this.months = (months !== undefined) ? months : 0;
                this.days = (days !== undefined) ? days : 0;
                this.hours = (hours !== undefined) ? hours : 0;
                this.minutes = (minutes !== undefined) ? minutes : 0;
                this.seconds = (seconds !== undefined) ? seconds : 0;
            }
        };

        // Public Methods

        this.clone = function() {
            return new Duration(this.years, this.months, this.days, this.hours, this.minutes, this.seconds);
        };

        this.equals = function(toCompare) {
            return ((this.years == toCompare.years) &&
                    (this.months == toCompare.months) &&
                    (this.days == toCompare.days) &&
                    (this.hours == toCompare.hours) &&
                    (this.minutes == toCompare.minutes) &&
                    (this.seconds == toCompare.seconds));
        };

        this.toString = function() {
            var str = "";
            str += "P" + this.years + "Y" + this.months + "M" + this.days + "D";
            str += "T" + this.hours + "H" + this.minutes + "M" + this.seconds + "S";
            return str;
        };

    });

});
