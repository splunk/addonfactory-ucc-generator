var path = require('path');
var _ = require('lodash');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var DEFAULT_OPTIONS = {
    variables: {},
    path: [],
    extractText: false,
    extractTextFilename: "[name].css",
    splunkVersion: 'dev',
    profileName: ''
};

/**
 * A function that returns a webpack configuration object to use post css. The
 * config only contains parameters necessary to make postcss work, and is
 * intended to be merged with a base configuration object.
 *
 * @param {Object} [options]
 * @param {Object} [options.variables] - A map of variable names and values that
 * will be passed to the postcss-simple-vars plugin.
 * @param {String|String[]} [options.path = 'search_mrsparkle/exposed'] - Passed
 * to postcss-import plugin to resolve import statements.
 * @param {Boolean} [options.modules = true] - Use css modules.
 * @param {Boolean} [options.extractText = false] - Use the ExtractTextPlugin to
 * output a css file.
 * @param {String} [options.extractTextFilename = '[name].css'] - A name file
 * name to use with the extract text plugin.
 * @param {String} [options.loadTheme] - If supplied, use the
 * splunk-postcss-theme-import with the provided value. Must be 'enterprise' or
 * 'lite'.
 * @returns {Object} webpack configuration object
 */
module.exports = function(options) {
    options = _.merge({}, DEFAULT_OPTIONS, options);

    var styleLoader = 'style-loader!';
    var cssLoader = 'css-loader?sourceMap!';
    var cssLoaderModules = 'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[local]---' + options.profileName + '---' + options.splunkVersion.replace('.', '-') + '---[hash:base64:5]!';
    var postcssLoader = 'postcss-loader';
    var plugins = [];
    var loaders = [];

    if (options.extractText) {
        plugins.push(
            new ExtractTextPlugin(options.extractTextFilename, {
                allChunks: true
            })
        );
        loaders.push({
            test: /\.pcss$/,
            loader: ExtractTextPlugin.extract(cssLoader + postcssLoader)
        });
        loaders.push({
            test: /\.pcssm$/,
            loader: ExtractTextPlugin.extract(cssLoaderModules + postcssLoader)
        });
    } else {
        loaders.push({
            test: /\.pcss$/,
            loader: styleLoader + cssLoader + postcssLoader
        });
        loaders.push({
            test: /\.pcssm$/,
            loader: styleLoader + cssLoaderModules + postcssLoader
        });
    }

    var config = {
        plugins: plugins,
        module: {
            loaders: loaders
        },
        postcss: function (webpack) {
            var postCssPlugins = [];
            if (options.loadTheme) {
                var themeImport = require('../../postcss_plugins/splunk-postcss-theme-import');
                postCssPlugins.push(themeImport({
                    theme: options.loadTheme
                }));
            }

            return postCssPlugins.concat([
                require('postcss-import')({
                    path: options.path,
                    addDependencyTo: webpack
                }),
                require('postcss-mixins'),
            //    require('../../postcss_plugins/splunk-postcss-mixin-class'),
                require('postcss-for'),
                require('postcss-simple-vars')({
                    variables: options.variables
                }),
                require('postcss-conditionals'),
                require('postcss-calc'),
                require('postcss-color-function'),
                require('postcss-initial'),
                require('autoprefixer')({ browsers: ['last 2 versions'] }),
                require('postcss-nested')
            ]);
        }
    };
    return config;
};
