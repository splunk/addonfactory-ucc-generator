//This module is instantiated and controlled by webpack-plugin.
//
//Responsibilities:
//  Webpack configuration building (entry points and aliases are passed in)
//  Webpack compiler management
//  Providing access to the memory file system (to retrieve built bundles)
//  Dumping generated bundles to a debug directory


var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var MemoryFS = require('memory-fs');
var net = require('net');
var path = require('path');
var webpack = require('webpack');
var wrench = require('wrench');

var MockModulePlugin = require('./MockModulePlugin');
var SplunkNameModuleIdsPlugin = require('../../build_tools/plugins/SplunkNameModuleIdsPlugin');
var WebpackProgressPlugin = require('webpack/lib/ProgressPlugin');

var sharedConfig = require('../../build_tools/profiles/common/shared.config');
var postcssConfig = require('../../build_tools/profiles/common/postcss.config');
var mergeConfigs = require('../../build_tools/util/mergeConfigs');
var registerHooksBuilder = require('./register-hooks-builder');
var virtualModuleLoader = require('../../build_tools/web_loaders/virtual-module-loader');

var onCompilation, compiling, startTimestamp, testSetHash, firstCompilation = true;
var debugDir = path.join(process.env.SPLUNK_SOURCE, 'web', 'test', 'webpack_debug');
var memFS = new MemoryFS();
var history = new CompilationHistory();
var log = require('./child-log');


