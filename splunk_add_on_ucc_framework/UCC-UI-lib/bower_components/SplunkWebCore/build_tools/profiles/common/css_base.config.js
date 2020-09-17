var path = require('path');
var mergeConfigs = require('../../util/mergeConfigs');
var cssConfig = require('./css.config');

module.exports = function(theme) {
    return mergeConfigs(cssConfig(theme,  '[name]-' + theme + '.css'), {
        output: {
            path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'css')
        },
        entry: {
            bootstrap: [path.resolve(__dirname, '../../../search_mrsparkle/exposed', 'pcss', 'base', 'bootstrap.pcss')]
        }
    });
};
