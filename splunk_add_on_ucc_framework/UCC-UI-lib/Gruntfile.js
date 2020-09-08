module.exports = function(grunt) {
    'use strict';

    var buildinfo = grunt.file.readJSON('build.json');
    buildinfo.buildNumber = process.env['BUILDNUMBER'] || 0;

    require('ext-grunt-horde')
        .create(grunt)
        .demand('initConfig.buildinfo', buildinfo)
        .loot('ext-grunt-basebuild')
        .loot('./config/grunt')
        .attack();
};
