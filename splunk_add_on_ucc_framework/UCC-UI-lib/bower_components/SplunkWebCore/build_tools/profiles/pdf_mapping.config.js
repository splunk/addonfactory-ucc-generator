var path = require('path');
var webpack = require('webpack');
var mergeConfigs = require('../util/mergeConfigs');
var sharedConfig = require('./common/shared.config');

var entryPath = path.join(process.env.SPLUNK_SOURCE, 'web', 'build_tools', 'profiles', 'pdf_mapping', 'index.js');

module.exports = mergeConfigs(sharedConfig, {
    output: {
        path: path.join(process.env.SPLUNK_SOURCE, 'web', 'search_mrsparkle', 'exposed', 'build', 'pdf_mapping'),
        filename: '[name].js',
        sourceMapFilename: '[file].map'
    },
    entry: {
        index: entryPath
    },
    resolve: {
        alias: {
            'splunk/mapping2/LatLon': 'splunk/mapping/LatLon',
            'splunk/mapping2/LatLonBounds': 'splunk/mapping/LatLonBounds',
            'splunk/mapping/layers/VectorLayerBase': 'splunk/mapping2/layers/DummyLeafletVectorLayerBase'
        }
    }
});
