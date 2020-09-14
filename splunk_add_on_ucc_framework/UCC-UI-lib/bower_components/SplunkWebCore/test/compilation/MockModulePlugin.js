var _ = require('lodash');
var path = require('path');

var log = require('./child-log');
var virtualModuleLoader = require('../../build_tools/web_loaders/virtual-module-loader');

/**
 * A webpack plugin hooking into the 'webpack has finished organizing all modules into chunks' stage.
 * It iterates all test chunks, and looks for modules marked as 'mocked' in the mock list. Mocked modules
 * are removed. At the same time, if a module is declared as a mock, a copy is added to the chunk, named
 * as the 'mocked' module it replaces.
 * Dependencies: The mock list used is provided by the redefine-parser loader, and
 * web/test/compilation/webpack-compilation uses a modified version of the CommonsChunkPlugin to prevent
 * mocked/mock modules from being pulled into the commons chunk.
 */
function MockModulePlugin(appNames) {
    this.apps = appNames;
    this.mocks = {};
}

MockModulePlugin.prototype.apply = function (compiler) {
    var self = this;

    compiler.plugin('compilation', function (compilation) {

        compilation.plugin('after-optimize-chunks', function (chunks, modules) {

            log.debug('starting out with mocks', self.mocks);

            var virtualMocks = virtualModuleLoader.getNamespace('testing_mocks');

            _(chunks)
                .filter(function (chunk) {
                    //only act on test chunks, i.e. not on test-bootstrap, test-common, anonymous chunks, ...
                    return _.some(self.apps, function (app) {
                        return _.startsWith(chunk.name, app);
                    });
                })
                .each(function (chunk) {

                    var chunkFile = _.first(chunk.origins).module.resource;
                    log.debug('inspecting chunk:', chunk.name, 'file', chunkFile);

                    if (!_.has(self.mocks, chunkFile)) {
                        return;
                    }

                    var mocks = self.mocks[chunkFile];
                    log.debug('  using mocks', mocks);

                    var fileMockRedefine = [];
                    chunk.modules = _.reject(chunk.modules, function (mod) {
                        if (_.isEmpty(mod.resource)) {
                            return false;
                        }
                        var removeModule = false;

                        //if this module is on the mocked list, mark it for removal
                        var fileMockOriginal = undefined;
                        _.find(mocks, function (v, k) {
                            if (mod.resource == k) {
                                fileMockOriginal = k;
                                return true;
                            }
                        });
                        if (fileMockOriginal) {
                            log.debug('  removing original module', fileMockOriginal);
                            removeModule = true;
                        }

                        //if this module is on the mock list, mark it for duplication
                        _.each(mocks, function (v, k) {
                            if (_.has(virtualMocks, v) &&
                                _.includes(mod.resource, 'virtual-module-template') &&
                                _.includes(mod.request, v)) {
                                fileMockRedefine.push({redefine: k, replacement: mod});
                            }
                        });

                        return removeModule;
                    });

                    //create copies of each mock (one for every original)
                    var app = chunk.name.substring(0, chunk.name.indexOf('/'));
                    var appSource = path.join(app, 'appserver', 'static');
                    var coreSource = path.join('web', 'search_mrsparkle', 'exposed', 'js');

                    _.each(fileMockRedefine, function (mock) {
                        log.debug('  creating mock copy for', mock.redefine);

                        //not too happy with that - cloning a module this way might break after webpack updates
                        var clonedMock = _.clone(mock.replacement);

                        //need to determine a module id for this cloned mock. this depends on whether
                        //it's a core source module (exposed/js) or an in-app module (appserver/static).
                        //also see SplunkNameModuleIdsPlugin configuration in webpack-compilation.js
                        var isCore = mock.redefine.indexOf(appSource) === -1;
                        var prefix = isCore ? '' : path.join('app', app);
                        var source = isCore ? coreSource : appSource;

                        var moduleName = mock.redefine.substring(mock.redefine.indexOf(source) + source.length + 1);
                        clonedMock.id = path.join(prefix, moduleName).slice(0, -path.extname(moduleName).length);
                        log.debug('    cloned mock id:', clonedMock.id);

                        chunk.modules.push(clonedMock);
                    });
                });
        });
    });
};

MockModulePlugin.getInstance = function (compiler) {
    return _.find(_.get(compiler, 'options.plugins', []), function (plugin) {
        return plugin instanceof MockModulePlugin;
    });
};

module.exports = MockModulePlugin;


