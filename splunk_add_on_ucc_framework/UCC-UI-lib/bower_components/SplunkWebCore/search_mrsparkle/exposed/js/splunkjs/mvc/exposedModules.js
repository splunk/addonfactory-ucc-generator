define(['splunkjs/mvc/exposedModulesBase', 'underscore'], function(splunkjsMvcModules, _) {
    return _.extend({
        'splunk': require('splunk'),
        'util/console': require('util/console'),
        'splunk.config': require('splunk.config')
    }, splunkjsMvcModules);
});
