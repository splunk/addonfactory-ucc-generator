var path = require('path');
var webpack = require('webpack');
var mergeConfigs = require('../util/mergeConfigs');
var cssConfig = require('./common/css.config');
var fs = require('fs');

module.exports = function() {
    var pages_dir = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'pcss', 'version-5-and-earlier');
    var entries = fs.readdirSync(pages_dir)
        .reduce(function(accum, pageFile) {
            if (pageFile.slice(-5) === '.pcss') {
                var page = pageFile.slice(0, -5);
                accum[page] = pages_dir + '/' + pageFile;
            }
            return accum;
        }, {});

    return mergeConfigs(cssConfig('enterprise', '[name].css'), {
        output: {
            path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'css')
        },
        entry: entries
    });
};
