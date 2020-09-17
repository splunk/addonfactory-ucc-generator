'use strict';

var fs = require('fs');
var path = require('path');

var rimraf = require('rimraf');

if (typeof process.env.SPLUNK_HOME === 'undefined') {
    console.log('SPLUNK_HOME must be set to symlink the UI for development.');
    process.exit(1);
}
var SPLUNK_HOME = process.env.SPLUNK_HOME;

if (typeof process.env.SPLUNK_SOURCE === 'undefined') {
    console.log('SPLUNK_SOURCE must be set to symlink the UI for development.');
    process.exit(1);
}
var SPLUNK_SOURCE = process.env.SPLUNK_SOURCE;

var stat = function (path) {
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(error, stats) {
            if (error) {
                reject(error);
            } else {
                resolve(stats);
            }
        });
    });
};

var isDirectory = function (path) {
    return stat(path)
    .then(function(stats) {
        if (!stats.isDirectory()) {
            throw new Error(path + ' is not a directory.');
        }
        return path;
    });
};

var rm = function(path) {
    return new Promise(function (resolve, reject) {
        rimraf(path, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

var symlink = function (target, path, type) {
    return new Promise(function(resolve, reject) {
        fs.symlink(target, path, type, function(error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

var ls = function (path) {
    return new Promise(function(resolve, reject) {
        fs.readdir(path, function(error, files) {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}

var mkdir = function (path) {
    return new Promise(function(resolve, reject) {
        fs.mkdir(path, function(error) {
            if (error) {
                reject(error);
            } else {
                resolve(path);
            }
        });
    });
}

var replaceLink = function (target, path) {
    return stat(target)
    .then(function (stats) {
        var type = stats.isDirectory() ? 'dir' : 'file';
        return rm(path)
        .then(function() {
            console.log('Removed', path);

            console.log('Pointed', path, '->', target);
            return symlink(target, path, type);
        })
        .catch(function(error) {
            console.log('Failed to remove', path, error);
            throw error;
        });
    })
    .catch(function(error) {
        console.log(target, 'does not exist.');
    });
};


var FULL_TEST_FX_PATH = path.resolve(SPLUNK_SOURCE, 'cfg','bundles','testfx2');
var FULL_SPLUNK_JS_TEST_PATH = path.resolve(SPLUNK_SOURCE, 'cfg', 'bundles', 'splunkjs_test');
var FULL_CORE_JS_TEST_PATH = path.resolve(SPLUNK_SOURCE, 'cfg', 'bundles', 'corejs_test');
var FULL_SPLUNK_MONITORING_CONSOLE_PATH = path.resolve(SPLUNK_SOURCE, 'cfg', 'bundles', 'splunk_monitoring_console');
var FULL_FX_PATH = path.resolve(SPLUNK_SOURCE, 'cfg','bundles','framework');
var FULL_WEB_PATH = path.resolve(SPLUNK_SOURCE, 'web');
var FULL_APP_PATH = path.resolve(SPLUNK_SOURCE, 'python-site', 'splunk');
var FULL_APP_VERSION_FILE = path.resolve(SPLUNK_SOURCE, 'python-site', 'CMakeFiles', 'version.py');
var FULL_APP_BUILD_INFO_FILE = path.resolve(SPLUNK_SOURCE, 'python-site', 'CMakeFiles', 'build_info.py');

var BUILT_SPLUNK_JS_TEST_PATH = path.resolve(SPLUNK_HOME, 'etc', 'apps', 'splunkjs_test');
var BUILT_CORE_JS_TEST_PATH = path.resolve(SPLUNK_HOME, 'etc', 'apps', 'corejs_test');
var BUILT_SPLUNK_MONITORING_CONSOLE_PATH = path.resolve(SPLUNK_HOME, 'etc', 'apps', 'splunk_monitoring_console');
var BUILT_FX_PATH = path.resolve(SPLUNK_HOME, 'etc', 'apps','framework');
var BUILT_WEB_PATH = path.resolve(SPLUNK_HOME, 'share', 'splunk');

var BUILT_APP_PATH = path.resolve(SPLUNK_HOME, 'lib', 'python2.7', 'site-packages');

var APPSERVER_MRSPARKLE_PATH = path.resolve(BUILT_WEB_PATH, 'search_mrsparkle');
var APPSERVER_SUITE_MENU_PATH = path.resolve(BUILT_WEB_PATH, 'suite_menu.html');
var APPSERVER_TESTS_PATH = path.resolve(BUILT_WEB_PATH, 'tests');

var SOURCE_MRSPARKLE_PATH = path.resolve(FULL_WEB_PATH, 'search_mrsparkle');
var SOURCE_SUITE_MENU_PATH = path.resolve(FULL_WEB_PATH, 'testing', 'suite_menu.html');
var SOURCE_TESTS_PATH = path.resolve(FULL_WEB_PATH, 'testing', 'tests');


isDirectory(FULL_WEB_PATH)
.then(function() {
    replaceLink(SOURCE_MRSPARKLE_PATH, APPSERVER_MRSPARKLE_PATH);
})
.catch(function(error) {
    console.log(FULL_WEB_PATH, 'does not exist.');
});

isDirectory(FULL_APP_PATH)
.then(function() {
    var BUILT_SPLUNK_PATH = path.resolve(BUILT_APP_PATH, 'splunk');
    var BUILT_CLILIB_PATH = path.resolve(BUILT_SPLUNK_PATH, 'clilib');

    var FULL_APP_CLILIB_PATH = path.resolve(FULL_APP_PATH, 'clilib');

    var endsWith = function (string, ending) {
        if (string.length < ending.length) {
            return false;
        } else {
            return string.indexOf(ending) === (string.length - ending.length);
        }
    };

    rm(BUILT_SPLUNK_PATH)
    .then(function() {
        return mkdir(BUILT_SPLUNK_PATH);
    })
    .then(function() {
        return ls(FULL_APP_PATH);
    })
    .then(function(files) {
        return files.filter(function(file){
            return !endsWith(file, '.pyc')
            && !endsWith(file, '.in')
            && !endsWith(file, 'version.py')
            && !endsWith(file, 'clilib');
        })
    })
    .then(function(files) {
        return Promise.all(files.map(function(file) {
            return replaceLink(path.resolve(FULL_APP_PATH, file), path.resolve(BUILT_SPLUNK_PATH, file));
        }));
    })
    .then(function() {
        return replaceLink(path.resolve(FULL_APP_VERSION_FILE), path.resolve(BUILT_SPLUNK_PATH, 'version.py'));
    })
    .then(function() {
        return mkdir(BUILT_CLILIB_PATH);
    })
    .then(function(clilibPath) {
        return ls(FULL_APP_CLILIB_PATH);
    })
    .then(function(files) {
        return files.filter(function(file){
            return !endsWith(file, '.pyc')
            && !endsWith(file, '.in')
            && !endsWith(file, 'build_info.py');
        })
    })
    .then(function(files) {
        return Promise.all(files.map(function(file) {
            return replaceLink(path.resolve(FULL_APP_CLILIB_PATH, file), path.resolve(BUILT_CLILIB_PATH, file));
        }));
    })
    .then(function(files) {
        return replaceLink(path.resolve(FULL_APP_BUILD_INFO_FILE), path.resolve(BUILT_CLILIB_PATH, 'build_info.py'));
    })
    .catch(function(error) {
        console.log('ERROR', error);
    });
})
.catch(function(e) {
    console.log(FULL_APP_PATH, 'does not exist.', e);
});

isDirectory(FULL_FX_PATH)
.then(function() {
    replaceLink(path.resolve(FULL_FX_PATH, 'server'), path.resolve(BUILT_FX_PATH, 'server'));
    replaceLink(path.resolve(FULL_FX_PATH, 'cli'), path.resolve(BUILT_FX_PATH, 'cli'));
})
.catch(function() {
    console.log(FULL_FX_PATH, 'does not exist.');
});

isDirectory(FULL_TEST_FX_PATH)
.then(function() {
    replaceLink(FULL_TEST_FX_PATH, path.resolve(BUILT_FX_PATH, 'testfx2'));
})
.catch(function() {
    console.log(FULL_TEST_FX_PATH, 'does not exist.');
});

isDirectory(FULL_SPLUNK_JS_TEST_PATH)
.then(function() {
    replaceLink(FULL_SPLUNK_JS_TEST_PATH, BUILT_SPLUNK_JS_TEST_PATH);
})
.catch(function() {
    console.log(FULL_SPLUNK_JS_TEST_PATH, 'does not exist.');
});

isDirectory(FULL_CORE_JS_TEST_PATH)
.then(function() {
    replaceLink(FULL_CORE_JS_TEST_PATH, BUILT_CORE_JS_TEST_PATH);
})
.catch(function() {
    console.log(FULL_CORE_JS_TEST_PATH, 'does not exist.');
});

isDirectory(FULL_SPLUNK_MONITORING_CONSOLE_PATH)
.then(function() {
    replaceLink(path.resolve(FULL_SPLUNK_MONITORING_CONSOLE_PATH, 'appserver'), path.resolve(BUILT_SPLUNK_MONITORING_CONSOLE_PATH, 'appserver'));
    replaceLink(path.resolve(FULL_SPLUNK_MONITORING_CONSOLE_PATH, 'default', 'data'), path.resolve(BUILT_SPLUNK_MONITORING_CONSOLE_PATH, 'default', 'data'));
    replaceLink(path.resolve(FULL_SPLUNK_MONITORING_CONSOLE_PATH, 'src'), path.resolve(BUILT_SPLUNK_MONITORING_CONSOLE_PATH, 'src'));
})
.catch(function(e) {
    console.log('Error symlinking ', FULL_SPLUNK_MONITORING_CONSOLE_PATH);
    console.log(e);
});
