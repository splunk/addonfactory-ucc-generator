module.exports = function(grunt) {
    'use strict';

    return {
        dev: ['build development version', [
            'buildTask:clean_before_build',
            'buildTask:copy',
            'buildTask:concat',
            'buildTask:patternReplace',
            'shell:webpack_dev',
            'shell:style'
        ]],
        "dev-watch": ['sync files to stage dir', [
            'buildTask:copy',
            'shell:webpack_dev'
        ]]
    };
};
