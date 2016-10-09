module.exports = function(grunt) {
    'use strict';

    return {
        dev: ['build development version', [
            'buildTask:clean_before_build',
            'buildTask:copy',
            'buildTask:concat',
            'buildTask:patternReplace',
            'webpack:dev',
            'shell:style'
        ]],
        "dev-watch": ['sync files to stage dir', [
            'buildTask:copy',
            'webpack:dev'
        ]]
    };
};
