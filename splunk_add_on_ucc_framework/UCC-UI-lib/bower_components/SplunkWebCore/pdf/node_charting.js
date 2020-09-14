var jsdom = require('jsdom'),
    i18n = require('./i18n'),
    __script_basepath = "file:///" + __dirname + "/httpdocs/static/js/",
    __font_basepath = "file:///" + __dirname + "/";

PDFDocument = require('pdfkit');
fs = require('fs');

function createChartingWindow(locale, scriptBasepath, callback) {

    jsdom.env({
        html: "<html><head></head><body><div id='container'></div></body></html>",
        src: [
            fs.readFileSync(scriptBasepath + "contrib/jquery-2.1.0.min.js").toString(),

            fs.readFileSync(scriptBasepath + "contrib/json2.js").toString(),
            fs.readFileSync(scriptBasepath + "i18n.js").toString(),

            // Prepare i18n since we didn't load it from splunk web: hard-code locale data for en_US
	        'window._i18n_locale=' + JSON.stringify(i18n.getLocaleData(locale)) + ';',
	        'window.locale_name = function() { return "' + locale + '"; };',
            'window.locale_uses_day_before_month = function() { return false; };',

            fs.readFileSync(scriptBasepath + "splunk.js").toString(),
            fs.readFileSync(scriptBasepath + "util.js").toString(),
            fs.readFileSync(scriptBasepath + "logger.js").toString(),
            fs.readFileSync(scriptBasepath + "../build/jscharting/index.js").toString(),

	    // The jsdom does have a createElementNS method but it's not functional enough to
	    // convince HighCharts that the 'DOM window' supports SVG.  We replace it with a bare
	    // minimum implementation to fool Highcharts, then we will add more sophisticated handling
	    // later in the 'done' callback.  We also store a reference to the built-in createElementNS
	    // method so we can make use of it later.
	    'window.document._createElementNS = window.document.createElementNS;',
            'window.document.createElementNS = function() { return { createSVGRect: true }; };',

        ],
        done: function(err, window) {
            if(err) {
                callback(err, null);
                return;
            }

            // Set up a good mock implementation for creating elements and later getting their bounding box
            window.document.createElementNS = function(ns, tagName) {
		var elem = window.document._createElementNS(ns, tagName);
                elem.getBBox = function() {
                    if (this.textContent) {
                        var doc = new PDFDocument(),
                            fontSize = parseInt(window.getComputedStyle(elem, null).getPropertyValue("font-size"), 10),
                            font = doc.font('Helvetica', fontSize),
                            // Multi-line labels are implemented using a <tspan> element for each line.
                            // Count the number of <tspan>s to determin the number of lines, or assume one line if no <tspans>.
                            numLines = Math.max(this.querySelectorAll('tspan').length, 1);

                        if(!fontSize) {
                            window.console.log('ERROR: In getBBox, element has no font size');
                            // To track down the log statement above, un-comment this throw and comment out the try-catch around getBBox in Highcarts
                            // throw new Error('In getBBox, element has no font size');
                        }
                        return ({
                            x: elem.offsetLeft,
                            y: elem.offsetTop,
                            // need to compute max width per line
                            width: font.widthOfString(this.textContent),
                            height: font.currentLineHeight() + (numLines - 1) * font.currentLineHeight(true)
                        });
                    }
                    return ({
                        x: elem.offsetLeft || 0,
                        y: elem.offsetTop || 0,
                        width: elem.offsetWidth || 0,
                        height: elem.offsetHeight || 0
                    });

                };
                elem.createSVGRect = function() {};
                return elem;
            };

            // Set up mock console logging
            var mockConsole = {
                log: function() {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },
                warn: function() {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },
                debug: function() {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },
                error: function() {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },

                messages: [],
                addMessage: function(args) {
                    var i, strSegments = [];
                    for(i = 0; i < arguments.length; i++) {
                        strSegments.push(arguments[i]);
                    }
                    mockConsole.messages.push('JSDOM CONSOLE: ' + strSegments.join(' '));
                }
            };
            window.console = mockConsole;

            callback(null, window);
        }
    });
}

function getSVG(data, scriptBasepath, callback) {
    if(scriptBasepath === null || scriptBasepath === undefined) {
        scriptBasepath = __script_basepath;
    }

    createChartingWindow(data.locale, scriptBasepath, function (err, window) {
        if(err) {
            callback(err, null);
        }
        else {
            var $ = window.$;
            var Splunk = window.Splunk;
            var $container = $('#container');

            var getConsoleMessages = function() {
                if(window.console.messages && window.console.messages.length > 0) {
                    return window.console.messages;
                }
                return null;
            };

            var chartData = Splunk.JSCharting.extractChartReadyData(data.series);
            // Unfortunately, a little bit of duplication of what happens in util/jscharting_utils.
            // If the data contains '_tc' - and indication of the 'top' or 'rare' commands - suppress the 'percent' field
            // (SPL-79265)
            if(chartData.hasField('_tc')) {
                data.props.fieldHideList = ['percent'];
            }
            $container.width(parseInt(data.width, 10)).height(parseInt(data.height, 10));
            try {
                var chart = Splunk.JSCharting.createChart($container[0], data.props);

                chart.prepareAndDraw(chartData, data.props, function() {
                    var svg = chart.getSVG();
                    // un-comment this next line to pretty-print the SVG to python.log
                    //throw new Error(svg.replace(/>/g, ">\n"));

                    callback({ consoleMessages: getConsoleMessages() }, svg);
                });
            }
            catch(err) {
                console.log('exception in js_charting::getSVG' + JSON.stringify(err));
                var fullError = {
                    consoleMessages: getConsoleMessages(),
                    message: err
                };
                callback(fullError, null);
            }
        }
    });
}

exports.getSVG = getSVG;
