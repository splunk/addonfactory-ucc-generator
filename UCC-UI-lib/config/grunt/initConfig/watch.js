module.exports = function(grunt) {
    return {
        css: {
            files: ['package/appserver/static/css/*.css'],
            tasks: ['shell:style'],
            options: {
                spawn: false
            }
        }
    };
};
