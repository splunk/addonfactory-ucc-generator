module.exports = function() {
    return {
        style: {
            command: [
                'node bower_components/SplunkWebCore/build_tools/build.js style.config.js',
                'node bower_components/SplunkWebCore/build_tools/build.js style.lite.config.js'
            ].join(' && ')
        }
    };
};
