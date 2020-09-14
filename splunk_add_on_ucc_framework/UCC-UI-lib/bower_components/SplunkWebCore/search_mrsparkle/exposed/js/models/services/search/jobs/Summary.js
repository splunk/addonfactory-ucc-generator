define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'collections/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        BaseCollection,
        splunkdutils
    ) 
    {
        var Field = Backbone.Model.extend(
            {
                idAttribute: 'name',
                isNumeric: function() {
                    return this.get('numeric_count') > this.get('count') / 2;
                },
                replace: function() {
                    return BaseModel.prototype.replace.apply(this, arguments);
                },
                deepOff: function() {
                    this.off();
                }
            }
        );
        var Fields = BaseCollection.extend({
            model: Field
        });
        
        var Model = BaseModel.extend({
            url: '',
            initialize: function(data, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
                this.initializeAssociated();
                if (options && options.splunkDPayload) {
                    this.setFromSplunkD(options.splunkDPayload, {silent: true});
                }
                this.memoizedFrequency = {};
                this.memoizedFields = {};
                this.memoizedFilterByMinFrequency = {};

                this.getFields().on('reset', function() {
                    this.memoizedFrequency = {};
                    this.memoizedFields = {};
                    this.memoizedFilterByMinFrequency = {};
                }, this);
            },
            initializeAssociated: function() {
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                //instance level models
                this.fields = this.fields || new RootClass.Fields();
                this.associated.fields = this.fields;
            },
            sync: function(method, model, options) {
                if (method!=='read') {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var appOwner = {},
                    defaults = {data: {output_mode: 'json'}},
                    url = _.isFunction(model.url) ? model.url() : model.url || model.id;
                    
                if(options.data){
                    appOwner = $.extend(appOwner, { //JQuery purges undefined
                        app: options.data.app || undefined,
                        owner: options.data.owner || undefined,
                        sharing: options.data.sharing || undefined
                    });
                }
                defaults.url = splunkdutils.fullpath(url, appOwner);
                $.extend(true, defaults, options);
                delete defaults.data.app;
                delete defaults.data.owner;
                delete defaults.data.sharing;
                return Backbone.sync.call(this, method, model, defaults);
            },
            _fields: function(data) {
                var fields = [];
                _.each(data, function(fieldValue, fieldName) {
                    var field = {name: fieldName};
                    _.each(fieldValue, function(fieldPropertyValue, fieldPropertyName){
                        field[fieldPropertyName] = fieldPropertyValue;
                    });
                    fields.push(field);
                }, this);
                return fields;
            },
            parse: function(response, options) {
                this.initializeAssociated();
                if (!response) {
                    return {};
                }

                response = $.extend(true, {}, response);
                return this.parseAssociated(response, options);
            },
            setFromSplunkD: function(payload, options) {
                var fields;
                payload = $.extend(true, {}, payload);
                this.attributes = {};
                if (payload) {
                    this.parseAssociated(payload, options);
                }
            },
            parseAssociated: function(response, options) {
                var fields = this._fields(this.getFieldsFromResponse(response));
                this.deleteFieldsFromResponse(response);
                this.set(response, options);
                var resetOptions = $.extend(true, {parse:true}, options);
                this.getFields().reset(fields, resetOptions);

                return response;
            },

            filterByMinFrequency: function(frequency) {
                if (this.memoizedFilterByMinFrequency.hasOwnProperty(frequency)) {
                    return this.memoizedFilterByMinFrequency[frequency];
                }
                
                var eventCount = this.getEventCount(),
                    filteredByMinFreq = this.getFields().filter(function(field) {
                        return (field.get('count')/eventCount) >= frequency;
                    });
                this.memoizedFilterByMinFrequency[frequency] = filteredByMinFreq;
                return filteredByMinFreq;
            },
            frequency: function(fieldName) {
                if (this.memoizedFrequency[fieldName] !== void(0)) {
                    return this.memoizedFrequency[fieldName];
                }
                
                var field = this.findByFieldName(fieldName),
                    freq;
                
                if (!field) {
                    this.memoizedFrequency[fieldName] = 0;
                    return 0;
                }
                
                freq = field.get('count')/this.getEventCount();
                this.memoizedFrequency[fieldName] = freq;
                return freq;
            },
            findByFieldName: function(fieldName) {
                if (this.memoizedFields.hasOwnProperty(fieldName)) {
                    return this.memoizedFields[fieldName];
                }
                
                var field = this.getFields().get(fieldName);

                this.memoizedFields[fieldName] = field;
                return field;
            },
            distribution: function(fieldName) {
                var fieldHistogram,
                    field = this.findByFieldName(fieldName),
                    rootHistogram = this.get('histogram');
                if (!field) {
                    return [];
                }
                fieldHistogram = field.get('histogram');
                if (!rootHistogram || !fieldHistogram) {
                    return [];
                }

                var numBuckets = Math.min(rootHistogram.length, fieldHistogram.length);
                
                // flatten histogram and summaryHistogram data into arrays of counts and totals
                var counts = [];
                var totals = [];
                var i;
                for (i = 0; i < numBuckets; i++) {
                    counts.push(fieldHistogram[i].count);
                    totals.push(rootHistogram[i].count);
                }
    
                // merge buckets so there are no more than maxBuckets
                var maxBuckets = 30;
                var mergedCounts;
                var mergedTotals;
                while (numBuckets > maxBuckets) {
                    mergedCounts = [];
                    mergedTotals = [];
                    for (i = numBuckets - 1; i >= 0; i -= 2) {
                        if (i > 0) {
                            mergedCounts.unshift(counts[i] + counts[i - 1]);
                            mergedTotals.unshift(totals[i] + totals[i - 1]);
                        } else {
                            mergedCounts.unshift(counts[i]);
                            mergedTotals.unshift(totals[i]);
                        }
                    }
                    counts = mergedCounts;
                    totals = mergedTotals;
                    numBuckets = counts.length;
                }
    
                // compute percentages from counts and totals
                var percentages = [];
                for (i = 0; i < numBuckets; i++) {
                    percentages.push((totals[i] > 0) ? (Math.min(100, ((counts[i] / totals[i]) * 100))) : 0);
                }
                
                return percentages;
            },
            /**
             * Accessor function to get the event count. Subclasses can override
             * @return {number} number of fields
             */
            getEventCount: function() {
                return this.get('event_count');
            },
            /**
             * Accessor function to get the collection of fields. Subclasses can override
             * @return {Collection} collection of fields
             */
            getFields: function() {
                return this.fields;
            },
            /**
             * Accessor function to get the fields from a response object. Subclasses can override
             * @param response
             * @return {Array} array of the fields in the response
             */
            getFieldsFromResponse: function(response) {
                return response.fields;
            },
            deleteFieldsFromResponse: function(response) {
                delete response.fields;
            }

        },
        {
            Fields: Fields,
            Field: Field
        });
        
        return Model;
    }
);
