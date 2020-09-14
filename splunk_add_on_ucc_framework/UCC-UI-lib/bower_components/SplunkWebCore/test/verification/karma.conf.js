var karmaConf = require('../karma.conf');

// this config file is intended for testing the test infrastructure
//
// start with our default karma configuration and:
// - override base path (account for the additional subdirectory)
// - override app directory (point karma to our fake test app structure)
// - activate coverage tests only if coverage is enabled (--coverage)
module.exports = function (config) {

    karmaConf.configFactory({
        basePath: process.env.SPLUNK_SOURCE,
        appPath: 'web/test/verification/apps'
    })(config);

    if (config.coverage !== true) {
        config.exclude.push('**/es6ftw/**/test_coverage*');
    }
}