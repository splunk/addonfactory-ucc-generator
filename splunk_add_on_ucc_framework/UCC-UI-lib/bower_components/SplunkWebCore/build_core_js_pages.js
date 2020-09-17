var path = require('path');
var fs = require('fs');
var os = require('os');
var requirejs = require(path.join(process.env.SPLUNK_HOME, 'lib', 'node_modules', 'requirejs', 'bin', 'r.js'));
var TMP_DIR = path.join(os.tmpDir(), 'rjs-' + (new Date()).getTime());
var SPLUNK_JS = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js');
var JS_BUILD = path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'js');
var PAGES_DIR = path.join(SPLUNK_JS, 'pages');
var PROFILES_DIR = path.join(SPLUNK_JS, 'profiles');
var PAGES_PROFILE = path.join(PROFILES_DIR, 'pages.js');
var REQUIRE_MODULE_NAME = 'build/bundles/require';
var COMMON_MODULE_NAME = 'build/bundles/common';
var JS_EXTENSION_RE = /\.js$/;

mkdirp(path.join(JS_BUILD, 'build','bundles'));

// The main function to kick it all off once r.js's internal libraries have been loaded.
function main(parse, transform, build, esprima) {
    var pagesConfig = parse.findConfig(fs.readFileSync(PAGES_PROFILE, 'utf8')).config;

    // Pre-process the config with correct directory paths, so that this script can be run from anywhere.
    pagesConfig.baseUrl = SPLUNK_JS;
    pagesConfig.dir = TMP_DIR;
    pagesConfig.mainConfigFile = path.join(SPLUNK_JS, 'profiles', pagesConfig.mainConfigFile);
    pagesConfig.waitSeconds = 0; // Disable load timeout

    // For the common module, the run-time configuration needs to include a deep list of dependencies,
    // in order to avoid prevent require from trying to fetch one of those files individually.
    var commonModule = build.findBuildModule(COMMON_MODULE_NAME, pagesConfig.modules);
    expandModuleDependencies(commonModule, pagesConfig, parse, esprima, function() {
        try {
            var requireModule = build.findBuildModule(REQUIRE_MODULE_NAME, pagesConfig.modules);
            // Now that the common module dependencies are expanded, convert all modules that need to be available at runtime
            // into a `bundle` configuration that is appended to the require bootstrapping module.
            addBundlesToRequireModule(requireModule, pagesConfig.modules, transform);
            // Add all of the page-specific modules to the current configuration.
            appendPageModules(pagesConfig.modules);
        }
        catch(e) {
            console.log(e);
            process.exit(1);
        }
        // Now that all of the dynamic configuration is complete, hand things off to the r.js optimizer.
        console.log('Running the r.js optimizer, this may take a few minutes...');
        console.log('Temporary build files will be written to: ' + TMP_DIR);
        console.log('\r\n');

        var cleanup = function() {
            console.log('Removing the temporary build directory...');
            rmdirRecursiveSync(TMP_DIR);
        };

        requirejs.optimize(
            pagesConfig,
            function(output) {
                console.log(output);
                try {
                    console.log('Copying build files back to the source tree...');
                    pagesConfig.modules.forEach(function(module) {
                        var modulePath = module.name.replace(/\//g, path.sep);
                        var destPath = path.join(JS_BUILD, modulePath + '.js');
                        console.log('    ' + destPath);
                        fs.writeFileSync(destPath, fs.readFileSync(path.join(TMP_DIR, modulePath + '.js'), 'utf8'), 'utf8');
                    });
                    cleanup();
                    console.log('Done.');
                }
                catch(e) {
                    console.log(e);
                    cleanup();
                    process.exit(1);
                }
            },
            function(err) {
                console.log(err);
                cleanup();
                process.exit(1);
            }
        );
    });
}

function expandModuleDependencies(module, fullConfig, parse, esprima, callback) {
    // To get the full recursive list of dependencies for a module we will run that module through the optimizer and parse the output.
    // First create a build configuration for just that module.
    var singleModuleConfig = JSON.parse(JSON.stringify(fullConfig));
    delete singleModuleConfig.modules;
    delete singleModuleConfig.dir;
    singleModuleConfig.include = module.include;

    console.log('Expanding dependencies for ' + module.name + '...');
    // Instead of writing the optimized JS out to a file, capture the output and use the r.js parser to find all dependencies inside it.
    // Then add those to the original module's dependency list, dedup, and write the full list back to the module config.
    singleModuleConfig.out = function(output) {
        var normalizedDeps = [];
        parse.recurse(esprima.parse(output), function(callName, config, name, deps) {
            if (deps) {
                normalizedDeps = normalizedDeps.concat(deps.map(function(dep) {
                    if (dep[0] === '.') {
                        dep = path.join(path.dirname(name), dep);
                        // This will be an OS file path, transform it to a require js module path
                        // by replacing the platform-specific path separator with '/'.
                        if (path.sep !== '/') {
                            dep = dep.split(path.sep).join('/');
                        }
                    }
                    return dep;
                }));
            }
        });
        module.include = dedupArray(module.include.concat(normalizedDeps)).sort();
        module.include.forEach(function(depName) {
            console.log('    ' + depName);
        });
        console.log('\r\n');
    };
    singleModuleConfig.waitSeconds = 0; // Disable load timeout

    requirejs.optimize(
        singleModuleConfig,
        callback,
        function(err) {
            console.log(err);
            process.exit(1);
        }
    );
}

// Converts the necessary modules into a bundle configuration to be used by require.js at runtime.
// See: http://requirejs.org/docs/api.html#config-bundles
function addBundlesToRequireModule(module, allModules, transform) {
    console.log('Adding runtime bundle configuration...');
    // Ensure that the configuration objects we need to edit exist, without being destructive.
    module.override = module.override || {};
    module.override.wrap = module.override.wrap || { start: '', end: '' };

    var bundlesConfig = transform.modifyConfig('require({})', function() {
        var newConfig = { bundles: {} };
        allModules
            .filter(function(module) {
                return module.makeAvailableAtRuntime;
            })
            .forEach(function(module) {
                console.log('    ' + module.name);
                newConfig.bundles[module.name] = module.include;
            });

        return newConfig;
    });
    // Prepend the bundles configuration to the wrap.end, to avoid disrupting the symmetry of the existing start/end
    // (e.g. in case they are creating an IIFE)
    module.override.wrap.end = bundlesConfig + module.override.wrap.end;
    console.log('\r\n');
}

function appendPageModules(modules) {
    console.log('Processing the pages directory...');
    fs.readdirSync(PAGES_DIR).forEach(function(name) {
        // If another build profile with a matching name is found, then ignore this page file.
        // This handles the case of account.js, which is used as a standalone page without making use of any bundles.
        if (fs.existsSync(path.join(PROFILES_DIR, name))) {
            return;
        }
        console.log('    ' + name);
        var nameWithoutExtension = name.replace(JS_EXTENSION_RE, '');
        modules.push({
            name: 'build/' + nameWithoutExtension + 'page',
            create: true,
            include: ['pages/' + nameWithoutExtension],
            exclude: [COMMON_MODULE_NAME]
        });
    });
    console.log('\r\n');
}

function dedupArray(array) {
    var seen = {};
    return array.filter(function(item) {
        if (seen.hasOwnProperty(item)) {
            return false;
        }
        seen[item] = true;
        return true;
    });
}

function rmdirRecursiveSync(dir) {
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

// Jump through a few hoops to ask require.js for references to its util libraries,
// then call the main function with those references.
requirejs.tools.useLib(function(require) {
    require(['parse', 'transform', 'build', 'esprima'], function() {
        try {
            main.apply(null, arguments);
        }
        catch(e) {
            console.log(e);
            process.exit(1);
        }
    });
});
