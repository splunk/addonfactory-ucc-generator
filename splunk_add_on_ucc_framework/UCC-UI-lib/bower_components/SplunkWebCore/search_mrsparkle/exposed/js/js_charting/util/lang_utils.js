define(function() {

    // very simple inheritance helper to set up the prototype chain
    var inherit = function(child, parent) {
        var F = function() { };
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
    };

    return ({

        inherit: inherit

    });

});