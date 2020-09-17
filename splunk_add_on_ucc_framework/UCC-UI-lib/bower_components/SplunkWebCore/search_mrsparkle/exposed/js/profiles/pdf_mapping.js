//splunk cmd node $SPLUNK_HOME/lib/node_modules/requirejs/bin/r.js -o pdf_mapping.js
({
    mainConfigFile: './shared.js',
    out: '../build/pdf_mapping.js',
    name: 'contrib/almond',
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    include: [
        'runtime_map',
        'splunk/mapping2/PdfMapRenderer'
    ],
    wrap: {
        start: '',
        end: 'require("runtime_map");'
    },
    map: {
        '*': {
            'splunk/mapping2/LatLon': 'splunk/mapping/LatLon',
            'splunk/mapping2/LatLonBounds': 'splunk/mapping/LatLonBounds',
            'splunk/mapping/layers/VectorLayerBase': 'splunk/mapping2/layers/DummyLeafletVectorLayerBase'
        }
    },
    rawText: {
        'runtime_map': '\
            define([], function() {\
                requirejs.config({\
                    map: {\
                        "*": { \
                            "splunk/mapping2/LatLon": "splunk/mapping/LatLon", \
                            "splunk/mapping2/LatLonBounds": "splunk/mapping/LatLonBounds",\
                            "splunk/mapping/layers/VectorLayerBase": "splunk/mapping2/layers/DummyLeafletVectorLayerBase" \
                        }\
                    }\
                });\
            });\
        '
    }
})