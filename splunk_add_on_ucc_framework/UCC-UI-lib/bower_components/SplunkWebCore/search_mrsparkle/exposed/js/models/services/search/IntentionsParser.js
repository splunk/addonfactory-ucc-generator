/**
 * @author sfishel
 *
 * Model representation of the intentions parser endpoint.
 *
 * The endpoint is still in flux, so there is a little hackery here to try to expose the interface we will eventually have
 * from splunkd but don't have yet.
 *
 * Sample REST response:

   {
        "remoteSearch": "litsearch * | eval  myfield = 10  | search somefield = somevalue  | addinfo  type=count label=prereport_events | fields  keepcolorder=t \"_bkt\" \"_cd\" \"_si\" \"host\" \"index\" \"linecount\" \"prestats_reserved_*\" \"psrsvd_*\" \"source\" \"sourcetype\" \"splunk_server\"  | remotetl  nb=300 et=2147483647.000000 lt=0.000000 max_count=1000 max_prefetch=100 | prestats  count",
        "remoteTimeOrdered": true,
        "eventsSearch": "search *   | eval myfield = 10  | search somefield = somevalue ",
        "eventsTimeOrdered": true,
        "eventsStreaming": true,
        "reportsSearch": "stats  count",
        "canSummarize": false,
        "commands": [
            {
                "command": "search",
                "rawargs": "*  ",
                "pipeline": "streaming",
                "args": {
                    "search": [
                        "*"
                    ]
                },
                "isGenerating": true,
                "streamType": "SP_STREAM"
            },
            {
                "command": "eval",
                "rawargs": "myfield = 10 ",
                "pipeline": "streaming",
                "args": " myfield = 10 ",
                "isGenerating": false,
                "streamType": "SP_STREAM"
            },
            {
                "command": "search",
                "rawargs": "somefield = somevalue ",
                "pipeline": "streaming",
                "args": {
                    "search": [
                        "somefield = somevalue "
                    ]
                },
                "isGenerating": false,
                "streamType": "SP_STREAM"
            },
            {
                "command": "stats",
                "rawargs": "count",
                "pipeline": "report",
                "args": {
                    "stat-specifiers": [
                        {
                            "function": "count",
                            "rename": "count"
                        }
                    ]
                },
                "isGenerating": false,
                "streamType": "SP_STREAMREPORT",
                "isStreamingOpRequired": false,
                "preStreamingOp": "prestats count"
            }
        ]
    }
 */

define([
            'jquery',
            'underscore',
            'backbone',
            'models/Base',
            'util/splunkd_utils',
            'splunk.util'
        ],
        function(
            $,
            _,
            Backbone,
            Base,
            splunkDUtils,
            splunkUtils
        ) {

    var DELIMITER = ':!:';

    return Base.extend({

        url: 'search/intentionsparser',

        sync: function(method, model, options) {
            if(method !== 'read') {
                throw new Error('Sync operation not supported: ' + method);
            }

            options = $.extend(true, {}, options);
            // these URLs can be quite long, so we make this request by POST
            options.type = 'POST';
            var data = options.data;
            if(_.isArray(data.field)) {
                data.field = data.field.join(DELIMITER);
                data.value = data.value.join(DELIMITER);
            }

            // TEMPORARY: currently a different endpoint has to be used if you just want to parse the search with no action
            // eventually they will be unified in the same endpoint so we just switch the URL here for the time being
            var url = (options.data && options.data.action) ? model.url : 'search/parser',
                syncOptions = splunkDUtils.prepareSyncOptions(options, url);

            if(syncOptions.data && syncOptions.data.q) {
                syncOptions.data.q = splunkUtils.addLeadingSearchCommand(syncOptions.data.q, true);
            }

            return Base.prototype.sync.call(this, 'read', model, syncOptions);
        },
        
        fullSearch: function() {
            var fullSearch = this.get('fullSearch');
            
            if(fullSearch) {
                return splunkUtils.stripLeadingSearchCommand(fullSearch);
            }
            var reportsSearch = this.get('reportsSearch') || '',
                eventsSearch = splunkUtils.stripLeadingSearchCommand(this.get('eventsSearch') || '');
            if (reportsSearch) {
                reportsSearch = ' | ' + reportsSearch;
            }
            return eventsSearch + reportsSearch;
        },

        isReportsSearch: function() {
            var reportsSearch = this.get('reportsSearch');
            return reportsSearch ? true : false;
        }

    });

});
