define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'util/splunkd_utils'
    ],
    function($, _, Backbone, BaseModel, splunkd_utils) {
        return BaseModel.extend({
            initialize: function(options) {
                BaseModel.prototype.initialize.call(this, options);
            },
            sync: function(method, model, options) {
                switch (method) {
                    case 'read':
                        var syncOptions = splunkd_utils.prepareSyncOptions(options, model.url);
                        if (options.data.time === ''){
                            model.set({key: '', value: ''});
                            return;
                        }
                        return Backbone.sync.call(this, 'read', model, syncOptions);
                    default:
                        throw 'Operation not supported';
                }
            },
            url: "/services/search/timeparser",
            parse:  function(response) {
                if (!response) {
                    return {};
                }
                var key = _.keys(response)[0],
                    value = response[key];
                return {
                    key: key,
                    value: value
                };
            },
            idAttribute: 'key'
        });
    }
);