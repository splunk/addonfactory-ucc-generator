module.exports = function(grunt) {
    'use strict';

    return {
        dev: ['build development version', [
            'buildTask:clean_before_build',
            'buildTask:copy',
            'buildTask:concat',
            'buildTask:patternReplace',
            'shell:style',
            'webpack:dev'
        ]]
    };
};
