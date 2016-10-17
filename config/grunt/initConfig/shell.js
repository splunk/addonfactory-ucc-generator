module.exports = function(grunt) {
    return {
        // webpack: {
        //     command: 'node bower_components/SplunkWebCore/build_tools/build.js build.config.js'
        // },
        // webpack_dev: {
        //     command: 'node bower_components/SplunkWebCore/build_tools/build.js build.config.dev.js -d'
        // },
        style: {
            command: 'node bower_components/SplunkWebCore/build_tools/build.js style.config.js'
        },
        fortify: {
            command: '/usr/bin/fortify-scanner.py'
        }
    };
};
