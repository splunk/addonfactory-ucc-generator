define(function(require, exports, module) {
    var _ = require("underscore");
    var TokenAwareModel = require('./tokenawaremodel');
    var TokenSafeString = require("./tokensafestring");
    var splunkUtils = require('splunk.util');
    
    // Extends TokenAwareModel with an additional 'qualified'
    // keyword option on the set() and get() methods.
    var SearchSettingsModel = TokenAwareModel.extend(/** @lends splunkjs.mvc.SearchSettingsModel.prototype */{
        set: function(key, val, options) {
            var attrs;
            if(key == null) {
                return this;
            }
            if(typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            if(options && options.qualified && attrs.search) {
                if(attrs.search instanceof TokenSafeString) {
                    attrs.search = new TokenSafeString(splunkUtils.stripLeadingSearchCommand(attrs.search.value));
                } else {
                    attrs.search = splunkUtils.stripLeadingSearchCommand(attrs.search);
                }
            }
            return TokenAwareModel.prototype.set.call(this, attrs, options);
        },
        get: function(attribute, options) {
            var result = TokenAwareModel.prototype.get.apply(this, arguments);
            
            // We only want to add the leading search if:
            // 1. the get is for 'search'
            // 2. they explicitly asked for it to be qualified
            // 3. there is an actual search string (i.e. not an empty string)
            if(attribute === 'search' && options && options.qualified && result) {
                result = splunkUtils.addLeadingSearchCommand(result);
            }
            
            return result;
        },
        // Retained for internal backward compatibility concerns.
        resolve: function(options) {
            return this.get("search", options);
        }
    });

    /*
     * Subset of attribute names on the SearchSettingsModel that will be passed
     * through to the underlying search job that is created.
     * 
     * This list is manually collected from the combination of:
     *  * POST search/jobs
     *  * POST saved/searches/<name>/dispatch
     * You can find the various properties in the REST API reference documentation.
     */
    SearchSettingsModel.ALLOWED_ATTRIBUTES = [
        "adhoc_search_level",
        "app",
        "auto_cancel",
        "auto_finalize_ec",
        "auto_pause",
        "buckets",
        "earliest_time",
        "enable_lookups",
        "exec_mode",
        "force_bundle_replication",
        "indexedRealtime",
        "indexedRealtimeOffset",
        "latest_time",
        "label",
        "lookups",
        "max_count",
        "max_time",
        "namespace",
        "now",
        "owner",
        "preview",
        "reduce_freq",
        "reload_macros",
        "remote_server_list",
        "required_field_list",
        "rf",
        "rt_backfill",
        "rt_blocking",
        "rt_indexfilter",
        "rt_maxblocksecs",
        "rt_queue_size",
        "search",
        "search_listener",
        "search_mode",
        "spawn_process",
        "status_buckets",
        "sync_bundle_replication",
        "time_format",
        "timeout",
        "ttl",
        "sample_ratio",
        "provenance"
    ];
    
    return {
        SearchSettingsModel: SearchSettingsModel,
        // Deprecated
        SearchJob: SearchSettingsModel,
        // Deprecated
        SearchQuery: SearchSettingsModel
    };
});