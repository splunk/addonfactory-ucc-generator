var path = require('path');
var webpack = require('webpack');
var mergeConfigs = require('../util/mergeConfigs');
var cssConfig = require('./common/css.config');

module.exports = mergeConfigs(cssConfig('enterprise', '[name].css'), {
    output: {
        path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'css', 'skins', 'default')
    },
    entry: {
        default: [path.resolve(__dirname, '../../search_mrsparkle/exposed/pcss/version-5-and-earlier/skins/default/default.pcss')]
    }
});
