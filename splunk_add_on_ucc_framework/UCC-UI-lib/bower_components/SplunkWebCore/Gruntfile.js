module.exports = function (grunt) {
    var splunk = require('./grunt_tasks/helpers/splunk').init(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {},
        symlink: {}
    });

    // JSHint
    // ------------------------------------------------

    grunt.config(['jshint'], {
        options: {
            force: true
        },
        "postAce": {
            options: {
                jshintrc: splunk.source('web', '.jshintrc')
            },
            files: {
                src: [
                    splunk.jsSource('**/*.js'),
                    "!" + splunk.jsSource('*.js'),
                    '!' + splunk.jsSource('build/**/*'),
                    '!' + splunk.jsSource('contrib', '**/*'),
                    '!' + splunk.jsSource('profiles', '**/*'),
                    '!' + splunk.jsSource('splunkjs', 'contrib', '**/*'),
                    '!' + splunk.jsSource('splunkjs', 'splunk.js'),
                    '!' + splunk.jsSource('splunkjs', 'splunk.min.js'),
                    '!' + splunk.jsSource('splunkjs', 'splunk.ui.charting.min.js'),
                    '!' + splunk.jsSource('splunkjs', 'splunk.ui.timeline.min.js'),
                    '!' + splunk.jsSource('splunkjs', 'mvc', 'dashboard', 'gridster', '**/*'),
                    '!' + splunk.jsSource('splunkjs', 'mvc', 'eventtable', 'jquery.dragdrop.js')
                ]
            }
        },
        "preBubbles": {
            options: {
                jshintrc: splunk.source('web', '.jshintrc_pre_bubbles')
            },
            files: {
                src: [
                    splunk.jsSource('*.js'),
                    '!' + splunk.jsSource('jquery.sparkline.js')
                ]
            }
        },
        "dmc": {
            options: {
                jshintrc: splunk.source('web', '.jshintrc')
            },
            files: {
                src: [
                    splunk.source('cfg', 'bundles', 'splunk_monitoring_console', 'appserver', 'static', '**/*.js'),
                    "!" + splunk.source('cfg', 'bundles', 'splunk_monitoring_console', 'appserver', 'static', 'build', '**/*')
                ]
            }
        }
    });

    grunt.registerTask('jshintAndReport', 'Runs the JSHint task and stores JUnit XML output', function () {
        grunt.config(['jshint', 'options', 'reporter'], './grunt_reporters/jshint-junit-reporter');
        grunt.config(['jshint', 'options', 'mergedReporterOutput'], 'jshint.xml');
        grunt.config(['jshint', 'postAce', 'options', 'reporterOutput'], "junit-output-post-ace.xml");
        grunt.config(['jshint', 'preBubbles', 'options', 'reporterOutput'], "junit-output-pre-bubbles.xml");
        grunt.config(['jshint', 'dmc', 'options', 'reporterOutput'], "junit-output-dmc.xml");
        grunt.task.run('jshint', 'jshintPostReport');
    });

    // External tasks
    // ---------------------------------------------------------

    // load contrib tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // load local tasks
    grunt.loadTasks('./grunt_tasks');

    // ensure proper bold function for jshint (SPL-112075, karma-runner/karma #1800)
    require('colors');
};
