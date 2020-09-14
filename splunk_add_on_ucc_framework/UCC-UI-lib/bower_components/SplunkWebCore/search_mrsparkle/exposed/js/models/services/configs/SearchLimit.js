/**
 * @author claral
 * @date 8/19/2015
 *
 * Model to store the values of limits.conf search stanza.
 *
 */
 define([
    'jquery',
    'underscore',
    'models/StaticIdSplunkDBase',
    'splunk.util'
],
    function(
        $,
        _,
        SplunkDBaseModel,
        splunkUtil
        ) {
        
        return SplunkDBaseModel.extend({
            urlRoot: "configs/conf-limits",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.call(this, arguments);
            },
            parse: function(response, options) {
                response = $.extend(true, {}, response);
                //set the value of 'unified_search' to 0 if it is not specified.
                if (response && response.entry && response.entry.length > 0 &&
                    response.entry[0].content && _(response.entry[0].content.unified_search).isUndefined()) {
                    response.entry[0].content.unified_search = 0;
                }
                return SplunkDBaseModel.prototype.parse.call(this, response);
            },
            getUnifiedSearch: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('unified_search'));
            }
        },
        {
            id: 'search'
        });
    });
