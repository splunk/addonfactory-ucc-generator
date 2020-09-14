var jsdom = require('jsdom'),
    i18n = require('./i18n'),
    __script_basepath = "file:///" + __dirname + "/httpdocs/static/js/",
    __font_basepath = "file:///" + __dirname + "/";

PDFDocument = require('pdfkit');
fs = require('fs');

function createSingleValueWindow(locale, scriptBasepath, callback) {
    jsdom.env({
        html: "<html><head></head><body><div id='container'></div></body></html>",
        src: [
            fs.readFileSync(scriptBasepath + "contrib/almond.js").toString(),

            fs.readFileSync(scriptBasepath + "i18n.js").toString(),

            // Prepare i18n since we didn't load it from splunk web: hard-code locale data for en_US
            'window._i18n_locale=' + JSON.stringify(i18n.getLocaleData(locale)) + ';',
            'window.locale_name = function() { return "' + locale + '"; };',
            'window.locale_uses_day_before_month = function() { return false; };',

            fs.readFileSync(scriptBasepath + "../build/single_value/index.js", "utf8")
        ],
        done: function(err, window) {
            if(err) {
                callback(err, null);
                return;
            }

            // Set up a good mock implementation for creating elements and later getting their bounding box
            window.document.createElementNS = function(ns, tagName) {
                var elem = window.document.createElement(tagName);
                if (tagName === 'svg') {
                    elem.setAttribute('version', '1.1');
                    elem.setAttribute('xmlns', ns);
                }
                elem.getBBox = function() {
                    if (this.textContent) {
                        var doc = new PDFDocument(),
                            fontSize = parseInt(elem.getAttribute("font-size"), 10)
                                || parseInt(window.getComputedStyle(elem, null).getPropertyValue("font-size"), 10),
                            font = doc.font('Helvetica', fontSize);

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
                            // need to compute currentLineHeight()+(numLines-1)*currentLineHeight(true)
                            height: font.currentLineHeight()
                        });
                    }
                    return ({
                        x: elem.offsetLeft || 0,
                        y: elem.offsetTop || 0,
                        width: elem.offsetWidth || 0,
                        height: elem.offsetHeight || 0
                    });

                };
                // the element has to know its namespace or HighCharts will choke calculating its bounding box
                elem.namespaceURI = ns;
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

    createSingleValueWindow(data.locale, scriptBasepath, function (err, window) {
        if(err) {
            callback(err, null);
        }
        else {
            var $ = window.$;
            var $container = $('#container');

            var getConsoleMessages = function() {
                if(window.console.messages && window.console.messages.length > 0) {
                    return window.console.messages;
                }
                return null;
            };

            var BaseModel = window.require('models/Base');
            var SingleValue = window.require('views/shared/singlevalue/Master');

            var searchResultsModel = new BaseModel(data.series);
            var stateModel = new BaseModel(data.props);
            stateModel.set('exportMode', true);
            var singleValueView = new SingleValue({
                model: {
                    searchData: searchResultsModel,
                    config: stateModel
                },
                width: parseInt(data.width, 10),
                height: parseInt(data.height, 10),
                el: $container[0]
            });

            singleValueView.render();
            singleValueView.invalidateReflow();
            singleValueView.validate();

            var svg = singleValueView.$el.html();
            //window.console.log(svg);

            callback({ consoleMessages: getConsoleMessages() }, svg);
        }
    });
}

exports.getSVG = getSVG;
