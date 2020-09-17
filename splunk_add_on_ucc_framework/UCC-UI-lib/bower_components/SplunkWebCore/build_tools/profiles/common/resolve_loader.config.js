var path = require('path');
module.exports = {
    resolveLoader: {
        modulesDirectories: [
            // Path to custom loaders
            path.resolve(__dirname, '../../web_loaders'),
            path.resolve(__dirname, '../../../node_modules'),
            path.join(process.env.SPLUNK_HOME || '', 'lib', 'node_modules'),
            'node_modules'
        ]
    }
};
