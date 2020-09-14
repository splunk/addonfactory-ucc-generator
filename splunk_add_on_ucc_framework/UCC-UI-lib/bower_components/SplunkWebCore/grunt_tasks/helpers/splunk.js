var path = require('path');

exports.init = function(grunt) {

    exports.home = function() {
        var pathParts = [process.env.SPLUNK_HOME].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };

    exports.source = function() {
        var pathParts = [process.env.SPLUNK_SOURCE].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };

    exports.jsSource = function() {
        var pathParts = [exports.source('web', 'search_mrsparkle', 'exposed', 'js')].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };

    exports.cssSource = function() {
        var pathParts = [exports.source('web', 'search_mrsparkle', 'exposed', 'css')].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };
    
    exports.lessSource = function() {
        var pathParts = [exports.source('web', 'search_mrsparkle', 'exposed', 'less')].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };

    exports.frameworkSource = function() {        
        var pathParts = [exports.source('cfg', 'bundles', 'framework')].concat(grunt.util.toArray(arguments));
        return path.join.apply(path, pathParts);
    };
    
    exports.splunkjsTestApp = function() {
        return 'testfx2';
    };

    exports.spawn = function(options, doneFunction) {
        options = options || {};
        options.cmd = exports.home('bin', 'splunk');
        return grunt.util.spawn(options, doneFunction);
    };

    var jsBuildProfilesDir = exports.jsSource('profiles');

    exports.getJsBuildTargets = function() {
        var targets = [];
        grunt.file.recurse(jsBuildProfilesDir, function(abspath, rootDir, subdir, filename) {
            if(filename.indexOf('shared') === -1) {
                var fragment = filename.split('.js')[0];
                targets.push(subdir ? path.join(subdir, fragment) : fragment);
            }
        });
        return targets;
    };

    var lessPagesDir = exports.lessSource('pages');

    exports.getLessBuildTargets = function() {
        var targets = [];
        grunt.file.recurse(lessPagesDir, function(abspath, rootdir, subdir, filename) {
            if(filename.indexOf('-bootstrap.less') > -1) {
                var fragment = filename.split('-bootstrap.less')[0];
                targets.push(subdir ? path.join(subdir, fragment) : fragment);
            }
        });
        return targets;
    };

    // reads the build config from the filepath, normalizes any relative file paths using rootDir (or jsBuildProfilesDir)
    // TODO [sff] find a way to do this without eval
    var getNormalizedBuildConfig = function(filepath, rootDir) {
        rootDir = rootDir || jsBuildProfilesDir;

        var normalizePath = function(relativePath) {
            return path.join(rootDir, relativePath);
        };

        var buildConfig,
            fileContents = grunt.file.read(filepath).replace(/require\.config/, '');

        eval('buildConfig = ' + fileContents);
        // normalize "baseUrl", "mainConfigFile", and "out" into absolute paths
        grunt.util._.forEach(['baseUrl', 'mainConfigFile', 'out'], function(propName) {
            if(buildConfig[propName] && !grunt.file.isPathAbsolute(buildConfig[propName])) {
                buildConfig[propName] = normalizePath(buildConfig[propName]);
            }
        });
        // also need to normalize wrap.startFile and wrap.endFile if they exist
        if(buildConfig.wrap) {
            var wrap = buildConfig.wrap;
            grunt.util._.forEach(['startFile', 'endFile'], function(propName) {
                if(wrap[propName] && !grunt.file.isPathAbsolute(wrap[propName])) {
                    if(grunt.util.kindOf(wrap[propName]) === 'array') {
                        wrap[propName] = grunt.util._.map(wrap[propName], normalizePath);
                    }
                    else {
                        wrap[propName] = normalizePath(wrap[propName]);
                    }
                }
            });
        }
        return buildConfig;
    };

    exports.getBuildConfig = function(profileName) {
        var buildConfig = getNormalizedBuildConfig(path.join(jsBuildProfilesDir, profileName + '.js')),
            sharedConfig = buildConfig.hasOwnProperty('mainConfigFile') ?
                           getNormalizedBuildConfig(buildConfig.mainConfigFile) : {};

        return grunt.util._.merge({}, sharedConfig, buildConfig);
    };

    return exports;
};

/*

    var splunk = require('grunt_helpers/grunt-splunk').init(grunt);

    grunt.registerTask('splunk', '', function(methodName) {
        if(methodName === 'home') {
            grunt.log.writeln(splunk.home('share', 'splunk'));
        }
        else if(methodName === 'source') {
            grunt.log.writeln(splunk.source('web', 'search_mrsparkle'));
        }
        else if(methodName === 'jsSource') {
            grunt.log.writeln(splunk.jsSource('views', 'shared'));
        }
        else if(methodName === 'spawn') {
            var done = this.async();
            splunk.spawn({ args: ['restartss'], opts: { stdio: 'inherit' } }, function() {
                done();
            });
        }
    });

*/
