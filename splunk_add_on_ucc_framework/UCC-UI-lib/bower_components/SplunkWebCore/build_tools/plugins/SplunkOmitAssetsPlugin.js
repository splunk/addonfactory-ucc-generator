var _ = require('lodash');

/**
 * A webpack plugin to omit assets that match the supplied regular expression
 * from the build output.
 *
 * @param {RegExp} matchRegEx - Files matching this will be omitted
 */
function SplunkOmitAssetsPlugin(matchRegEx) {
    if (!_.isRegExp(matchRegEx)) {
        throw new Error('SplunkOmitAssetsPlugin must be passed a regular expression');
    }
    this.matchRegEx = matchRegEx;
}

SplunkOmitAssetsPlugin.prototype.apply = function(compiler) {
    var matchRegEx = this.matchRegEx;

    compiler.plugin('emit', function(compilation, callback) {
        compilation.assets = _.omitBy(compilation.assets, function(asset, assetName) {
            return matchRegEx.test(assetName);
        });
        callback();
    });
};

module.exports = SplunkOmitAssetsPlugin;