//Accepts basic configuration (entry points, aliases, application paths) and assembles a final
//webpack compiler configuration, including loaders and plugins.
function buildConfig(config, flags, testRegexp) {
    startTimestamp = process.hrtime()[0];
    testSetHash = crypto.createHash('sha256').update(JSON.stringify(_.keys(config.entryPoints))).digest('hex');

    var preLoaders = [];
    var unitTestingOptions = {};
    var appSourcePaths = _.map(config.appPaths, function (appPath) {
        return path.join(appPath, 'static');
    });

    //disable cache for every babel loader (clean slate for testing)
    _.each(sharedConfig.module.loaders, function (loader) {
        if (loader.loader == 'babel-loader') {
            loader.query.cacheDirectory = false;
        }
    });

    //enable coverage loader/plugin if patterns are provided
    if (_.has(config, 'coveragePatterns')) {
        unitTestingOptions.coverageSourcePaths = appSourcePaths.concat(
            path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js'));
        unitTestingOptions.coveragePatterns = config.coveragePatterns;

        //es5 (only for .js) - webpack loader
        preLoaders.push({
            test: /\.js$/,
            include: appSourcePaths.concat(path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js')),
            loader: require.resolve('./es5-coverage-instrumenter-loader')
        });

        //es6 (shared config enables this for .es and .jsx) - babel plugin
        _.each(sharedConfig.module.loaders, function (loader) {
            if (loader.loader == 'babel-loader') {
                loader.query.plugins.push([
                    require.resolve('./es6-coverage-instrumenter-plugin'), {
                        coveragePatterns: config.coveragePatterns,
                        coverageSourcePaths: unitTestingOptions.coverageSourcePaths
                    }
                ]);
            }
        });
    }

    //optimization: enable postcss, but only for pcssm files (not pcss)
    var pcssConfig = postcssConfig({loadTheme: 'enterprise'});
    virtualModuleLoader.setVirtualModule('testing', 'pcssEmpty', 'define(function() { return {}; });');
    _.each(pcssConfig.module.loaders, function (loader) {
        if (loader.test.test('.pcss')) {
            loader.loader = 'virtual-module?ns=testing&id=pcssEmpty';
        }
    });

    //define a virtual module for disabling ajax caching (enabled as loader below)
    virtualModuleLoader.setVirtualModule('testing', 'ajaxNoCache', 'define(function() { });');

    //build a test hook loading module for bootstrap-helpers
    registerHooksBuilder(config.appPaths);

    //build SplunkNameModuleIdsPlugin instances for all applications
    var moduleIdPlugins = _(config.appPaths)
        .map(function (appPath, app) {
            return [
                new SplunkNameModuleIdsPlugin({context: path.join(appPath, 'static'), prefix: 'app/' + app + '/'}),
                new SplunkNameModuleIdsPlugin({context: path.join(appPath, '..', 'src'), prefix: app + ':/'})
            ];
        })
        .flatten().value();

    var mmPlugin = new MockModulePlugin(_.keys(config.appPaths));

    return mergeConfigs(pcssConfig, sharedConfig, virtualModuleLoader.config, {
        output: {
            path: '/', filename: '[name]-bundle.js',
            publicPath: '/webpack/'
        },

        entry: config.entryPoints,

        resolve: {
            alias: config.aliases
        },

        //'eval' is good enough for debugging, eval-source-map is better but takes more time to generate
        devtool: flags.noSourceMaps ? null : 'eval',

        plugins: moduleIdPlugins.concat([

            mmPlugin,

            new webpack.optimize.CommonsChunkPlugin({
                name: 'test-common',

                minChunks: function (module, count) {

                    //pull the bootstrap module and dependencies into the commons chunk - otherwise we'd
                    // have to load the bootstrap module manually
                    if (_.get(module, 'chunks[0].name') == 'test-bootstrap') {
                        log.debug('Pulling bootstrap module into commons chunk:', module.resource);
                        return true;
                    }

                    //never pull mocked modules into the commons chunk - see MockModulePlugin
                    // don't need to check for mocks, because they're all unique, virtual
                    // modules with a count of 1
                    var isMocked = _.some(mmPlugin.mocks, function (fileMocks) {
                        return _.has(fileMocks, module.resource);
                    });

                    if (isMocked) {
                        return false;
                    } else {
                        return count >= 2;
                    }
                }
            }),

            new WebpackProgressPlugin(_.throttle(function (progress, msg) {
                if (progress !== 1) {
                    //use previous total module count if known (for the current set of test files)
                    if (firstCompilation && _.has(history.stats, testSetHash)) {
                        progress = (process.hrtime()[0] - startTimestamp) / history.stats[testSetHash];
                        log.info('Webpack progress: ' + Math.min(Math.round(progress * 100), 100) + '% ' + msg);
                    } else {
                        //use webpack's progress
                        log.info('Webpack progress: ' + Math.round(progress * 100) + '% ' + msg);
                    }
                }
            }, 5000, {leading: false, trailing: true}))
        ]),

        module: {
            loaders: [
                {
                    test: /util\/ajax_no_cache/,
                    loader: 'virtual-module?ns=testing&id=ajaxNoCache'
                }, {
                    test: testRegexp,
                    loader: require.resolve('./redefine-parser-loader')
                }
            ],

            preLoaders: preLoaders
        },

        unitTesting: unitTestingOptions
    });
}

//Accepts a webpack configuration and runs a (watching) webpack compilation. Calls any registered
// post-compilation handlers and notifies the controlling module after compilation is done.
function startCompilation(config, flags) {
    onCompilation = [];
    compiling = true;

    var compiler = webpack(config);
    compiler.outputFileSystem = memFS;

    log.info('Starting run for', _.keys(config.entry).length - 1, 'test files');

    var compilationDone = function (err, stats) {
        log.debug('Compilation done');
        compiling = false;
        firstCompilation = false;

        if (err) {
            throw err;
        }

        var statsLevel = stats.hasErrors() ? 'error' : (stats.hasWarnings() ? 'warn' : 'debug');
        log[statsLevel]('Compilation results:\n' + stats.toString({
                colors: true, assets: true, hash: false, timings: true, version: false, chunks: false,
                chunkModules: false, cached: false, reasons: false, source: false
            }));

        history.setForHash(testSetHash, process.hrtime()[0] - startTimestamp);

        //edge case in watch mode: a change to a test that causes a webpack build fail, if that test was
        // previously built successfully, causes the lingering (stale) built bundle to get served. if
        // there are any entry points with no matching equivalent in the final chunk list, and there's a
        // matching file in the memory fs, it's deleted to prevent this.
        // note that this introduces a second bug: if the offending change is reverted 1:1, webpack caching
        // results in the bundle not being output (probably because webpack thinks it's already there)
        var builtChunks = _.keys(stats.toJson('verbose', true).assetsByChunkName);
        _(config.entry).keys().difference(builtChunks).each(function (missing) {
            var path = '/' + missing + '-bundle.js';
            if (memFS.existsSync(path)) {
                log.info('Deleting stale bundle', missing);
                memFS.unlinkSync(path);
            }
        });

        if (flags.dumpFiles) {
            //dump generated files to web/test/debug, clean it first
            log.info('Dumping generated files to', debugDir);
            wrench.rmdirSyncRecursive(debugDir, true);
            wrench.mkdirSyncRecursive(debugDir);
            walkGenerated('/');
        }

        log.debug('Calling post compilation handlers');
        _.each(onCompilation, function (handler) {
            handler.call(this);
        });
        onCompilation = [];

        //tell controlling module to start tests
        process.send({done: true});

        //TODO: optimization: can we clean up webpack for single runs, to reduce memory usage?
    };

    if (flags.singleRun) {
        compiler.run(compilationDone);
    } else {
        compiler.watch({aggregateTimeout: 1000}, compilationDone);
    }
}

//Handles incoming file requests from the controlling module. If a compilation is currently
// in progress, a post-compilation handler is registered, otherwise the request is answered
// immediately.
function processRequestUrl(request) {

    if (compiling) {
        log.debug('Currently compiling, delaying', request.filePath);

        onCompilation.push(function () {
            log.debug('Post compilation, now serving', request.filePath);

            if (memFS.existsSync(request.filePath)) {
                sendBackFile(memFS.readFileSync(request.filePath), request.port);
            } else {
                log.warn('Even after compilation, file not found in memfs', request.filePath);
                sendBackFile(null, request.port);
            }
        });
    } else {
        if (memFS.existsSync(request.filePath)) {
            sendBackFile(memFS.readFileSync(request.filePath), request.port);
        } else {
            log.warn('File not found in memfs', request.filePath);
            sendBackFile(null, request.port);
        }
    }
}

//Sends back file contents to the local port specified in the original request.
function sendBackFile(buffer, port) {
    net.createConnection(port, function () {
        if (_.isNull(buffer)) {
            this.end();
        } else {
            var that = this;
            this.write(buffer, function () {
                that.end();
            });
        }
    });
}

function walkGenerated(dir) {
    var entries = memFS.readdirSync(dir).sort();
    _.each(entries, function (entry) {
        var newPath = dir + '/' + entry;

        if (memFS.statSync(newPath).isDirectory()) {
            fs.mkdirSync(path.join(debugDir, newPath));
            walkGenerated(newPath);
        } else {
            fs.writeFileSync(path.join(debugDir, newPath), memFS.readFileSync(newPath));
        }
    });
}

function CompilationHistory() {
    var historyFile = path.join(process.env.SPLUNK_SOURCE, 'web', 'test', 'webpack_history.json');
    this.stats = {};

    try {
        this.stats = JSON.parse(fs.readFileSync(historyFile));
    }
    catch (e) {
    }

    this.setForHash = function (hash, seconds) {
        log.debug('Adding hash and seconds for this set of test files:', hash, seconds);
        this.stats[hash] = seconds;
        fs.writeFileSync(historyFile, JSON.stringify(this.stats));
    };
}

process.on('message', function (msg) {
    if (_.has(msg, 'compile')) {
        var flags = {
            singleRun: msg.compile.singleRun,
            dumpFiles: msg.compile.dumpFiles,
            noSourceMaps: msg.compile.noSourceMaps
        };
        startCompilation(buildConfig(msg.compile.configuration, flags, new RegExp(msg.compile.testRegexp, 'i')), flags);
    } else if (_.has(msg, 'processRequest')) {
        processRequestUrl(msg.processRequest);
    }
});
