var path = require('path');
var fs = require('fs');
var util = require('util');
var constants = require('./constants');

function parsePassThruArgs(args) {
    var passThruArgs = [];
    if (args.watch) {
        passThruArgs.push('-w');
    }
    if (args.dev) {
        passThruArgs.push('-d');
    } else {
        // Default to production build if dev build not specified
        passThruArgs.push('-p');
    }
    if (args.liveReload) {
        passThruArgs.push('-r');
    }
    if (args.splunkVersion) {
        passThruArgs.push('--splunkVersion')
        passThruArgs.push(args.splunkVersion);
    }
    return passThruArgs;
}

function generateJsProfilesTasks(profilesDir, appName, args) {
    try {
        var passThruArgs = parsePassThruArgs(args);
        return fs.readdirSync(profilesDir)
            .filter(function(page) { return page.indexOf('config.js') > 0; })
            .map(function(profile) {
                var target = path.join(profilesDir, profile);
                var prefix = appName ? 'app-' + appName + ':' : '';
                var profileName = profile.replace('.config.js', '');
                var task = {
                    'name': prefix + profileName,
                    'src': path.join(profilesDir, profile),
                    'cmd': constants.nodeCmd,
                    'args': [path.join(__dirname, 'build.js'), target].concat(passThruArgs),
                    'weight': 2
                };
                if (profileName === 'splunkjs' || profileName === 'simplexml') {
                    task.deps = ['css:splunkjs'];
                }
                return task;
            });
    } catch (err) {
        if (err.code == 'ENOENT') {
            return [];
        } else {
            throw err;
        }
    }
}

function buildThemedLessTasks(lessTasks, themes) {
    var themedTasks = [];
    var baseLessArgs = [constants.lessCmd];
    Object.keys(lessTasks).forEach(function(key) {
        themes.forEach(function(theme) {
            var additional_args = ['--global-var=theme=' + theme];
            if (lessTasks[key].clean) {
                additional_args.push(constants.lessClean);
            }
            var dst = util.format(lessTasks[key].dst, theme);
            var paths = '--include-path=' + path.join(__dirname, '..','search_mrsparkle', 'exposed', 'less');
            themedTasks.unshift({
                'name': key + theme,
                'cmd': constants.nodeCmd,
                'src': lessTasks[key].src,
                'dst': dst,
                'args': baseLessArgs.concat(additional_args, constants.lessVar, paths, constants.$src, constants.$dst)
            });
        });
    });
    return themedTasks;
}

function buildSplunkJsCssTasks(themes) {
    var splunkJsCssDirTasks = {
        'css:dmc:indexer_clustering_status': {
            'src': path.join(constants.lessSource, 'components', 'bucket-bar-bootstrap.less'),
            'dst': path.join(process.env.SPLUNK_HOME, 'etc', 'apps', 'splunk_monitoring_console', 'appserver', 'static', 'bucket-bar%s.css'),
            'clean': true
        },
        'css:splunkjs:dashboard': {
            'src': path.join(constants.lessSource, 'pages', 'dashboard-lite', 'bootstrap.less'),
            'dst': path.join(constants.splunkJsCssDir, 'dashboard%s.css'),
            'clean': true
        },
        'css:splunkjs:bootstrap': {
            'src': constants.bootstrapLess,
            'dst': path.join(constants.splunkJsCssDir, 'bootstrap%s.css'),
            'clean': true
        }
    };
    return buildThemedLessTasks(splunkJsCssDirTasks, themes);
}

function buildCoreLessTasks(themes) {
    // Enterprise Build for core css since we need to add for both themese lite and enterprise AKA '
    var lessTasks = {
        'css:core:bootstrap': {
            'src': constants.bootstrapLess,
            'dst': path.join(constants.cssBuildDir, 'bootstrap%s.css'),
            'clean': false
        },
        'css:core:bootstrap-minify': {
            'src': constants.bootstrapLess,
            'dst': path.join(constants.cssBuildDir, 'bootstrap%s.min.css'),
            'clean': true
        },
        'css:legacy:splunk-components': {
            'src': path.join(constants.lessLegacySourceDir, 'splunk-components-bootstrap.less'),
            'dst': path.join(constants.cssBuildDir, 'splunk-components%s.css'),
            'clean': true
        }
    };
    return buildThemedLessTasks(lessTasks, themes);
}

