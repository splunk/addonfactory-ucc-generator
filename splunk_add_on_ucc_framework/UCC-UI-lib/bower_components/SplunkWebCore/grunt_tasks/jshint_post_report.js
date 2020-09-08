var junit = require('./helpers/junit'),
    _ = require('lodash');

module.exports = function(grunt) {

    grunt.registerTask('jshintPostReport', 'Runs after jshint in reporting mode, merges all XML results to a single file', function() {
        var mergedOutputFilename = grunt.config(['jshint', 'options', 'mergedReporterOutput']);
        if(grunt.file.exists(mergedOutputFilename)) {
            grunt.file['delete'](mergedOutputFilename);
        }

        var doc = new junit.JUnitXMLDocument();
        _(grunt.config(['jshint'])).omit('options').each(function(targetConfig) {
            var outputFilename = targetConfig.options.reporterOutput;
            if(!_.isUndefined(outputFilename) && grunt.file.exists(outputFilename)) {
                var xmlContents = grunt.file.read(outputFilename);
                doc.mergeInXML(xmlContents);
                grunt.file['delete'](outputFilename);
            }
        });
        grunt.log.writeln('Merging XML files from JSHint runs...');
        grunt.file.write(mergedOutputFilename, doc.toString());
        grunt.log.writeln('>> Merged report "' + mergedOutputFilename + '" created.');
    });

};