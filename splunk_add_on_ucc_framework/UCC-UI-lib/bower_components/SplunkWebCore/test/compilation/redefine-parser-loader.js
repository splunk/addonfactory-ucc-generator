var _ = require('lodash');
var astQuery = require('ast-query');
var crypto = require('crypto');
var path = require('path');

var log = require('./child-log');
var MockModulePlugin = require('./MockModulePlugin');
var virtualModuleLoader = require('../../build_tools/web_loaders/virtual-module-loader');

/**
 * A webpack loader that parses a module's source code to detect (re-)define() calls, including
 * mockModuleLocationsGen calls, which are converted to define calls. Found redefines and replacements
 * are resolved and stored for further handling by the MockModulePlugin. The functions for creating
 * replacement modules are extracted as virtual modules (using random identifiers). Applied to all
 * active test files by web/test/webpack-plugin.
 *
 * Note: this features some remnants of kreozot/callback-loader, mainly the replaceIn function.
 *
 * @param source - module source code
 * @returns - source of the new module
 */


//replace a module with another (existing) module
var regularRedefineTmpl = _.template('define(\'${ redefine }\', [\'${ replacement }\'], function(x) { return x });\n');

//define a new anonymous module using a function
var virtualDefineTmpl = _.template('define([${ dependencies }], ${ originalSource });');

//replace a module with a previously created virtual module
//note the prototype switch: this is required for some uses of instanceof
var redefineWithVirtualTmpl = _.template(
    'define(\'${ redefine }\', [\'virtual-module?ns=testing_mocks&id=${ virtualId }!virtual-module-template' +
    '\',\'${ redefine }\'], function(replacement, redefine) {\n' +
    '  replacement.prototype = redefine.prototype;\n' +
    '  return replacement; });');


module.exports = function (source) {
    var self = this;
    var done = this.async();
    var mockObject = {}, indexOffset = 0;

    function handleDefine(node, f, r) {
        var redefine = argumentToValue(node, 0);
        var dependencies = argumentToValue(node, 1);
        var replacement = argumentToValue(node, 2);

        if (_.isString(redefine)) {
            if (!_.isArray(dependencies)) {
                replacement = dependencies;
                dependencies = [];
            }

            self.resolve(self.context, redefine, function (errRedefine, resolvedRedefine) {
                if (errRedefine) {
                    //this could be a re-define (where the original module got renamed/deleted), but also a
                    // virtual define that's used in the mock module helper. errors causes by the latter case
                    // are caught by the runner: be lenient and warn, but don't bail
                    var msg = ['Re-defining an unknown module:', redefine, 'in', path.relative(__dirname, self.resource)].join(' ');
                    log.warn(msg);
                    return f();
                    //return r(new Error(msg));
                }

                var virtualModuleId = crypto.randomBytes(16).toString('hex');
                var originalSource = source.substring(replacement.range[0] + indexOffset,
                    replacement.range[1] + indexOffset);
                var newDefineSrc = virtualDefineTmpl({
                    dependencies: _(dependencies).map('raw').join(','),
                    originalSource: originalSource
                });

                virtualModuleLoader.setVirtualModule('testing_mocks', virtualModuleId, newDefineSrc);
                mockObject[resolvedRedefine] = virtualModuleId;

                var output = redefineWithVirtualTmpl({redefine: redefine, virtualId: virtualModuleId});
                source = replaceIn(source, node.range[0], node.range[1], output);
                f();
            });
        } else {
            f();
        }
    }

    function handleMockModules(node, f) {
        var redefine = argumentToValue(node, 0);
        var replacement = argumentToValue(node, 1);

        var redefines = [], output = '';
        if (_.isArray(redefine)) {
            redefines = _.map(redefine, 'value');
        } else if (_.isString(redefine)) {
            redefines.push(redefine);
        } else {
            throw new Error('Unsupported redefine in mockModuleLocationsGen');
        }

        iterateAsync(redefines, function (redefine, f) {

            self.resolve(self.context, redefine, function (errRedefine, resolvedRedefine) {
                if (errRedefine) {
                    log.warn('Trying to mock an unknown module:', redefine, 'in', path.relative(__dirname, self.resource));
                } else {
                    output += regularRedefineTmpl({redefine: redefine, replacement: replacement});
                }
                f();
            });
        }, function () {
            source = replaceIn(source, node.range[0], node.range[1], output);
            f();
        });
    }

    var ast = astQuery(source);
    var query = ast.callExpression('mockModuleLocationsGen');
    var mmPlugin = MockModulePlugin.getInstance(self._compiler);

    iterateAsync(query.nodes, handleMockModules, function () {

        ast = astQuery(source);
        indexOffset = 0;
        var query = ast.callExpression('define');

        iterateAsync(query.nodes, handleDefine, function () {

            if (!_.isEmpty(mockObject)) {
                mmPlugin.mocks[self.resource] = mockObject;
            }
            done(null, source);
        }, function (err) {
            done(err, null);
        });
    });


    function replaceIn(text, indexFrom, indexTo, replaceText) {
        var actualIndexFrom = indexFrom + indexOffset;
        var actualIndexTo = indexTo + indexOffset;
        indexOffset = indexOffset + replaceText.length - (indexTo - indexFrom);
        return text.substr(0, actualIndexFrom) + replaceText + text.substr(actualIndexTo, text.length);
    }
};

function argumentToValue(node, position) {
    if (position >= node['arguments'].length) {
        return undefined;
    }

    var argument = node['arguments'][position];
    if (argument.type == 'Literal') {
        return argument.value;
    } else if (argument.type == 'ArrayExpression') {
        return argument.elements;
    } else if (argument.type == 'FunctionExpression') {
        return argument;
    } else {
        throw new Error('Invalid arguments of function ' + funcName + '. Only literals, arrays, ' +
            'functions accepted, found: ' + argument.type);
    }
}

function iterateAsync(nodes, iterator, f, r) {

    function next() {
        var n = nodes.shift();
        if (n) {
            iterator(n, next, r);
        } else {
            f();
        }
    }

    next();
}