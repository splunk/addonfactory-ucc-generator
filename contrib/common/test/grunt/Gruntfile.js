var os = require('os'),
    path = require('path');

module.exports = function(grunt) {

   var apps = require('./grunt_tasks/helpers/apps').init(grunt);

   grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

   // JSHint
    // ------------------------------------------------

    grunt.config(['jshint'], {
        options: {
            force: true
        },
        "TA-opseclea": {
            options: {
                jshintrc: apps.ta_opsecleaSource('.jshintrc')
            },
            files: {
                src: [
                    apps.ta_opsecleaSource('**/*.js'),
                    "!" + apps.ta_opsecleaSource('lib', '**/*'),
                    "!" + apps.ta_opsecleaSource('profiles', '**/*')
                ]
            }
        }
    });

    grunt.registerTask('jshintAndReport', 'Runs the JSHint task and stores JUnit XML output', function() {
        grunt.config(['jshint', 'options', 'reporter'], './grunt_reporters/jshint-junit-reporter');
        grunt.config(['jshint', 'options', 'mergedReporterOutput'], 'jshint.xml');
        grunt.config(['jshint', 'TA-opseclea', 'options', 'reporterOutput'], "junit-output-TA-opseclea.xml");
        grunt.task.run('jshint', 'jshintPostReport');
    });

   // load contrib tasks
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // load local tasks
    grunt.loadTasks('./grunt_tasks');

};
