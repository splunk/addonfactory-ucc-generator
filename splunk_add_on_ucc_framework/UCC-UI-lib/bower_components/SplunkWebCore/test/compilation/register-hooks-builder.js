var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var log = require('./child-log');
var virtualModuleLoader = require('../../build_tools/web_loaders/virtual-module-loader');

/**
 * Builds and registers a virtual module exporting a single function. This function
 * loads and prepares all (active) test application hooks, and calls a mandatory
 * callback on completion. Used by web/test/bootstrap-helpers.
 */
module.exports = function (appPaths) {

    var promises = _.chain(appPaths)
        .reduce(function (hookPaths, appPath, app) {
            var hookPath = path.join(appPath, 'test', 'support', 'hooks.js');
            if (!fs.existsSync(hookPath)) {
                log.warn('No hook file for application:', app);
            } else {
                hookPaths[app] = hookPath;
            }
            return hookPaths;
        }, {})
        .map(function (hookPath, app) {
            return _.template(
                'new Promise(function (d) {\n' +
                '    require(${ hookPath }, function(hooks) {\n' +
                '          d({ app: ${ app }, hooks: hooks});\n' +
                '    });\n' +
                '})')({hookPath: JSON.stringify([hookPath]), app: JSON.stringify(app)});
        }).value();

    var source = _.template(
        'define(function() {\n' +
        '    return function(cb) {\n' +
        '        return Promise.all([${ promises }]).then(cb).catch(function (err) {\n' +
        '            console.log(\'error during hooks loading\', err);\n' +
        '        });\n' +
        '    };\n' +
        '});')({promises: promises.join(',')});

    virtualModuleLoader.setVirtualModule('testing', 'hooksLoader', source);
};
