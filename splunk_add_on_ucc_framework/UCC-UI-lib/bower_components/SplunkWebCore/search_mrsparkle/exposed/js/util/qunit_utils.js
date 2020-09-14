define([
        'jquery',
        'underscore',
        'backbone',
        'views/shared/delegates/Popdown',
        'views/shared/controls/SyntheticSelectControl',
        'splunk.util',
        'util/xml',
        'util/color_utils',
        'util/console'
        ],
    function(
        $,
        _,
        Backbone,
        Popdown,
        SyntheticSelectControl,
        splunkUtils,
        xmlUtils,
        colorUtils,
        console) {

    var generateDomEvent = function($target, eventType, eventProperties) {
        var event = $.Event(eventType, eventProperties);
        $target.trigger(event);
        return event;
    };

    var generateClickEvent = function($target, eventProperties) {
        return generateDomEvent($target, 'click', eventProperties);
    };

    var generateMouseDownEvent = function($target, eventProperties) {
        return generateDomEvent($target, 'mousedown', eventProperties);
    };

    // helper to show any Popdown children of the given view (or itself if it's a Popdown)
    // useful because the Popdown's don't bind event listeners until shown
    var showPopdown = function(view) {
        if(view instanceof Popdown) {
            view.render();
            view.trigger('show');
            view.trigger('shown');
        }
        _(view.children || {}).each(function(child) {
            // don't show popdowns inside of SyntheticSelectControls that have not been rendered
            if(view instanceof SyntheticSelectControl && !view.$menu) {
                return;
            }
            // recursion warning
            showPopdown(child);
        });
    };

    // counterpart to showPopdown for hiding
    var hidePopdown = function(view) {
        if(view instanceof Popdown) {
            view.trigger('hide');
            view.trigger('hidden');
        }
        _(view.children || {}).each(function(child) {
            // don't try to hide popdowns inside of SyntheticSelectControls that have not been rendered
            if(view instanceof SyntheticSelectControl && !view.$menu) {
                return;
            }
            // recursion warning
            hidePopdown(child);
        });
    };

    // calling deepEqual on objects that contain Backbone instances can be expensive
    // this method recursively replaces those instances with their cids, then calls deepEqual
    var bbDeepEqual = function bbDeepEqual(expected, actual, message) {

        var isBackboneObject = function(obj) {
            return (
                obj instanceof Backbone.Model ||
                obj instanceof Backbone.Collection ||
                obj instanceof Backbone.View
            );
        };

        var replaceWithCids = function(obj) {
            if(isBackboneObject(obj)) {
                return obj.cid;
            }
            if(_(obj).isArray()) {
                // recursion warning
                return _(obj).map(replaceWithCids);
            }
            if($.isPlainObject(obj)) {
                var replacedObject = {};
                _(obj).each(function(value, key) {
                    // recursion warning
                    replacedObject[key] = replaceWithCids(value);
                });
                return replacedObject;
            }
            return obj;
        };

        deepEqual(replaceWithCids(expected), replaceWithCids(actual), message);
    };

    // A helper that will wait the specified amount of time, using stop/start to pause the QUnit test runner.
    // Accepts a callback and optional scope, also returns a deferred.

    var wait = function(millis, callback, context) {
        callback = callback || function() {};
        context = context || null;
        var dfd = $.Deferred();
        stop();

        setTimeout(function() {
            start();
            callback.call(context);
            dfd.resolve();
        }, millis);

        return dfd;
    };

    /**
     * @author sfishel
     *
     * Helpers to setup and teardown the sinon.js fake XHRs
     * Usage:
     *
     * (in your module's setup method)
     * qunitUtils.setupFakeXhrs.call(this);
     *
     * (and in your module's teardown method)
     * qunitUtils.teardownFakeXhrs.call(this);
     */

    var setupFakeXhrs = function() {
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.requests = [];

        this.xhr.onCreate = _(function(xhr) {
            this.requests.push(xhr);
        }).bind(this);

    };

    var teardownFakeXhrs = function() {
        if(this.xhr) {
            this.xhr.restore();
        }
    };

    var FakeXhrModule = {
        setup: function() {
            setupFakeXhrs.call(this);
        },

        lastRequest: function() {
            return _(this.requests).last();
        },

        respondToMatchingRequest: function(urlRegex, payload, status, headers) {
            var matchingRequests = _(this.requests).filter(function(request) {
                return request.readyState !== 4 && urlRegex.test(request.url);
            });
            if (matchingRequests.length === 0) {
                throw new Error('No requests found matching ' + urlRegex);
            }
            if (matchingRequests.length > 1) {
                console.error('matching requests are', matchingRequests);
                throw new Error('Multiple requests found matching ' + urlRegex);
            }
            this.respondTo(matchingRequests[0], payload, status, headers);
        },

        findMostRecentRequest: function(urlRegex, requirePending) {
            return _(this.requests).chain().filter(function(request) {
                var url = decodeURIComponent(request.url);
                return urlRegex.test(url) && (!requirePending || request.readyState !== 4);
            }).last().value();
        },

        respondTo: function(request, payload, status, headers) {
            payload = _(payload).isString() ? payload : JSON.stringify(payload);
            headers = $.extend({}, headers, { 'Content-type': 'application/json' });
            return request.respond(status || 200, headers || {}, payload || '{}');
        },

        getRequestArgs: function(request) {
            var requestArgs = request.method === 'GET' ? request.url.split('?')[1] : request.requestBody;
            return splunkUtils.queryStringToProp(requestArgs.replace(/\+/g, '%20'));
        },

        verifyRequestArgs: function(request, expected, message) {
            var argsAsObject = this.getRequestArgs(request),
                expectedCopy = $.extend(true, {}, expected);

            _(expectedCopy).each(function(value, key) {
                if(_(value).isNumber() || _(value).isBoolean()) {
                    expectedCopy[key] = value.toString();
                }
            });
            deepEqual(argsAsObject, expectedCopy, message);
        },

        teardown: function() {
            teardownFakeXhrs.call(this);
        }

    };

    var eq = function(result, expected, msg) {
        if (!msg) {
            msg = 'Expected: ' + JSON.stringify(expected);
        }
        if (_.isArray(expected) || _.isObject(expected)) {
            deepEqual(result, expected, msg);
        } else {
            strictEqual(result, expected, msg);
        }
    };

    var partialEq = function(result, expectedSubset, msg) {
        if(!msg) {
            msg = 'Expected result to contain ' + JSON.stringify(expectedSubset);
        }
        deepEqual(result && _.pick(result, _.keys(expectedSubset)) || result, expectedSubset, msg);
    };

    var xmlEqual = function(result, expected, msg) {
        var $result = _.isString(result) ? xmlUtils.$node(result) : $(result);
        var $expected = _.isString(expected) ? xmlUtils.$node(expected) : $(expected);
        xmlUtils.formatXML($result);
        xmlUtils.formatXML($expected);
        eq(xmlUtils.serialize($result), xmlUtils.serialize($expected), msg);
    };

    var getNormalizedCssColor = function($el, cssAttr) {
        return normalizeColorToRgb($el.css(cssAttr));
    };

    var getNormalizedColorAttr = function($el, attrName) {
        return normalizeColorToRgb($el.attr(attrName));
    };

    var normalizeColorToRgb = function(colorString) {
        if (_.isNumber(colorString)) {
            colorString = colorString.toString(16);
            while (colorString.length < 6) {
                colorString = '0' + colorString;
            }
        }
        if (/^#?[\dA-Fa-f]{3,6}$/.test(colorString)) {
            return colorUtils.rgbStringFromRgbColor(colorUtils.rgbColorFromHexString(colorString));
        }
        if (colorString.indexOf('rgb') === 0) {
            return colorUtils.rgbStringFromRgbColor(colorUtils.rgbColorFromRgbString(colorString));
        }
        throw new Error('unrecognized color format: ' + colorString);
    };
        
    return ({

        generateDomEvent: generateDomEvent,
        generateClickEvent: generateClickEvent,
        generateMouseDownEvent: generateMouseDownEvent,
        showPopdown: showPopdown,
        hidePopdown: hidePopdown,
        bbDeepEqual: bbDeepEqual,
        wait: wait,
        setupFakeXhrs: setupFakeXhrs,
        teardownFakeXhrs: teardownFakeXhrs,
        FakeXhrModule: FakeXhrModule,
        eq: eq,
        partialEq: partialEq,
        xmlEqual: xmlEqual,
        getNormalizedCssColor: getNormalizedCssColor,
        getNormalizedColorAttr: getNormalizedColorAttr,
        normalizeColorToRgb: normalizeColorToRgb

    });

});