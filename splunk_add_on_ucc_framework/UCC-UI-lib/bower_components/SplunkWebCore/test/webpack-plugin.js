//This module instantiates and controls compilation/webpack-compilation.
//
//Responsibilities:
//  Listening to the initial file list creation event
//  Building entry points and aliases for webpack
//  Forking a webpack-compilation instance and communicating with it
//  Providing a middleware for Karma
//    Acting on everything /webpack-prefixed
//    Forwarding requests to webpack-compilation, which reads it from the internal memory file system


var _ = require('lodash');
var childProcess = require('child_process');
var net = require('net');
var path = require('path');

var webpackChild;

function WebpackPlugin(config, executor, emitter, injector) {
    var log = require('karma/lib/logger').create('webpack-plugin');
    var compilationLog = require('karma/lib/logger').create('webpack');
    var testRegexp = new RegExp(config.client.splunk.testRegexp, 'i');
    var appPaths = config.client.splunk.apps;

    //safety (there is no way for us to override this, command line arguments always take preference
    if (config.autoWatch) {
        log.error('Enabling Karma\'s auto-watching mode is unsupported due to webpack integration.');
        process.exit(2);
    }

    //receive Karma's final file list, after all filters etc. are applied. Karma's watch mode is disabled
    //because webpack is watching instead, meaning this event will only ever reach us once.
    emitter.on('file_list_modified', function (files) {
        log.debug('Initiating webpack compilation after file list has changed');

        var webpackConfig = {
            //add test app source code aliases - do this before we deactivate apps with no tests
            aliases: _.transform(appPaths, function (aliases, appPath, app) {
                aliases['app/' + app] = path.join(appPath, 'static');
                aliases[app] = path.join(appPath, '..', 'src');
            }, {
                'util/qunit': 'util/qunit/migrated', //temporary
                'util/qunit_utils': 'util/migrated/qunit_utils' //temporary
            })
        };

        //create an entry point for every test file, include loaders
        webpackConfig.entryPoints = _(files.served)
            .map('path')
            .filter(function (file) { //select all test source files
                return testRegexp.test(file);
            })
            .map(function (file) { //determine test application and test name
                var re = testRegexp.exec(file);
                return {app: re[1], path: re[2]};
            })
            .tap(function (tests) { //deactivate apps with no tests/all tests filtered out
                appPaths = _.pick(appPaths, _(tests).map('app').uniq().value());
            })
            .tap(function (tests) { //determine coverage patterns (if coverage is enabled)
                try {
                    webpackConfig.coveragePatterns = injector.get('custom:coverage-patterns')(appPaths, tests);
                    injector.get('framework:coverage-report').config.appPaths = appPaths;
                }
                catch (e) {
                    //if coverage components aren't available: coverage is not enabled
                }
            })
            .map(function (test) {
                return [test.app + '/' + test.path, path.join(appPaths[test.app], 'test', test.path)];
            }).fromPairs().value();

        //add test-bootstrap entry point
        var bootstrapFile = path.join(process.env.SPLUNK_SOURCE, 'web', 'test', 'test-bootstrap.es');
        webpackConfig.entryPoints[path.basename(bootstrapFile, '.es')] = bootstrapFile;
        webpackConfig.appPaths = appPaths;

        //determine which (if any) type of source map to use
        var dumpFiles = _.includes(config.client.splunk.debugFlags, 'dump');
        var noSourceMaps = dumpFiles || _.some(config.browsers, function (browser) {
                return _.includes(browser, 'PhantomJS');
            });
        log.debug('Source maps are disabled:', noSourceMaps);

        //do all compiling in a child process to prevent Karma from timing out
        webpackChild = childProcess.fork(path.join(process.env.SPLUNK_SOURCE,
            'web', 'test', 'compilation', 'webpack-compilation'));

        webpackChild.on('message', function (msg) {
            //forward log messages from webpack-compilation
            if (_.has(msg, 'log')) {
                compilationLog[msg.log[0]].apply(compilationLog, msg.log.slice(1));
            }
            //start tests once compilation has finished
            else if (_.has(msg, 'done')) {
                //in single run mode, Karma will start the tests (and then exit)
                //in watch mode, we have to kick off the tests manually
                //also set autoWatch to true, which causes tests to also run on browser refresh/reconnect
                // cannot set this earlier because doing so would enable Karma's file watcher
                if (!config.singleRun) {
                    config.autoWatch = true;
                    executor.schedule();
                }
            }
        });

        //tell webpack-compilation to start compiling
        webpackChild.send({
            compile: {
                configuration: webpackConfig,
                testRegexp: config.client.splunk.testRegexp,
                singleRun: config.singleRun,
                dumpFiles: dumpFiles,
                noSourceMaps: noSourceMaps
            }
        });
    });
}

//Returns a middleware function that forwards every /webpack-prefixed request to webpack-compilation.
//File contents are returned by webpack-compilation using a local socket. We have to do that because
// using the IPC functionality node.js comes with (.send) is very slow for large strings, and
// the commons chunk can easily exceed ten megabytes.
function createWebpackMiddleware() {
    var log = require('karma/lib/logger').create('webpack-middleware');

    return function (request, response, next) {

        if (request.url.startsWith('/webpack')) {

            log.debug('webpack-prefixed request:', request.url);
            var url = request.url.substring('/webpack'.length);
            var filePath = decodeURI(url); //the decode is really just for the space in '/views/report/test_table_controls_results count.js'

            //remove any query params
            filePath = _.includes(filePath, '?') ? filePath.substring(0, filePath.lastIndexOf('?')) : filePath;

            var server = net.createServer(function (client) {
                var notEmpty = false;
                client.on('data', function (data) {
                    notEmpty = true;
                    response.write(data);
                });
                client.on('end', function () {
                    if (notEmpty) {
                        response.statusCode = 200;
                        response.end();
                    } else {
                        response.statusCode = 404;
                        response.end('not found');
                    }
                    server.close();
                });
            }).listen();

            webpackChild.send({processRequest: {filePath: filePath, port: server.address().port}});
        } else {
            next();
        }
    };
}

WebpackPlugin.$inject = ['config', 'executor', 'emitter', 'injector'];
module.exports = {
    'framework:webpack': ['type', WebpackPlugin],
    'middleware:webpack': ['factory', createWebpackMiddleware]
};
