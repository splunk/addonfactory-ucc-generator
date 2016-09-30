var path = require('path');

exports.init = function(grunt) {

    exports.source = function() {
        var pathParts = [process.env.SOLN_ROOT].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };

    exports.ta_opsecleaSource = function() {
        var pathParts = [exports.source('TA-opseclea', 'mainline', 'package', 'appserver', 'static', 'js')].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };

    return exports;
};
