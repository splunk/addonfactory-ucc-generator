define(
    [
        'jquery',
        'underscore',
        'collections/Base',
        'splunk.util',
        'models/Base',
        'util/splunkd_utils'
    ],
    function($, _, BaseCollection, splunkUtil, BaseModel, splunkDUtils) {
        var BLACKLIST  = {
            'cert_status': [
                {
                    'label': 'Certified',
                    'value': 'certified'
                }
            ],
            'version': 'skip',
            'platform': 'skip'
        };
        return BaseCollection.extend({
            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },
            model: BaseModel,
            url: 'appsbrowser/v1/app/options/',
            sync: function(method, collection, options) {
                if ( method!=='read' ) {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var url = _.result(collection, 'url');
                url = splunkDUtils.fullpath(url, {});
                var defaults = {
                        data: {},
                        dataType: 'json',
                        url: url 
                    };
                $.extend(true, defaults, options);
                return BaseCollection.prototype.sync.call(this, method, collection, defaults);
            },
            parse: function(response, options) {
                for (var i = 0; i < response.length; i++) {
                    if ( BLACKLIST[response[i].key] === 'skip' ) {
                        response.splice(i, 1);
                        i--;
                    } else if ( BLACKLIST[response[i].key] ) {
                        response[i].options = BLACKLIST[response[i].key];
                    } else {
                        response[i].options = _.map(
                                response[i].options, 
                                function(o) {
                                    if( o.key && o.label ) {
                                        return {value: o.key, label: o.label};
                                    } else {
                                        return {value: o, label: o};
                                    }
                                },
                                this
                             );
                    }
                }
                return response;
            }
        });
    }
);
