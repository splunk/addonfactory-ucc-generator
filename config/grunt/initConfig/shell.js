module.exports = function(grunt) {
    return {
        style: {
            command: 'node bower_components/SplunkWebCore/build_tools/build.js style.config.js'
        },
        fortify: {
            command: '/usr/bin/fortify-scanner.py'
        }
    };
};