function generateCoreLessPagesTasks(lessPagesSource, cssPagesDest, themes, appName) {
    themes = themes || [''];
    var lessTasks = [];
    //Add less pages from disk
    try {
        fs.readdirSync(lessPagesSource).forEach(function(file) {
            var src;
            var dst;
            var prefix;
            if (appName) {
                if (/\.less$/.test(file)) {
                    src = path.join(lessPagesSource, file);
                    dst = file.replace('.less', '%s.min.css');
                    prefix = 'app-' + appName ;
                }
            } else {
                src = path.join(lessPagesSource, file, 'bootstrap.less');
                dst = file + '-bootstrap%s.min.css';
                prefix = 'core';
            }
            if (src && dst && fs.existsSync(src)) {
                dst = path.join(cssPagesDest, dst);
                lessTasks['css:' + prefix + ':page-' + file] = {
                    'src': src,
                    'dst': dst,
                    'clean': true
                };
            }
        });

        return buildThemedLessTasks(lessTasks, themes);
    } catch (err) {
        if (err.code == 'ENOENT') {
            return [];
        } else {
            throw err
        }
    }
}

function buildLegacyCssTasks() {
    var tasks = [
        // less
        {
            'name': 'css:legacy:lite',
            'cmd': constants.nodeCmd,
            'src': path.join(constants.lessLegacySourceDir, 'lite.less'),
            'dst': path.join(constants.cssDir, 'lite.css'),
            'args': [constants.lessCmd, '--global-var=theme=-lite', constants.lessVar, constants.$src, constants.$dst]
        },
        {
            'name': 'css:legacy:advanced-xml',
            'cmd': constants.nodeCmd,
            'src': path.join(constants.lessLegacySourceDir, 'skins', 'default', 'default.less'),
            'dst': path.join(constants.cssDir, 'skins', 'default', 'default.css'),
            'args': [constants.lessCmd, '--global-var=theme=', constants.lessVar, constants.$src, constants.$dst]
        },
        {
            'name': 'css:legacy:escaped-dashboards-bootstrap',
            'cmd': constants.nodeCmd,
            'src': constants.bootstrapLess,
            'dst': path.join(constants.cssDir, 'bootstrap.min.css'),
            'args': [constants.lessCmd, constants.lessClean, '--global-var=theme=', constants.lessVar, constants.$src, constants.$dst]
        },
        {
            'name': 'css:legacy:escaped-dashboards-page',
            'cmd': constants.nodeCmd,
            'src': path.join(constants.lessSource, 'pages', 'dashboard-simple', 'bootstrap.less'),
            'dst': path.join(constants.cssDir, 'pages', 'dashboard-simple-bootstrap.min.css'),
            'args': [constants.lessCmd, constants.lessClean, '--global-var=theme=', constants.lessVar, constants.$src, constants.$dst]
        }
    ];

    //Add  profiles from disk
    fs.readdirSync(constants.lessLegacySourceDir).forEach(function(file) {
        if (file.slice(-5) === '.less' && file !== 'bootstrap.less' && file !== 'lite.less') {
            var name = file.slice(0, -5);
            var src = path.join(constants.lessLegacySourceDir, file);
            var dst = path.join(constants.cssDir, name + '.css');
            tasks.unshift({
                'name': 'css:legacy:' + name,
                'cmd': constants.nodeCmd,
                'src': src,
                'dst': dst,
                'args': [constants.lessCmd, '--global-var=theme=', constants.lessVar, constants.$src, constants.$dst],
            });
        }
    });

    return tasks;
}

module.exports = {
    generateJsProfilesTasks: generateJsProfilesTasks,
    generateCoreLessPagesTasks: generateCoreLessPagesTasks,
    buildSplunkJsCssTasks: buildSplunkJsCssTasks,
    buildCoreLessTasks: buildCoreLessTasks,
    buildLegacyCssTasks: buildLegacyCssTasks
};
