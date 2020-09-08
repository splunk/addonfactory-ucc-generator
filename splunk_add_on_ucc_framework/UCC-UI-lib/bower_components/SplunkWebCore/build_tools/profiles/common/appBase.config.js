var path = require('path');
var _ = require('lodash');
var mergeConfigs = require('../../util/mergeConfigs');
var sharedConfig = require('./shared.config');
var postcssConfig = require('./postcss.config');

var postcssOptions = {
    loadTheme: 'enterprise'
};

module.exports = function(appDir, options) {
    postcssOptions = _.merge({}, postcssOptions, options);
    return mergeConfigs(sharedConfig, postcssConfig(postcssOptions), {
        resolve: {
            root: [
                path.join(appDir, 'src'),
                path.join(appDir, 'bower_components')
            ]
        }
    });
}
