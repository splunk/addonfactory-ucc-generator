'use strict';

var fs = require('fs');
var path = require('path');

if (typeof process.env.SPLUNK_HOME === 'undefined') {
    console.log('$SPLUNK_HOME is not set, unable to write out config file.');
    process.exit(1);
}

var confPath = path.resolve(process.env.SPLUNK_HOME, 'etc', 'system', 'local', 'web.conf');

var defaultConfFile = '[settings]\n' +
    'minify_css = False\n' +
    'minify_js = False\n' +
    'js_no_cache = True\n' +
    'js_logger_mode = Firebug\n' +
    '\n' +
    'cacheEntriesLimit = 0\n' +
    'cacheBytesLimit = 0\n' +
    'enableWebDebug = True\n';

fs.exists(confPath, function(exists) {
    if (exists) {
        console.log('Config already present:', confPath);
    } else {
        fs.writeFile(confPath, defaultConfFile, function(error) {
            if (error) {
                console.log('Error writing default config to:', confPath, error);
                process.exit(1);
            } else {
                console.log('Wrote default config to:', confPath);
            }
        });
    }
});
