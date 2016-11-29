var path = require('path');

var buildToolsDir = path.join(__dirname, 'bower_components', 'SplunkWebCore', 'build_tools');
var mergeConfigs = require(buildToolsDir + '/util/mergeConfigs');
var cssConfig = require(buildToolsDir + '/profiles/common/css.config');

module.exports = mergeConfigs(cssConfig('enterprise'), {
    output: {
        path: path.join(__dirname, 'build', 'appserver', 'static', 'css')
    },
    entry: {
        bootstrap: path.join(__dirname, 'build', 'appserver', 'static', 'styles', 'bootstrap.pcss')
    }
});
