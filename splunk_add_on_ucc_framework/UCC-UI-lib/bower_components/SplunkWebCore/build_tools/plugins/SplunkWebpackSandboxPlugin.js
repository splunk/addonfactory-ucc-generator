var path = require('path');
var md5 = require('md5');
var _ = require('lodash');
var ExternalModule = require('webpack/lib/ExternalModule');

/**
 * This is a plugin to facilitate building dashboard extensions with out breaking
 * Splunk. It does a few things:
 *     * Provides a unique name for the webpack jsonp function so it does not
 * collide if another webpack jsonp function is also on the page.
 *     * Adds the splunk-public-path-injection-loader to all entries, using the
 * publicPath provided in the options.
 *     * For non-initial chunks, ensures that the external dependencies are moved
 * to the parent module and correctly included in the amd dependency array.
 *
 * @param {Object} options
 * @param {String} options.publicPath - The path to the apps built javascript assets
 */
function SplunkWebpackSandboxPlugin(options) {
    if (!options || !options.publicPath) {
        throw new Error('publicPath is a required option');
    }
    this.publicPath = options.publicPath.replace(/^\//, '').replace(/\/$/, '') + '/';
}

SplunkWebpackSandboxPlugin.prototype.apply = function(compiler) {
    this.addCompilerOptions(compiler);
    
    var processChunkModules = this.processChunkModules.bind(this);
    compiler.plugin('compilation', function(compilation) {
        compilation.plugin('after-optimize-chunks', function(chunks) {
            chunks.forEach(processChunkModules);
        });
    });
};

SplunkWebpackSandboxPlugin.prototype.addCompilerOptions = function(compiler) {
    var options = compiler.options;
    // Provide a unique name for the webpack jsonp function to prevent any
    // module namespace collisions.
    options.output.jsonpFunction = 'webpackJsonp_' + md5(this.publicPath);

    // Pre-process all non-empty entries to ensure that the public path definition script is injected.
    var entryLoaderPrefix = 'splunk-public-path-injection-loader?/static/' + this.publicPath + '!';
    var processSingleEntry = function(entry) {
        if (Array.isArray(entry)) {
            if (entry.length > 0) {
                entry[0] = entryLoaderPrefix + entry[0];
            }
            return entry;
        }
        return entryLoaderPrefix + entry;
    };
    if (typeof options.entry === 'object') {
        options.entry = _.mapValues(options.entry, processSingleEntry);
    } else {
        options.entry = processSingleEntry(options.entry);
    }
};

SplunkWebpackSandboxPlugin.prototype.processChunkModules = function(chunk) {
    var publicPath = this.publicPath;
    if (chunk.initial && Array.isArray(chunk.parents)) {
        // TODO: make sure each parent chunk has been declared as an entry,
        // throw a mis-configuration error if not. 
        
        // Generate a relative path from the chunk to the root directory of the chunk context by replacing
        // each segment of the chunk path with a "../", ignoring the last segment because it's the file name.
        var relativePathToRoot = chunk.name.split('/').slice(0, -1).map(function(segment) {
            return '../';
        }).join('');
        
        chunk.parents.forEach(function(parent) {
            // A relative path from the current chunk to the parent can be created by combining
            // the path to the root directory with the path to the parent chunk.
            chunk.addModule(new ExternalModule(relativePathToRoot + parent.name, 'amd'));
        });
    }
    if (!chunk.initial && Array.isArray(chunk.parents)) {
        // For a non-initial chunk, if there are dependencies on external modules, those
        // modules should be moved to each parent instead so that they can be added to 
        // the AMD dependency declaration.
        //
        // TODO: in the case of non-initial chunks that are children of non-initial chunks,
        // should make sure to process chunks in bottom-up order.
        var ownExternalModules = (chunk.modules || []).filter(function(mod) {
            return !!mod.external;
        });
        ownExternalModules.forEach(function(mod) {
            chunk.parents.forEach(function(parent) {
                parent.addModule(mod);
            });
            chunk.removeModule(mod);
        });
    }
};

module.exports = SplunkWebpackSandboxPlugin;
