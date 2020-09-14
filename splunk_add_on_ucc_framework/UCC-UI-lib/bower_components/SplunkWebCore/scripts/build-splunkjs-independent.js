// Builds SplunkJS independent mode. Replaces cmake/splunkjs_build/independent.sh.
//
// The following build paths are read from web/build_tools/constants.js:
//
//   Output directory - web/search_mrsparkle/exposed/build/splunkjs_independent
//   Webpack profile file/directory - web/build_tools/profiles/standalone/splunkjs_independent(.config.js)
//   Assets (readme, license, ...) directory - web/splunkjs_independent/assets
//
// Note that this script is only responsible for invoking the build and packaging artifacts - the
//   actual building is handled by the main webpack build pipeline (web/build_tools/build.js).
//
// What this does in detail:
//   1) Clean output directory
//   2) Copy the readme and other package assets to the output path directory
//   3) Build production versions of css_splunkjs.config.js, css_base_enterprise.config.js and splunkjs_independent.config.js
//   4) Copy fonts, images, and other build-specific assets, apply CSS fixes
//   5) Move the production files to a separate directory
//   6) Repeat step 3 and 4 in developer mode
//
// IMPORTANT: Make sure there's no local webpack config (dev.local.config.js) influencing the build!
//   This script uses the development output (-d) for the 'non-minified' version.

'use strict';

var _ = require('lodash');
var constants = require('../build_tools/constants');
var child = require('child_process');
var fs = require('fs-extra');
var path = require('path');

var SPLUNKJS_INDEPENDENT_VERSION_NUMBER = 1.3;

console.log('Building SplunkJS independent mode, version', SPLUNKJS_INDEPENDENT_VERSION_NUMBER, '\n');
console.log('Node command:', constants.nodeCmd);
console.log('Profile directory:', constants.splunkJsIndependentProfileDir);
console.log('Assets directory:', constants.splunkJsIndependentAssetsDir);
console.log('Output directory:', constants.splunkJsIndependentDestDir, '\n');

var copyCss = [
    {
        from: path.join(constants.jsBuildDir, 'css', 'bootstrap-enterprise.css'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'css', 'bootstrap.css')
    }, {
        from: path.join(constants.jsBuildDir, 'css', 'splunkjs-dashboard.css'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'css', 'dashboard.css')
    }
];

var copyBuild = [
    //fonts
    {
        from: path.join(constants.webBuildDir, 'search_mrsparkle', 'exposed', 'fonts'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'fonts')
    },
    //images
    {
        from: path.join(constants.webBuildDir, 'search_mrsparkle', 'exposed', 'img', 'skins'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'img', 'skins')
    }, {
        from: path.join(constants.webBuildDir, 'search_mrsparkle', 'exposed', 'img', 'splunk'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'img', 'splunk')
    },
    //js contrib (ace editor)
    {
        from: path.join(constants.jsDir, 'contrib', 'ace-editor', 'mode-spl.js'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'js', 'contrib', 'ace-editor', 'mode-spl.js')
    }, {
        from: path.join(constants.jsDir, 'contrib', 'ace-editor', 'ext-spl_tools.js'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'js', 'contrib', 'ace-editor', 'ext-spl_tools.js')
    }, {
        from: path.join(constants.jsDir, 'contrib', 'ace-editor', 'ext-language_tools.js'),
        to: path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs', 'js', 'contrib', 'ace-editor', 'ext-language_tools.js')
    }
].concat(copyCss);

var copyPackage = [
    //license
    {
        from: path.join(constants.splunkJsIndependentAssetsDir, 'LICENSE.md'),
        to: path.join(constants.splunkJsIndependentDestDir, 'LICENSE.md')
    }
    //readme is generated from a template
];

function cssAndJs(mode) {
    return Promise
        .all([
            exec('build_tools/build build_tools/profiles/css_splunkjs.config.js ' + mode),
            exec('build_tools/build build_tools/profiles/css_base_enterprise.config.js ' + mode)
        ])
        .then(function () {
            return Promise.all(
                copy(copyBuild).concat(
                    exec('build_tools/build ' + constants.splunkJsIndependentProfileDir + '.config.js ' + mode)));
        })
        .then(function () {
            return fixCss();
        });
}

function fixCss() {
    return Promise.all(_(copyCss).map('to').each(function (css) {
        return new Promise(function (f) {
            console.log('Fixing CSS', css);

            var contents = fs.readFileSync(css, {encoding: 'utf8'});
            contents = contents.replace(/\/static\//g, '../');
            fs.writeFileSync(css, contents);
            f();
        });
    }));
}

function exec(command) {
    return new Promise(function (f, r) {
        var fullCommand = [constants.nodeCmd, command].join(' ');
        console.log('Running', fullCommand);

        var proc = child.exec(fullCommand, {maxBuffer: 1000 * 1024}, function (error) {
            error ? r(error) : f();
        });
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
    });
}

function readme() {
    return new Promise(function (f, r) {
        console.log('Generating readme.md');

        var readmePath = path.join(constants.splunkJsIndependentAssetsDir, 'readme.md.tmpl');
        var readme = fs.readFileSync(readmePath, {encoding: 'utf8'});
        readme = _.template(readme)({VERSION_NUMBER: SPLUNKJS_INDEPENDENT_VERSION_NUMBER});
        fs.writeFileSync(path.join(constants.splunkJsIndependentDestDir, path.basename(readmePath, '.tmpl')), readme);
        f();
    });
}

function copy(items) {
    return _.map(items, function (c) {
        return new Promise(function (f, r) {
            console.log('Copying\n', '  from ' + c.from + '\n', '  to ' + c.to);
            fs.copy(c.from, c.to, function (error) {
                error ? r(error) : f();
            });
        });
    });
}


Promise.resolve()
    .then(function () {
        return new Promise(function (f, r) {
            console.log('Cleaning output directory');

            fs.emptyDir(constants.splunkJsIndependentDestDir, function (error) {
                error ? r(error) : f();
            });
        });
    })
    .then(function () {
        return Promise
            .all([
                readme(),
                copy(copyPackage),
                cssAndJs('-p')
            ]);
    })
    .then(function () {
        return new Promise(function (f, r) {
            var from = path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs');
            var to = path.join(constants.splunkJsIndependentDestDir, 'static', 'splunkjs.min');
            console.log('Moving production build\n', '  from ' + from + '\n', '  to ' + to);

            fs.move(from, to, function (error) {
                error ? r(error) : f();
            });
        });
    })
    .then(function () {
        return cssAndJs('-d');
    })
    .then(function () {
        console.log('All done - now zip it, zip it good');
    })
    .catch(function (err) {
        console.error('Error :(', err);
    });

