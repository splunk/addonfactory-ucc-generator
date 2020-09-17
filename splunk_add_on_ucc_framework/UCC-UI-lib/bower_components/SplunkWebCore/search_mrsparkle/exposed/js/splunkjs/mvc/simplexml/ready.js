define(function(require, exports, module) {
    var $ = require("jquery"),
        Dashboard = require('./controller');

    var readyDfd = $.Deferred();
    Dashboard.onReady(function(){ readyDfd.resolve(Dashboard); });

    return {
        load: function(name, req, onLoad, config) {
            readyDfd.done(onLoad);
        }
    };

});