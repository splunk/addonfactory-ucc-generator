var path = require('path');
var fs = require('fs');
var os = require('os');

var SPLUNK_HOME = process.env.SPLUNK_HOME;
var SPLUNK_SOURCE = process.env.SPLUNK_SOURCE;

var requirejs = require(path.join(SPLUNK_HOME, 'lib', 'node_modules', 'requirejs', 'bin', 'r.js'));

var TMP_DIR = path.join(os.tmpDir(), 'rjs-' + (new Date()).getTime());
var SPLUNK_JS = path.join(SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js');
var DEST_DIR = path.join(SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js');

var VERBOSE = process.argv.slice(1).some(function(arg) { return arg == '-v' || arg == '--verbose'; });

var logger = {
    log: console.log.bind(console),
    debug: VERBOSE ? console.log.bind(console) : function() {},
    time: VERBOSE ? console.time.bind(console) : function() {},
    timeEnd: VERBOSE ? console.timeEnd.bind(console) : function() {}
};

requirejs.tools.useLib(function(require) {
    require(['parse', 'esprima', 'optimize'], function main(parse, esprima, optimize) {
        var buildName = process.argv.slice(2).filter(function(arg) { return arg[0] != '-'; })[0];
        var modules = MODULE_CONFIG[buildName];
        if (!modules) {
            logger.log('Invalid build name:', JSON.stringify(buildName), '(Valid options are: ' + Object.keys(MODULE_CONFIG).map(JSON.stringify).join(', ') + ')')
            process.exit(1);
        }
        logger.debug('Building', buildName, 'with', modules.length, 'bundles');
        var bootstrapModule = modules[0];
        var bundles = modules.slice(1);
        var bundleMap = {};
        var optimizedBundleMap = {};

        // Build all bundles incrementally, while building up a bundle map and exclusion list of all the modules
        // we've included in a bundle so far. After all bundles are built we're building a bootstrap module
        // (config.js) that include require.js, the shared config and the bundle map.
        // We also create both the regular as well as optimized set of bundles in parallel.

        function buildNextBundle() {
            try {
                if (bundles.length) {
                    buildBundleIncremental(bundles.shift(), buildNextBundle);
                } else {
                    buildBootstrapBundle(bootstrapModule);
                }
            } catch (e) {
                logger.log('Error building bundle:', e);
                process.exit(1);
            }
        }

        function buildBundleIncremental(module, callback) {
            logger.log('Building bundle', module.name);
            var singleModuleConfig = buildSingleModuleConfig(module, OPTIMIZER_CONFIG);
            singleModuleConfig.exclude = (module.exclude || []).concat(moduleListFromBundleMap(bundleMap));

            singleModuleConfig.out = function(output) {
                logger.timeEnd('build:' + module.name);
                logger.debug('OUTPUT size:', Math.round(output.length / 1024) + 'K');
                var foundModules = [];

                // Find all modules included in the bundle and record it in the bundleMap
                parse.recurse(esprima.parse(output), function(callName, config, name, deps) {
                    if (name != null) {
                        foundModules.push(name);
                    }
                });
                bundleMap[module.name] = foundModules;

                // Output bundle file and optimzed bundle file
                writeFile(buildOutputFilePath(module.name), output);
                logger.time('uglify:' + module.name);
                var optimizedModuleName = createOptimizedModuleName(module.name, buildName);
                logger.debug('Building optimized module', optimizedModuleName);
                var optimzedOutput = optimize.optimizers.uglify2(module.name, output, null, false, OPTIMIZER_CONFIG);
                logger.debug('Optimized output size:', Math.round(optimzedOutput.length / 1024) + 'K');
                writeFile(buildOutputFilePath(optimizedModuleName), optimzedOutput);
                logger.timeEnd('uglify:' + module.name);
                logger.debug();
            };
            logger.time('build:' + module.name);
            requirejs.optimize(singleModuleConfig, callback, fail('Error building module ' + module.name));
        }

        function buildBootstrapBundle(module) {
            logger.log("Building bootstrap module", module.name);
            var bootstrap = buildSingleModuleConfig(module, OPTIMIZER_CONFIG);
            bootstrap.wrapShim = false;
            bootstrap.out = function(output) {
                for(var m in bundleMap) {
                    if (bundleMap.hasOwnProperty(m))
                        bundleMap[m].sort();
                }
                writeFile(buildOutputFilePath(module.name), output + '\nrequire.config(' + JSON.stringify({bundles: bundleMap}, null, 2) + ');');
                var optimizedModuleName = createOptimizedModuleName(module.name, buildName);
                logger.debug("Building optimized bootstrap module", optimizedModuleName);
                var optimizedOutput = optimize.optimizers.uglify2(module.name, output, null, false, OPTIMIZER_CONFIG);
                Object.keys(bundleMap).forEach(function(bundle) {
                    optimizedBundleMap[createOptimizedModuleName(bundle, buildName)] = bundleMap[bundle];
                });
                writeFile(buildOutputFilePath(optimizedModuleName), optimizedOutput + '\nrequire.config(' + JSON.stringify({bundles: optimizedBundleMap}) + ');');
            };
            requirejs.optimize(bootstrap, function() {
                try {
                    moveFilesIntoPlace(buildName, Object.keys(bundleMap));
                    moveFilesIntoPlace(buildName + '.min', Object.keys(optimizedBundleMap));
                } catch (e) {
                    logger.log('Error moving files into place', e);
                    process.exit(1);
                }
                logger.debug('Done.');
            }, fail('Bootstrap module failed'));
        }

        buildNextBundle();
    });
});

function buildSingleModuleConfig(module, config) {
    var moduleConfig = cloneObject(config);
    delete moduleConfig.dir;

    moduleConfig.include = module.include;
    moduleConfig.exclude = module.exclude;
    moduleConfig.excludeShallow = module.excludeShallow;

    if (module.override) {
        deepMerge(moduleConfig, module.override);
    }
    return moduleConfig;
}

function createOptimizedModuleName(name, buildName) {
    return name.replace('build/' + buildName, 'build/' + buildName + '.min');
}

function writeFile(outputFileName, content) {
    logger.debug('Writing bundle to', outputFileName);
    mkdirp(path.dirname(outputFileName));
    fs.writeFileSync(outputFileName, content);
}

function moveFilesIntoPlace(buildName, modules) {
    rmdirRecursiveSync(path.join(DEST_DIR, 'build', buildName));
    // Move each module into the 
    ['build/' + buildName + '/config'].concat(modules).forEach(function(module) {
        var src = moduleToFilePath(module, TMP_DIR);
        var dest = moduleToFilePath(module, DEST_DIR);
        mkdirp(path.dirname(dest));
        moveFile(src, dest);
    });
}

function moveFile(src, dest) {
    logger.debug('MV', src, dest);
    try {
        fs.renameSync(src, dest);
    } catch (e) {
        logger.debug('Move failed with error', e, 'Trying to copy...');
        fs.writeFileSync(dest, fs.readFileSync(src, {encoding: 'utf8'}), {encoding: 'utf8'});
        fs.unlinkSync(src);
    }
}

function rmdirRecursiveSync(dir) {
    logger.debug('RM', dir);
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(function(file) {
            var curPath = path.join(dir, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recursion warning!
                rmdirRecursiveSync(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
}

function buildOutputFilePath(moduleName) {
    return moduleToFilePath(moduleName, TMP_DIR);
}

function moduleToFilePath(moduleName, directory) {
    return path.join(directory, moduleName.replace(/\//g, path.sep) + '.js');
}

function moduleListFromBundleMap(bundleMap) {
    var result = [];
    var seen = {};
    Object.keys(bundleMap).forEach(function(bundle) {
        bundleMap[bundle].forEach(function(module) {
            if (!seen[module]) {
                result.push(module);
                seen[module] = true;
            }
        });
    });
    return result;
}

function mkdirp(dirname) {
    try {
        fs.mkdirSync(dirname);
    } catch (err) {
        if (err.code == "ENOENT") {
            var slashIdx = dirname.lastIndexOf(path.sep);

            if (slashIdx > 0) {
                var parentPath = dirname.substring(0, slashIdx);
                mkdirp(parentPath);
                mkdirp(dirname);
            } else {
                throw err;
            }
        } else if (err.code != "EEXIST") {
            throw err;
        }
    }
}

function deepMerge(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
        target = target || [];
        dst = dst.concat(target);
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = deepMerge(target[i], e);
            } else {
                if (target.indexOf(e) === -1) {
                    dst.push(e);
                }
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function(key) {
                dst[key] = target[key];
            })
        }
        Object.keys(src).forEach(function(key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    dst[key] = deepMerge(target[key], src[key]);
                }
            }
        });
    }
    return dst;
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function fail(errorMessage) {
    return function(e) {
        logger.log(errorMessage, e);
        process.exit(1);
    }
}

var OPTIMIZER_CONFIG = {
    preserveLicenseComments: false,
    // Disable optimization in config, we're running the optimizer manually for each bundle
    optimize: 'none',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    baseUrl: SPLUNK_JS,
    mainConfigFile: path.join(SPLUNK_JS, 'profiles', 'shared.js'),
    dir: TMP_DIR,
    skipDirOptimize: true,
    optimizeCss: 'none',
    wrapShim: true,
    shim: {
        'profiles/shared': {
            deps: ['contrib/require']
        }
    },
    map: {
        "*": {
            "css": "splunkjs/contrib/require-css/css"
        }
    },
    paths: {
        "framework.i18n": path.join(SPLUNK_SOURCE, 'cfg', 'bundles', 'framework', 'server', 'static', 'i18n')
    },
    waitSeconds: 0 // disable load timeout
};

var SPLUNKJS_MODULES = [
    {
        name: 'build/splunkjs/config',
        include: [
            'contrib/require',
            'profiles/shared',
            'splunkjs/preload',
            'framework.i18n'
        ],

        // We stub it out such that in the build, it is never
        // actually included, since shared.js has everything we need.
        stubModules: ['splunkjs/config'],
        override: {
            wrapShim: false,
            wrap: {
                start: '',
                end: ''
            }
        }
    },
    {
        name: 'build/splunkjs/mvc',
        include: [
            // Base contrib
            "underscore", "jquery", "backbone",
            // RequireJS plugins
            "contrib/text",
            // Legacy Splunk
            'splunk.i18n', 'splunk', 'splunk.util', 'splunk.legend', 'splunk.logger', 'splunk.jquery.csrf', 'splunk.print',
            'util/dom_utils', 'splunk.window', 'splunk.session', 'splunk.messenger',
            'splunk.time', 'splunk.timerange',
            // splunkjs 
            'splunkjs/ready', 'splunkjs/mvc', 'splunkjs/splunk', 'splunkjs/mvc/drilldown', 'splunkjs/mvc/utils',
            'splunkjs/mvc/basemanager', 'splunkjs/mvc/basesplunkview', 'splunkjs/mvc/basemodel',
            'splunkjs/mvc/messages', 'splunkjs/mvc/searchmanager', 'splunkjs/mvc/savedsearchmanager',
            'splunkjs/mvc/tokenawaremodel', 'splunkjs/mvc/tokensafestring',
            'splunkjs/mvc/simplesplunkview', 'splunkjs/mvc/postprocessmanager',

            // Base Collections
            'collections/Base', 'collections/SplunkDsBase',
            // Basic Collections
            'collections/shared/splunkbar/SystemMenuSections', 'collections/shared/FlashMessages', 'collections/services/AppLocals',
            // API Collections
            'collections/services/authentication/CurrentContexts', 'collections/services/data/ui/Managers',
            'collections/services/data/ui/Times', 'collections/services/data/ui/Views', 'collections/services/Messages',
            'collections/services/saved/Searches', 'collections/services/search/TimeParsers',
            'collections/services/data/ui/Navs', 'collections/search/SelectedFields',
            'collections/services/data/ui/WorkflowActions', 'collections/services/search/Jobs', 'collections/search/Jobs',
            // Base Models
            'models/Base', 'models/SplunkDBase',
            // Basic Models
            'models/ACLReadOnly', 'models/shared/Application', 'models/shared/DateInput', 'models/SplunkDWhiteList', 'models/shared/splunkbar/SystemMenuSection',
            'models/shared/FlashMessage', 'models/shared/fetchdata/EAIFetchData', 'models/shared/TimeRange',
            // API Models
            'models/services/ACL', 'models/services/AppLocal', 'models/services/authentication/CurrentContext',
            'models/services/authentication/User', 'models/services/data/ui/Manager', 'models/services/data/ui/Nav',
            'models/services/data/ui/Time', 'models/services/data/ui/View', 'models/services/data/UserPrefGeneral', 'models/services/Message',
            'models/services/saved/Search', 'models/services/search/TimeParser', 'models/services/server/ServerInfo',
            'models/services/configs/Web', 'models/services/search/jobs/Control', 'models/services/search/jobs/Summary',
            'models/services/search/Job', 'models/services/data/ui/WorkflowAction','models/services/search/jobs/Result',
            'models/services/search/IntentionsParser', 'models/services/saved/FVTags',
            // Misc Models
            'models/classicurl', 'models/services/configs/AlertAction', 'models/search/Report', 'models/shared/eventsviewer/UIWorkflowAction', 'models/search/Job',
            'models/search/SelectedField', 'models/shared/fetchdata/ResultsFetchData', 'splunkjs/mvc/sharedmodels',

            // Base Views
            'views/Base', 'views/shared/Modal',
            // Controls
            'views/shared/controls/Control', 'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/controls/SyntheticCheckboxControl',
            'views/shared/controls/TextareaControl',
            'views/shared/controls/LabelControl',
            'views/shared/controls/ControlGroup',
            'views/shared/jobstatus/buttons/ExportResultsDialog',
            // Delegates
            'views/shared/delegates/Base', 'views/shared/delegates/Popdown', 'views/shared/delegates/StopScrollPropagation',
            'views/shared/delegates/TextareaResize', 'views/shared/FlashMessages', 'views/shared/delegates/Accordion',
            'views/shared/delegates/ColumnSort', 'views/shared/delegates/TableDock', 'views/shared/delegates/TableHeadStatic',
            // Include select2 along with it's styles 
            'select2/select2', 'css!select2/select2.css'
        ],
        excludeShallow: ['splunkjs/generated/urlresolver'],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/splunkchrome',
        include: [
            'splunkjs/mvc/headerview',
            'splunkjs/mvc/footerview',
            'splunkjs/mvc/aceheader/aceheader'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/results_table',
        include: [
            'views/shared/results_table/ResultsTableMaster',
            'splunkjs/mvc/tableview'
        ]
    },
    {
        name: 'build/splunkjs/compiled/singlevalue',
        include: [
            'views/shared/singlevalue/Master',
            'splunkjs/mvc/singleview'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/eventsviewer',
        include: [
            'views/shared/eventsviewer/Master',
            'splunkjs/mvc/eventsviewerview'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/charting',
        include: [
            'splunkjs/mvc/chartview',
            'js_charting/js_charting'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/splunkmap',
        include: [
            'views/shared/map/Master',
            'splunkjs/mvc/splunkmapview'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/forms',
        override: {normalizeDirDefines: 'all'},
        include: [
            'splunkjs/mvc/checkboxview', 'splunkjs/mvc/checkboxgroupview',
            'splunkjs/mvc/radiogroupview', 'splunkjs/mvc/multiselectview',
            'splunkjs/mvc/selectview', 'splunkjs/mvc/textboxview'
        ]
    },
    {
        name: 'build/splunkjs/compiled/searchcontrols',
        include: [
            'splunkjs/mvc/timepickerview',
            'splunkjs/mvc/searchbarview',
            'splunkjs/mvc/searchcontrolsview',
            'splunkjs/mvc/progressbarview'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/miscviz',
        include: [
            'splunkjs/mvc/datatemplateview'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/splunkjs/compiled/timelineview',
        include: ['splunkjs/mvc/timelineview'],
        override: {normalizeDirDefines: 'all'},
        // We never run with Flash for the timeline, so no need to 
        // take this overhead
        stubModules: ['contrib/swfobject', 'swfobject']
    },
    {
        name: 'build/splunkjs/compiled/simplexml',
        include: ['splunkjs/mvc/simplexml'],
        override: {normalizeDirDefines: 'all'}
    }
];
var SIMPLEXML_MODULES = [
    {
        name: 'build/simplexml/config',
        include: [
            'contrib/require',
            'profiles/shared'
        ],
        override: {
            wrapShim: false,
            wrap: {
                start: '',
                end: ''
            }
        }
    },
    {
        name: 'build/simplexml/mvc',
        include: [
            'splunkjs/mvc/simplexml',
            'splunkjs/mvc/simplexml/ready'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/simplexml/compiled/js_charting',
        include: [
            "js_charting/js_charting"
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/simplexml/compiled/results_table',
        include: [
            'views/shared/results_table/ResultsTableMaster'
        ]
    },
    {
        name: 'build/simplexml/compiled/events_viewer',
        include: [
            'views/shared/eventsviewer/Master'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/simplexml/compiled/single_value',
        include: [
            'views/shared/singlevalue/Master'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/simplexml/compiled/splunk_map',
        include: [
            'views/shared/map/Master'
        ],
        override: {normalizeDirDefines: 'all'}
    }
];

function getModulesFromFactoryConfig() {
    var factoryConfigPath = path.join(SPLUNK_JS, 'dashboard', 'factory_config.json');
    var factoryConfig = JSON.parse(fs.readFileSync(factoryConfigPath));
    return Object.keys(factoryConfig.typeMap).reduce(function(result, type) {
        var module = factoryConfig.typeMap[type].require;
        if (module && result.indexOf(module) < 0) {
            result.push(module);
        }
        return result;
    }, []);
}

var DASHBOARD_MODULES = [
    {
        name: 'build/dashboard/config',
        include: [
            'contrib/require',
            'profiles/shared'
        ],
        override: {
            wrapShim: false,
            wrap: {
                start: '',
                end: ''
            }
        }
    },
    {
        name: 'build/dashboard/main',
        include: [
            'pages/dashboard'
        ].concat(getModulesFromFactoryConfig()),
        exclude: ['ace/ace'],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/dashboard/legacy_api',
        include: [
            'splunkjs/mvc/simplexml',
            'splunkjs/mvc/simplexml/ready'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/dashboard/compiled/js_charting',
        include: [
            "js_charting/js_charting"
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/dashboard/compiled/results_table',
        include: [
            'views/shared/results_table/ResultsTableMaster'
        ]
    },
    {
        name: 'build/dashboard/compiled/events_viewer',
        include: [
            'views/shared/eventsviewer/Master'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/dashboard/compiled/single_value',
        include: [
            'views/shared/singlevalue/Master'
        ],
        override: {normalizeDirDefines: 'all'}
    },
    {
        name: 'build/dashboard/compiled/splunk_map',
        include: [
            'views/shared/map/Master'
        ],
        override: {normalizeDirDefines: 'all'}
    }
];

var MODULE_CONFIG = {
    splunkjs: SPLUNKJS_MODULES,
    simplexml: SIMPLEXML_MODULES,
    dashboard: DASHBOARD_MODULES
};
