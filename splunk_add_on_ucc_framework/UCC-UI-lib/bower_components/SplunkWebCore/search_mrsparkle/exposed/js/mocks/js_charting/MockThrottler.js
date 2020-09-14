define(function() {

    var MockThrottler = function(properties) {
        properties = properties || {};
        this.onMouseOver = properties.onMouseOver || function() { };
        this.onMouseOut = properties.onMouseOut || function() { };
    };

    MockThrottler.prototype = {

        mouseOverHappened: function() {
            this.onMouseOver.apply(null, arguments);
        },

        mouseOutHappened: function() {
            this.onMouseOut.apply(null, arguments);
        }

    };

    return MockThrottler;

});