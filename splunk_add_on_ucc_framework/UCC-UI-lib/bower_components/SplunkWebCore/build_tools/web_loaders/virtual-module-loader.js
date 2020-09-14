var _ = require('lodash');
var path = require('path');
var url = require('url');

/**
 * Allows defining namespaced virtual modules - using source code not read from a file but
 * generated during compile time. To create a new virtual module, register its source code
 * with the loader (setVirtualModule), and refer to it like this:
 *
 *  virtual-module?ns=<yourNamespace>&id=<yourModuleId>!virtual-module-template
 *
 * For 'virtual-module-template' to work loader.config has to be merged into the current
 * webpack config. The loader ignores the source module anyway, so strictly speaking any
 * known module id can also be used.
 */

//TODO: this uses global state, which loaders are recommended not to do,
// but I don't see a way to replicate this functionality with plugins
var virtualModules = {};


var loader = function () {
    var query = url.parse(this.query, true).query;

    if (_.has(virtualModules, [query.ns, query.id])) {
        return virtualModules[query.ns][query.id];
    } else {
        throw new Error('Unknown virtual module requested: ' + query.ns + '/' + query.id);
    }
};

//add or overwrite a virtual module for a namespace
loader.setVirtualModule = function (namespace, moduleId, source) {
    if (!_.has(virtualModules, namespace)) {
        virtualModules[namespace] = {};
    }

    virtualModules[namespace][moduleId] = source;
};

//retrieve all modules for a namespace
loader.getNamespace = function (namespace) {
    return virtualModules[namespace] || {};
};

//merge into webpack config to enable ...!virtual-module-template
loader.config = {
    resolve: {
        alias: {
            'virtual-module-template': path.join(__dirname, 'virtual-module-template')
        }
    }
};

module.exports = loader;