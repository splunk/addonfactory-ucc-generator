module.exports = function(grunt) {
    return {
        dashboard: {
            files: ['package/default/data/ui/**/*.xml', 'package/default/data/ui/nav/default.xml'],
            tasks: ['copy:all', 'http:reload'],
            options: {
                spawn: false
            }
        },
        python: {
            files: ['package/bin/**/*.py'],
            tasks: ['copy:all'],
            options: {
                spawn: false
            }
        },
        config: {
            files: ['package/default/*.conf'],
            tasks: ['copy:all', 'http:reload'],
            options: {
                spawn: false
            }
        },
        css: {
            files: ['package/appserver/static/css/*.css'],
            tasks: ['shell:style'],
            options: {
                spawn: false
            }
        }
    };
};
