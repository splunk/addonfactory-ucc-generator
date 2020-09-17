var fs = require('fs'),
    jsdom = require('jsdom'),
    PDFDocument = require('pdfkit');

function createMappingWindow(staticBasepath, callback) {
    jsdom.env({
        html: "<html><head></head><body></body></html>",
        src: [
            // Prepare i18n since we didn't load it from splunk web: hard-code locale data for en_US
            'window._i18n_locale={"date_formats": {"medium": {"pattern": "MMM d, yyyy", "format": "%(MMM)s %(d)s, %(yyyy)s"}, "full": {"pattern": "EEEE, MMMM d, yyyy", "format": "%(EEEE)s, %(MMMM)s %(d)s, %(yyyy)s"}, "long": {"pattern": "MMMM d, yyyy", "format": "%(MMMM)s %(d)s, %(yyyy)s"}, "short": {"pattern": "M/d/yy", "format": "%(M)s/%(d)s/%(yy)s"}}, "scientific_format": "#E0", "exp_symbol": "E", "eras": {"wide": {"0": "Before Christ", "1": "Anno Domini"}, "abbreviated": {"0": "BC", "1": "AD"}, "narrow": {"0": "B", "1": "A"}}, "decimal_symbol": ".", "months": {"stand-alone": {"wide": {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"}, "abbreviated": {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"}, "narrow": {"1": "J", "2": "F", "3": "M", "4": "A", "5": "M", "6": "J", "7": "J", "8": "A", "9": "S", "10": "O", "11": "N", "12": "D"}}, "format": {"wide": {"1": "January", "2": "February", "3": "March", "4": "April", "5": "May", "6": "June", "7": "July", "8": "August", "9": "September", "10": "October", "11": "November", "12": "December"}, "abbreviated": {"1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "May", "6": "Jun", "7": "Jul", "8": "Aug", "9": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}, "narrow": {"1": "J", "2": "F", "3": "M", "4": "A", "5": "M", "6": "J", "7": "J", "8": "A", "9": "S", "10": "O", "11": "N", "12": "D"}}}, "group_symbol": ",", "days": {"stand-alone": {"wide": {"0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday", "4": "Friday", "5": "Saturday", "6": "Sunday"}, "abbreviated": {"0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday", "4": "Friday", "5": "Saturday", "6": "Sunday"}, "narrow": {"0": "M", "1": "T", "2": "W", "3": "T", "4": "F", "5": "S", "6": "S"}}, "format": {"wide": {"0": "Monday", "1": "Tuesday", "2": "Wednesday", "3": "Thursday", "4": "Friday", "5": "Saturday", "6": "Sunday"}, "abbreviated": {"0": "Mon", "1": "Tue", "2": "Wed", "3": "Thu", "4": "Fri", "5": "Sat", "6": "Sun"}, "narrow": {"0": "M", "1": "T", "2": "W", "3": "T", "4": "F", "5": "S", "6": "S"}}}, "datetime_formats": {"null": "{1} {0}"}, "percent_format": "#,##0%", "min_week_days": 1, "first_week_day": 6, "periods": {"am": "AM", "pm": "PM"}, "minus_sign": "-", "time_formats": {"medium": {"pattern": "h:mm:ss a", "format": "%(h)s:%(mm)s:%(ss)s %(a)s"}, "full": {"pattern": "h:mm:ss a v", "format": "%(h)s:%(mm)s:%(ss)s %(a)s %(v)s"}, "long": {"pattern": "h:mm:ss a z", "format": "%(h)s:%(mm)s:%(ss)s %(a)s %(z)s"}, "short": {"pattern": "h:mm a", "format": "%(h)s:%(mm)s %(a)s"}}, "quarters": {"stand-alone": {"wide": {"1": "1st quarter", "2": "2nd quarter", "3": "3rd quarter", "4": "4th quarter"}, "abbreviated": {"1": "1st quarter", "2": "2nd quarter", "3": "3rd quarter", "4": "4th quarter"}, "narrow": {"1": "1", "2": "2", "3": "3", "4": "4"}}, "format": {"wide": {"1": "1st quarter", "2": "2nd quarter", "3": "3rd quarter", "4": "4th quarter"}, "abbreviated": {"1": "Q1", "2": "Q2", "3": "Q3", "4": "Q4"}, "narrow": {"1": "1", "2": "2", "3": "3", "4": "4"}}}, "plus_sign": "+", "number_format": "#,##0.###", "locale_name": "en_US"};',
            'window.locale_name = function() { return "en_US"; };',
            'window.locale_uses_day_before_month = function() { return false; };',
            
            'window.$C = window.$C || {}; window.$C.INDEPENDENT_MODE = false;',
            fs.readFileSync(staticBasepath + "js/i18n.js").toString(),
            fs.readFileSync(staticBasepath + "build/pdf_mapping/index.js").toString()
        ],
        done: function(err, window) {
            if (err) {
                callback(err, null);
                return;
            }

            // Set up mock createElementNS
            window.document.createElementNS = function(ns, tagName) {
                var elem = window.document.createElement(tagName);

                elem.getBBox = function() {
                    if (this.textContent) {

                        var doc = new PDFDocument(),
                            fontSize = parseInt(elem.getAttribute("font-size"), 10)
                                        || parseInt(window.getComputedStyle(elem, null).getPropertyValue("font-size"), 10),
                            font = doc.font('Helvetica', fontSize);

                        return ({
                            x: elem.offsetLeft,
                            y: elem.offsetTop,
                            // need to compute max width per line
                            width: font.widthOfString(this.textContent),
                            // need to compute currentLineHeight()+(numLines-1)*currentLineHeight(true)
                            height: font.currentLineHeight() + 4  // offset by 4 to produce results consistent with browser rendering
                        });
                    }

                    return ({
                        x: elem.offsetLeft,
                        y: elem.offsetTop,
                        width: elem.offsetWidth,
                        height: elem.offsetHeight
                    });
                };

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
                    for (i = 0; i < arguments.length; i++) {
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

function prepareColumnData(data) {
    var mapData = {};
    if (data) {
        var fields = data.fields;
        var columns = data.columns;
        if (fields && columns) {
            var numColumns = Math.min(fields.length, columns.length);
            var numRows = (numColumns > 0) ? columns[0].length : 0;
            var obj;
            var i;
            var j;

            for (i = 1; i < numColumns; i++)
                numRows = Math.min(numRows, columns[i].length);

            mapData.fields = filterFields(fields);
            mapData.data = [];
            for (i = 0; i < numRows; i++) {
                obj = {};
                for (j = 0; j < numColumns; j++)
                    obj[fields[j]] = columns[j][i];
                mapData.data.push(obj);
            }
        }
    }
    return mapData;
}

function filterFields(fields) {
    if (!fields)
        return null;

    var filteredFields = [];
    var field;
    for (var i = 0, l = fields.length; i < l; i++) {
        field = fields[i];
        if (field && (field.charAt(0) !== "_"))
            filteredFields.push(field);
    }
    return filteredFields;
}

// Helper method to convert an array in Node to one that will type-check correctly
// in the jsdom environment.  The `Array` constructor is not accessible on the window
// object so the easiest way to do this is by accessing the version of underscore
// that's running in jsdom.
function toDOMArray(a, window) {
    var _ = window.require('underscore');
    return a ? _(a).toArray() : a;
}

function getSVG(data, staticBasepath, callback) {

    createMappingWindow(staticBasepath, function(err, window) {
        if (err) {
            callback(err, null);
            return;
        }

        var getConsoleMessages = function() {
            if (window.console.messages && window.console.messages.length > 0) {
                return window.console.messages;
            }
            return null;
        };

        process.on("uncaughtException", function (error) {
            var fullError = {
                consoleMessages: getConsoleMessages(),
                message: error.stack
            };
            callback(fullError, null);
        });

        try {
            var PdfMapRenderer = window.require('splunk/mapping2/PdfMapRenderer');
            var pdfMapRenderer = new PdfMapRenderer();

            var splunkdBasepath = (data.system && data.system.splunkdUri) ? data.system.splunkdUri : "https://localhost:8089/";
            pdfMapRenderer.set('splunkdBasepath', splunkdBasepath);
            pdfMapRenderer.set('staticBasepath', staticBasepath);
            pdfMapRenderer.set('width', parseInt(data.width, 10));
            pdfMapRenderer.set('height', parseInt(data.height, 10));
            pdfMapRenderer.set('props', data.props);
            var mapData = prepareColumnData(data.series);
            mapData.data = toDOMArray(mapData.data, window);
            mapData.fields = toDOMArray(mapData.fields, window);
            pdfMapRenderer.set('mapData', mapData);

            var svg = pdfMapRenderer.getSVG();
            callback({ consoleMessages: getConsoleMessages() }, svg);
        }
        catch(err) {
            window.console.log('exception in splunk_mapping::getSVG' + JSON.stringify(err));
            var fullError = {
                consoleMessages: getConsoleMessages(),
                message: err
            };
            callback(fullError, null);
        }
    });
}

exports.getSVG = getSVG;
