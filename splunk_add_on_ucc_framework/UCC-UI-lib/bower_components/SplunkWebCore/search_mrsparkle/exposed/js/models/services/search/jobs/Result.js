define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'models/shared/fetchdata/ResultsFetchData',
        'collections/Base',
        'util/splunkd_utils',
        'util/time',
        'splunk.util',
        'splunk.i18n',
        'uri/route'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        ResultsFetchData,
        BaseCollection,
        splunkd_utils,
        time_utils,
        splunkUtil,
        i18n,
        route
    ) 
    {
        var Highlighted = Backbone.Model.extend({
            hasFieldValue: function(field, value) {
                var foundFieldObj = this.get(field);
                if (foundFieldObj) {
                    return foundFieldObj[value];
                }
                return false;
            }
        });

        var Tags = Backbone.Model.extend({
            getTags: function(field, value) {
                if (this.get(field)) {
                    return this.get(field)[value] || [];
                }
                return [];
            },
            setTags: function(field, value, tags) {
                if (!this.get(field)) {
                    this.set(field, {});
                }
                this.get(field)[value] = tags;
            }
        });
        
        var Result = Backbone.Model.extend({
            initialize: function(attributes, options) {
                //cache buster
                this.on('change', function() {
                    this._keys = void(0); 
                    this._strip = void(0);
                }, this);

                this.initializeAssociated();
            },
            initializeAssociated: function() {
                var RootClass = this.constructor;
                this.associated = this.associated || {};

                this.highlighted = this.highlighted || new RootClass.Highlighted();
                this.associated.highlighted = this.highlighted;
                this.tags = this.tags || new RootClass.Tags();
                this.associated.tags = this.tags;
            },
            clear: function(options) {
                delete this._keys; 
                delete this._strip;
                Backbone.Model.prototype.clear.apply(this, arguments);
            },
            idAttribute: '1ee63861-c188-11e2-8743-0017f209b4d8',
            systemFields: [
                 'host', 
                 'index', 
                 'source',
                 'sourcetype',
                 'punct',
                 'linecount',
                 'splunk_server',
                 'splunk_server_group'
            ],
            timeFields: [
                 '_time',
                 'date_zone',
                 'date_year',
                 'date_month',
                 'date_mday',
                 'date_wday',
                 'date_hour',
                 'date_minute',
                 'date_second',
                 'timeendpos',
                 'timestartpos'
            ],
            //cache keys
            keys: function() {
                if(!this._keys) {
                    var json = this.toJSON();
                    delete json[this.idAttribute];
                    this._keys = _.keys(json);
                }
                return this._keys; 
            },
            strip: function() {
                if(!this._strip){
                    this._strip = _.intersection(this.keys(),  _.filter(this.keys(), function(key) {
                        return !(key.indexOf('_')===0 || key.indexOf('tag::')===0 || key.indexOf('_raw')===0);
                    }));
                }
                return this._strip;
            },
            system: function() {
                 return _.intersection(this.strip(), this.systemFields);
            },
            notSystemOrTime: function() {
                var fields = this.strip();
                return _.difference(fields, _.union(this.time(), this.system()));
            },
            time: function() {
                return _.intersection(this.keys(), this.timeFields);
            },
            isTruncated: function() {
                return this.has('_fulllinecount');
            },
            getFieldsLength: function(fields) {
                return _(fields).reduce(function(m, f){ 
                    return m + this.get(f).length; 
                }, 0, this);
            },
            getTags: function(field, value) {
                return this.tags.getTags(field, value);
            },
            setTagsSynthetically: function(field, value, tags) {
                this.tags.setTags(field, value, tags);
                this.trigger("tags-updated");
            },
            
            /**
             * Determines the event type color for the event.
             * @return {String|undefined} Returns undefined if there is no event type for the event,
             *         returns none if there is an event type but the highest priority event type has
             *         color none or is running the transaction command, otherwise returns the event type color. 
             */
            getEventTypeColor: function() {
                var eventTypeColor = this.get('_eventtype_color');
                if (_.isArray(eventTypeColor)) {
                    eventTypeColor = eventTypeColor.length === 1 ? eventTypeColor[0] : 'none';
                }
                return eventTypeColor;
            },
            
            rawToHTML: function(segment) {
                var raw    = this.get('_raw');
                if (!raw) {return '';}
                var tokens = raw.tokens,
                    stree  = raw.segment_tree,
                    types  = raw.types;
        
                function _rawToHtml (stree) {
                    var html = [], i = 0;
                    for (i=0; i<stree.length; i++) {
                        var leaf = stree[i];
                        if(typeof leaf === 'object' ) {
                            html.push('<span class="t'+((leaf.highlight)?' a':'')+'">', _rawToHtml(leaf.array), '</span>');
                        } else {
                            html.push(_.escape(tokens[leaf] || ''));
                        }
                    }
                    return html.join('');
                }
                return _rawToHtml(stree);
            },
            getRawText: function() {
                var raw = this.get('_raw');
                if (!raw) {return '';}
                return _.isArray(raw) ? raw[0]: raw.value;
            },
            getRawSegmentation: function(){
                var raw = this.get('_raw');
                return _.isArray(raw) ? _.escape(raw[0]): this.rawToHTML();
            },
            getRawTimeExtraction: function() {
                var raw = this.getRawText(),
                    timeLen = parseInt((this.get('_timelen') && this.get('_timelen')[0]) || -1, 10),
                    timeStartPos = parseInt((this.get('_timestartpos') && this.get('_timestartpos')[0]) || -1, 10),
                    timeEndPos;

                // return raw text immediately if time delimiters do not exist or failed to be parsed
                if (timeStartPos === -1 || _.isNaN(timeStartPos) ||
                    timeLen === -1 || _.isNaN(timeLen)) {
                    return _.escape(raw);
                }
                timeEndPos = timeStartPos + timeLen;
                return  _.escape(raw.slice(0, timeStartPos)) +
                        '<span class="h">' +
                            _.escape(raw.slice(timeStartPos, timeEndPos)) +
                        '</span>' +
                        _.escape(raw.slice(timeEndPos));
            },
            getWarningCodes: function() {
                var message_codes = this.get('_message_codes');
                if (! message_codes) { return []; }
                return message_codes;
            },
            getWarningTexts: function() {
                var message_texts = this.get('_message_texts');
                if (! message_texts) { return []; }
                return message_texts;
            },
            getIconPath: function(root, locale) {
                var icon = this.get('_icon'), value;
                if (!icon) {
                    return undefined;
                }
                value = parseInt(icon, 16) % 1000;
                return route.identicons(root, locale, value);
            },
            formattedTime: function() {
                var time = this.get('_time');
                if (!time) {
                    return '';
                }
                return i18n.format_datetime_microseconds(
                    time_utils.jsDateToSplunkDateTimeWithMicroseconds(time_utils.isoToDateObject(time[0]))
                );    
            },
            replace: function() {
                return BaseModel.prototype.replace.apply(this, arguments);
            },
            deepOff: function() {
                this.off();
            },
            isPreviewEvent: function() { //returns true if the event has attribute _previewEvent = "true"
                return this.get('_previewEvent') && splunkUtil.normalizeBoolean(this.get('_previewEvent')[0]);
            },
            sync: function(method, model, options) {
                if (method!=='read') {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var offset, 
                    search = options.data.search,
                    appOwner = {},
                    defaults = {
                        data: {
                            output_mode: 'json'
                        }
                    },
                    url = model.id;
                
                if(options.data){
                    appOwner = $.extend(appOwner, {
                        app: options.data.app || undefined,
                        owner: options.data.owner || undefined,
                        sharing: options.data.sharing || undefined
                    });
                }
                
                if(options.data.isRt) {
                    defaults.data.search = ['search _serial=', this.get('_serial')[0], ' AND ', 'splunk_server=', this.get('_si')[0], ' | head 1'].join('');
                }

                defaults.url = splunkd_utils.fullpath(url, appOwner);
                defaults.data.count = 1;
                defaults.truncation_mode = 'abstract';

                $.extend(true, defaults , options);

                if (options.data.isRt) {
                    delete defaults.data.offset;
                }

                delete defaults.data.isRt;
                delete defaults.data.app;
                delete defaults.data.owner;
                delete defaults.data.sharing;
                delete defaults.data.eventsOffset;

                return Backbone.sync.call(this, method, model, defaults);
            },
            parse: function(response, options) {
                this.initializeAssociated();
                this.tags.set(response.tags);
                this.highlighted.set(response.highlighted);

                _(response.results).each(function(result, idx) {
                    _.each(result, function(v, k) {
                        result[k] = (typeof v === 'string') ? [v]: v;
                    },this);
                },this);

                return response.results[0];
            }
        },
        {
            Highlighted: Highlighted,
            Tags: Tags
        });
        
        var Model = BaseModel.extend({
            url: '',
            initialize: function(data, options) {
                options = options || {};
                options.fetchData = options.fetchData || new ResultsFetchData();
                BaseModel.prototype.initialize.call(this, data, options);
                this.initializeAssociated();
                if (options && options.splunkDPayload) {
                    this.setFromSplunkD(options.splunkDPayload, {silent: true});
                }
            },
            clear: function() {
                delete this.responseText;
                return BaseModel.prototype.clear.apply(this, arguments);
            },
            initializeAssociated: function() {
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                
                //instance level models
                this.results = this.results || new RootClass.Results();
                this.associated.results = this.results;
                this.messages = this.messages || new RootClass.Messages();
                this.associated.messages = this.messages;
                this.fields = this.fields || new RootClass.Fields();
                this.associated.fields = this.fields;
                this.highlighted = this.highlighted || new RootClass.Highlighted();
                this.associated.highlighted = this.highlighted;
                this.tags = this.tags || new RootClass.Tags();
                this.associated.tags = this.tags;
            },
            sync: function(method, model, options) {
                if (method!=='read') {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var appOwner = {},
                    defaults = {
                        data: {output_mode: 'json'},
                        dataType: 'text'
                    },
                    url = _.isFunction(model.url) ? model.url() : model.url || model.id;
                    
                if(options.data){
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
            setHasPreviewEvents: function(response) {
                //Parse the response to check if there are previewEvents in the payload
                var resultsLength = response.results ? response.results.length : 0;
                this.hasPreviewEvents = resultsLength > 0 &&
                    splunkUtil.normalizeBoolean(response.results[resultsLength - 1]._previewEvent);
            },
            setFromSplunkD: function(payload, options) {
                options = options || {};
                
                /*
                 * :: Slightly confusing ::
                 * => consumers of this model do no necessarily load data 
                 * via convential means (fetch followed by the parse code path 
                 * below).  This being said, by default we will store a text
                 * response of the payload for compatibility with shared components
                 * that try utilize lazy loading for performance gains.
                 *
                 */
                if(!options.skipStoringResponseText) {
                    this.responseText = JSON.stringify(payload);    
                }

                this.attributes = {};
                if (payload) {
                    if (payload.messages) {
                        this.messages.reset(payload.messages, options);
                        delete payload.messages;
                    }
                    if (payload.fields) {
                        this.fields.reset(payload.fields, options);
                        delete payload.fields;
                    }
                    
                    if (payload.highlighted) {
                        this.highlighted.set(payload.highlighted);
                        delete payload.highlighted;   
                    }

                    if (payload.tags) {
                        this.tags.set(payload.tags);
                        delete payload.tags;  
                    }
                    
                    this.set(payload, options);
                    
                    if (payload.results) {
                        this.setHasPreviewEvents(payload);
                        this.normalizeResults(payload.results);
                        this.results.reset(payload.results, options);
                        delete payload.results;
                    }
                }
            },
            parse: function(response, options) {
                this.initializeAssociated();
                //store string representation of the response
                this.responseText = response; 
                if(!response){
                    return;
                }
                response = JSON.parse(response);
                
                this.setHasPreviewEvents(response);
                /* 
                 * Set a lightweight collection of empty objects.  The collections 
                 * length will be that of the actualy payload.  Useful for lazy loading 
                 * the results via parsing the string response stored on the instance. 
                 */
                if (options.parseLite) {
                    this.results.reset(_(response.results).map(function() { return {}; }));
                    return {};
                }

                this.normalizeResults(response.results);

                /*
                * BAK - this is a work around until the backend consistently provides
                * post_process_count and sets it to null when it is no longer valid
                * SPL-100363 is the outstanding bug
                */
                _.defaults(response, {
                    post_process_count: null
                });

                this.messages.reset(response.messages);
                delete response.messages;
                
                this.fields.reset(response.fields);
                delete response.fields;
                
                this.highlighted.set(response.highlighted);
                delete response.highlighted;

                this.tags.set(response.tags);
                delete response.tags;
                
                var results = response.results;
                delete response.results;
                
                this.set(response);

                this.results.reset(results);
                return {};
            },
            /*
             * The enum of possible types returned for a field value is:
             * => string, array, object ::: where only _raw can be of type object (segmentation)
             * 
             * Normalize the results such that if the field is not _raw, the value
             * will be of type array. 
             */
            normalizeResults: function(results) {
                _(results).each(function(result, idx) {
                    _(result).each(function(v, k) {
                        result[k] = (typeof v === 'string') ? [v]: v;
                    },this);
                },this);
            },
            endOffset: function() {
                return (this.get('init_offset') || 0) + this.results.length;
            },
            lineNumber: function(offset, isRealTime) {
                return isRealTime ? this.endOffset() - offset : (this.get('init_offset') || 0) + offset + 1;
            },
            offset: function(index) {
                return (this.get('init_offset') || 0) + index;
            },
            getTags: function(field, value) {
                return this.tags.getTags(field, value);
            },
            setTagsSynthetically: function(field, value, tags) {
                this.tags.setTags(field, value, tags);
                this.trigger("tags-updated");
            }
        },
        {
            Results: BaseCollection.extend(
                {
                    model: Result,
                    get: function(obj) {
                      if (obj == null) return void 0;
                      this._idAttr || (this._idAttr = this.model.prototype.idAttribute);
                      return this._byId[obj[this._idAttr]];
                    }
                },
                {
                    Result: Result
                }
            ),
            Messages: BaseCollection.extend({model: BaseModel}),
            Fields: BaseCollection.extend({model: BaseModel}),
            Highlighted: Highlighted,
            Tags: Tags
        });
    
        return Model;
    }
);
