define(function(require) {
    return {
        'underscore': require('underscore'),
        'splunk/mapping2/PdfMapRenderer': require('splunk/mapping2/PdfMapRenderer'),
        'splunk/mapping2/LatLon': require('splunk/mapping/LatLon'),
        'splunk/mapping2/LatLonBounds': require('splunk/mapping/LatLonBounds'),
        'splunk/mapping/layers/VectorLayerBase': require('splunk/mapping2/layers/DummyLeafletVectorLayerBase')
   };
});
