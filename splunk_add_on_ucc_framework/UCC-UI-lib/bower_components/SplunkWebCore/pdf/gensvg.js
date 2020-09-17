// Script that generates an SVG file using the Splunk JSCharting library
// exit codes: 0 on success, 1 on error
// stdin: JSON representation of chart data
/* Example data:
{
    "props":  {
        "chart":    "line"
    },
    "series": {
		"fields": ["x", "y"],
		"columns": [[1, 2, 3, 4, 5],
					[1, 4, 9, 16, 25]]
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
		data= new Buffer(''+ data);
	}
	if (data.length) {
		var written= 0;
		do {
			try {
				var len = data.length- written;
				written += fs.writeSync(stream.fd, data, written, len, -1);
			}
			catch (e) {
				// the only exception here should be like bufferFull, so we want to keep looping
			}
		} while(written < data.length);  
	}
};

function processChartData(data, outStream) {
	var nodeCharting = require('./node_charting');
	var scriptBasepath = process.env.SPLUNK_HOME + '/share/splunk/search_mrsparkle/exposed/js/';
	nodeCharting.getSVG(data, scriptBasepath, function(err, svg) {
        if(err && err.consoleMessages && err.consoleMessages.length > 0) {
            writeAndFlush('\n' + err.consoleMessages.join('\n') + '\n', process.stderr);
        }
		if(svg === undefined || svg === null || svg.length === 0) {
            var errorMsg = err.message ?
                [err.message.toString(), (err.message.fileName || ''), (err.message.lineNumber || '')].join(' ') :
                '';
			writeAndFlush("getSVG error: " + errorMsg, process.stderr);
                        if(err.message.stack) {
                            writeAndFlush("\nStack trace: " + err.message.stack, process.stderr);
                        }
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
// hand it off to processChartData

stdin.on('data', function(chunk) {
	data += chunk;
});

stdin.on('end', function() {
    var dataObj = null;
    try {
        dataObj = JSON.parse(data);
    }
    catch (e) {
        writeAndFlush("gensvg args are invalid JSON. data='" + data + "' error='" + e + "'", process.stderr);
        process.exit(1);
    }

    processChartData(dataObj, process.stdout);
});

