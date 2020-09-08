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
        splunkd_utils
    )
    {
        var BucketModel = BaseModel.extend({
            
        });
        
        var RootModel = BaseModel.extend({
            url: '',
            initialize: function(data, options) {
                options = options || {};
                BaseModel.prototype.initialize.call(this, data, options);
                this.initializeAssociated();
                if (options && options.splunkDPayload) {
                    this.setFromSplunkD(options.splunkDPayload, {silent: true});
                }                
            },
            initializeAssociated: function() {
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                this.buckets = this.buckets || new RootClass.Buckets();
                this.associated.buckets = this.buckets;
            },
            setFromSplunkD: function(payload, options) {
                payload = $.extend(true, {}, payload);
                this.attributes = {};
                if (payload) {
                    this.buckets.reset(payload.buckets, options);
                    delete payload.buckets;
                    this.set(payload, options);
                }
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
            parse: function(response) {
                response = $.extend(true, {}, response);
                this.initializeAssociated();
                this.buckets.reset([], {silent: true});
                this.buckets.reset(response.buckets);
                delete response.buckets;
                return response;
            },
            availableCount: function(earliestTime, latestTime) {
                var availcount=0;
                
                for(var i=this.buckets.length-1; i>=0; i--) {
                    var model = this.buckets.at(i),
                        modelEarliestTime = model.get('earliest_time');
                        if(modelEarliestTime >= earliestTime && modelEarliestTime < latestTime) {
                            var ac = model.get('available_count');
                            availcount+=ac;
                            if(ac < model.get('total_count')){
                                return {
                                    length: availcount,
                                    trunc: true
                                };
                            }
                        }
                }
                return {
                    length: availcount,
                    trunc: false 
                };
            },
            totalCount: function(earliestTime, latestTime) {
                return this
                        .buckets
                        .chain()
                        .filter(function(model) {
                            var modelEarliestTime = model.get('earliest_time'),
                                modelLatestTime = model.get('latest_time') || (modelEarliestTime + model.get('duration'));
                            return modelEarliestTime >= earliestTime && modelLatestTime <= latestTime;
                        })
                        .reduce(function(memo, model) {
                            return memo + model.get('total_count');
                        }, 0)
                        .value();   
            }
        },
        {
            Buckets: BaseCollection.extend(
                    {
                        model: BucketModel
                    },
                    {
                        Bucket: BucketModel
                    }
            )
        });
        
        return RootModel;
    }
);  
