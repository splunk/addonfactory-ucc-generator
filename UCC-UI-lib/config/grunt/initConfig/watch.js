module.exports = function() {
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
