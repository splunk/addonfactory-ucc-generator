define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/search/Job'
    ],
    function($, _, Backbone, JobModel) {
        /** @constructor
         *  @memberOf models
         *  @extends models.Job
         *  @name DispatchJob
         *  @description
         * When dispatching saved searches, we use the 'dispatch.<property>=X' form,
         * as opposed to when creating search jobs, where we use just '<property>=X'
         * form. Furthermore, some 'dispatch.' property names differ from their
         * search job counterparts: 
         *  * dispatch.buckets ~= status_buckets
         *  * dispatch.lookups ~= enable_lookups
         * Given that, the following two lists have both what properties can be
         * dispatched, as well as their variants and mappings.
         */
        var DISPATCHABLE_PROPERTIES = {
            "status_buckets": true,
            "buckets": true, 
            "earliest_time": true,
            "indexedRealtime": true,
            "latest_time": true,
            "enable_lookups": true,
            "lookups": true,
            "max_count": true,
            "max_time": true,
            "reduce_freq": true,
            "rt_backfill": true,
            "spawn_process": true,
            "time_format": true,
            "ttl": true,
            "auto_cancel": true,
            "auto_pause": true,
            "enablePreview": true,
            "adhoc_search_level": true,
            "check_risky_command": true,
            "provenance": true
        };

        // Some of the dispatch properties have shortened names
        var DISPATCH_MAPPINGS = {
            'status_buckets': 'buckets',
            'enable_lookups': 'lookups'
        };
        
        var Model = JobModel.extend(/** @lends models.DispatchJob.prototype */{
            
            getCreateOptions: function(options) {
                var createOptions = {
                    processData: true,
                    data: {
                        auto_cancel: Model.DEFAULT_AUTO_CANCEL,
                        status_buckets: 300,
                        output_mode: 'json'
                    }
                };
                options = options || {};
                $.extend(true, createOptions, options);
                
                delete createOptions.data.app;
                delete createOptions.data.owner;
                delete createOptions.data.sharing;

                _.each(createOptions.data, function(val, key) {
                    if (_.has(DISPATCHABLE_PROPERTIES, key)) {
                        createOptions.data["dispatch." + (DISPATCH_MAPPINGS[key] || key)] = val;
                        delete createOptions.data[key];
                    }
                });

                return createOptions;
            }
        },{
            DISPATCHABLE_PROPERTIES: DISPATCHABLE_PROPERTIES,
            DISPATCH_MAPPINGS: DISPATCH_MAPPINGS
        });

        return Model;
    }
);
