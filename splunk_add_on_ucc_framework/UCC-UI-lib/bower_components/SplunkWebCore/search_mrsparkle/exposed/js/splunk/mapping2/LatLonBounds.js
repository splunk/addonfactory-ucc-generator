define(function(require, exports, module) {

    var Class = require("jg/Class");
    var LatLon = require("splunk/mapping2/LatLon");

    return Class(module.id, Object, function(LatLonBounds, base) {

        // Public Properties

        this.s = 0;
        this.w = 0;
        this.n = 0;
        this.e = 0;

        // Constructor

        this.constructor = function(s, w, n, e) {
            this.s = (s != null) ? +s : 0;
            this.w = (w != null) ? +w : 0;
            this.n = (n != null) ? +n : 0;
            this.e = (e != null) ? +e : 0;
        };

        // Public Methods

        this.getSW = function() {
            return new LatLon(this.s, this.w);
        };

        this.getSE = function() {
            return new LatLon(this.s, this.e);
        };

        this.getNW = function() {
            return new LatLon(this.n, this.w);
        };

        this.getNE = function() {
            return new LatLon(this.n, this.e);
        };

        this.getCenter = function() {
            return new LatLon(((+this.s) + (+this.n)) / 2, ((+this.w) + (+this.e)) / 2);
        };

        this.expand = function(latLon) {
            var lat = +latLon.lat;
            var lon = +latLon.lon;
            var s = +this.s;
            var w = +this.w;
            var n = +this.n;
            var e = +this.e;

            if (lat < s) {
                this.s = lat;
            }
            if (lat > n) {
                this.n = lat;
            }
            if (lon < w) {
                this.w = lon;
            }
            if (lon > e) {
                this.e = lon;
            }
        };

        this.contains = function(latLon) {
            var lat = +latLon.lat;
            var lon = +latLon.lon;
            var s = +this.s;
            var w = +this.w;
            var n = +this.n;
            var e = +this.e;

            return ((lat >= s) &&
                    (lat <= n) &&
                    (lon >= w) &&
                    (lon <= e));
        };

        this.normalize = function(center) {
            var s = +this.s;
            if (s < -90) {
                s = -90;
            } else if (s > 90) {
                s = 90;
            }

            var n = +this.n;
            if (n < s) {
                n = s;
            } else if (n > 90) {
                n = 90;
            }

            var centerLon = center ? center.lon : 0;
            var w = (this.w - centerLon);
            var e = (this.e - centerLon);
            if ((e - w) >= 360) {
                w = -180;
                e = 180;
            } else {
                w %= 360;
                if (w < -180) {
                    w += 360;
                } else if (w > 180) {
                    w -= 360;
                }

                e %= 360;
                if (e < -180) {
                    e += 360;
                } else if (e > 180) {
                    e -= 360;
                }

                if (e < w) {
                    if (e > -w) {
                        w -= 360;
                    } else {
                        e += 360;
                    }
                }
            }
            w += centerLon;
            e += centerLon;

            return new LatLonBounds(s, w, n, e);
        };

        this.isFinite = function() {
            return (((this.s - this.s) === 0) &&
                    ((this.w - this.w) === 0) &&
                    ((this.n - this.n) === 0) &&
                    ((this.e - this.e) === 0));
        };

        this.equals = function(bounds) {
            return ((this.s == bounds.s) &&
                    (this.w == bounds.w) &&
                    (this.n == bounds.n) &&
                    (this.e == bounds.e));
        };

        this.clone = function() {
            return new LatLonBounds(this.s, this.w, this.n, this.e);
        };

        this.toString = function() {
            return "(" + (+this.s) + "," + (+this.w) + "," + (+this.n) + "," + (+this.e) + ")";
        };

    });

});
