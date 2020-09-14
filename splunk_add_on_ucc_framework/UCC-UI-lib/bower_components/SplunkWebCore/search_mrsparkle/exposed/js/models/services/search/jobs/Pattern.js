define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Base = require('models/Base');
    var Result = require('models/services/search/jobs/Result');
    var BaseCollection = require('collections/Base');
    var splunkd_utils = require('util/splunkd_utils');
    var splunkUtil = require('splunk.util');
    
    var PatternModel = Base.extend(
        {
            initialize: function(data, options) {
                options = options || {};
                this._tokenObjects = [];
                Base.prototype.initialize.call(this, data, options);
            },
            isEventTypeable: function() {
                return splunkUtil.normalizeBoolean(this.get('eventTypeable'));
            },
            getConfidence: function() {
                return parseFloat(this.get('confidence')).toFixed(3);
            },
            getNumInPattern: function() {
                return parseInt(this.get('numInInputGroup'), 10);
            },
            getNumMatched: function() {
                return parseInt(this.get('numMatched'), 10);
            },
            getPercentInPattern: function() {
                return parseFloat(this.get('percentInInputGroup')).toFixed(4);
            },
            getPercentMatched: function() {
                return parseFloat(this.get('percentMatched')).toFixed(4);
            },
            getTotalEvents: function() {
                return parseInt(this.get('totalEvents'), 10);
            },
            getTotalInputGroups: function() {
                return parseInt(this.get('totalInputGroups'), 10);
            },
            getTimeStartPos: function() {
                return parseInt(this.get('timestartpos'), 10);
            },
            getTimeEndPos: function() {
                return parseInt(this.get('timeendpos'), 10);
            },
            getExcludeTerms: function() {
                var terms = this.get('excludeKeywords');
                if (_.isString(terms)) {
                    return [terms];
                } else if (terms === undefined) {
                    return [];
                }
                return terms;
            },
            getIncludeTerms: function() {
                var terms = this.get('includeKeywords');
                if (_.isString(terms)) {
                    return [terms];
                } else if (terms === undefined) {
                    return [];
                }
                return terms;
            },
            getSampleEvent: function() {
                var sampleEvent = this.get('sampleEvent');
                if (_.isArray(sampleEvent)) {
                    return sampleEvent[0];
                }
                return sampleEvent;
            },
            getSampleEventTokens: function() {
                var timeStartPos = this.getTimeStartPos(),
                    timeEndPos = this.getTimeEndPos(),
                    event = this.getSampleEvent(),
                    start = [], middle = [], end = [];
                
                if (!this._tokenObjects.length) {
                    if (!_.isNaN(timeStartPos) && !_.isNaN(timeEndPos)) {
                        start = this.tokenizeString(event.substr(0, timeStartPos));
                        middle = [{
                            token: _('timestamp').t(),
                            timestamp: true,
                            highlight: false
                        }];
                        end = this.tokenizeString(event.substr(timeEndPos));
                    } else {
                        start = this.tokenizeString(event);
                    }
                    
                    this._tokenObjects = start.concat(middle, end);
                }
                                
                return this._tokenObjects;
            },
            tokenizeString: function(str) {
                if (!str) {
                    return [];
                }
                
                var tokens = str.split(/(\w*)/g),
                    terms = this.getIncludeTerms();
                
                return _(tokens).map(function(token) {
                    var tokenObject = {
                            token: token,
                            highlight: false,
                            timestamp: false
                        },
                        highlight = _(terms).find(function(term) {
                            return term === token;
                        });
                    if (highlight) {
                        tokenObject.highlight = true;
                    }
                    return tokenObject;
                });
            },
            getExampleSearch: function() {
                return splunkUtil.stripLeadingSearchCommand(this.get('search'));
            },
            getNumEstimatedEvents: function(eventCount) {
                return Math.round(eventCount * parseFloat(this.get('percentMatched')));
            }
        }
    );
    
    var ParentPatternModel = Base.extend(
        {
            url: '',
            initialize: function(data, options) {
                options = options || {};
                Base.prototype.initialize.call(this, data, options);
                this.initializeAssociated();
                if (options && options.splunkDPayload) {
                    this.setFromSplunkD(options.splunkDPayload, {silent: true});
                }                
            },
            initializeAssociated: function(options) {
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                
                //instance level models
                this.results = this.results || new RootClass.Results();
                this.associated.results = this.results;
            },
            sync: function(method, model, options) {
                if (method!=='read') {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var appOwner = {},
                    defaults = {
                        data: {output_mode: 'json'}
                    },
                    url = _.isFunction(model.url) ? model.url() : model.url || model.id;
                    
                if (options.data) {
                    appOwner = $.extend(appOwner, { //JQuery purges undefined
                        app: options.data.app || undefined,
                        owner: options.data.owner || undefined,
                        sharing: options.data.sharing || undefined
                    });
                }
                
                defaults.url = splunkd_utils.fullpath(url, appOwner);
                $.extend(true, defaults, options);
                
                delete defaults.data.app;
                delete defaults.data.owner;
                delete defaults.data.sharing;
                
                return Backbone.sync.call(this, method, model, defaults);
            },
            parse: function(response, options) {
                this.initializeAssociated();
                
                var clonedResponse = $.extend(true, {}, response);
                this.results.reset(clonedResponse.results, _.extend({}, options, {parse: true}));
                delete clonedResponse.results;
                
                return clonedResponse;
            },
            setFromSplunkD: function(payload, options) {
                var clonedPayload = $.extend(true, {}, payload);
                
                if (clonedPayload.results) {
                    this.results.reset(clonedPayload.results, _.extend({}, options, {parse: true}));
                    delete clonedPayload.results;                    
                }
                
                this.set(clonedPayload, options);
            }
        },
        {
            Results: BaseCollection.extend({model: PatternModel})
        }
    );
    
    return ParentPatternModel;
});