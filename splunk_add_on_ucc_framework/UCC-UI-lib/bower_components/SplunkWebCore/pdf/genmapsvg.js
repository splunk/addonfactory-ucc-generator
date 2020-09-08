// Script that generates an SVG file using the Splunk mapping library
// exit codes: 0 on success, 1 on error
// stdin: JSON representation of map data
/* Example data:
{
    "width": 800,
    "height": 400,
    "props": {
        "data.bounds": "(-90,-180,90,180)"
    },
    "series": {
        "fields": [ "lat", "lon", "mag" ],
        "columns": [
            [ 37.79, 37.75, 37.76 ],
            [ -122.40, -122.35, -122.45 ],
            [ 1, 3, 2 ]
        ]
    }
}
*/

// stdout: SVG data
// stderr: debugging/error information

var fs = require('fs');

function debugPrintObject(name, object) {
    process.stderr.write(name + ': ' + JSON.stringify(object));
}

// writeAndFlush
// -------------
// this is necessary since writing to a stream is asynchronous in node
var writeAndFlush = function(data, stream) {
    if (!Buffer.isBuffer(data)) {
        data = new Buffer(''+ data);
    }
    if (data.length) {
        var written = 0;
        do {
            try {
                var len = data.length - written;
                written += fs.writeSync(stream.fd, data, written, len, -1);
            }
            catch (e) {
                // the only exception here should be like bufferFull, so we want to keep looping
            }
        } while(written < data.length);
    }
};

function processMapData(data, outStream) {
    var nodeMapping = require('./node_mapping');
    var staticBasepath = process.env.SPLUNK_HOME + '/share/splunk/search_mrsparkle/exposed/';
    nodeMapping.getSVG(data, staticBasepath, function(err, svg) {
        if (err && err.consoleMessages && err.consoleMessages.length > 0) {
            writeAndFlush('\n' + err.consoleMessages.join('\n') + '\n', process.stderr);
        }
        if (svg === undefined || svg === null || svg.length === 0) {
            writeAndFlush("getSVG error: " + (err.message || ''), process.stderr);
            process.exit(1);
        }
        else {
            writeAndFlush(svg, outStream);
            process.exit(0);
        }
    });
}

var stdin = process.openStdin(),
    data = '';
stdin.setEncoding('utf8');

// data starts as an empty string, we append each chunk, then when we have the whole string we parse and
// hand it off to processMapData

stdin.on('data', function(chunk) {
    data += chunk;
});

stdin.on('end', function() {
    processMapData(JSON.parse(data), process.stdout);
});
