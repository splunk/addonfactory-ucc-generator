define(
    [
        'jquery',
        'backbone',
        'underscore',
        'models/Base',
        'util/splunkd_utils'
     ],
     function($, Backbone, _, BaseModel, splunkDUtils) {
        return BaseModel.extend({
            initialize: function(options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            concatOptionalRequired: function() {
                var optional = (this.get('optional') || []).slice(0),
                required = (this.get('required') || []).slice(0);
                return optional.concat(required);
            },
            url: '',
            sync: function(method, model, options) {
                var  defaults = {
                        data:{
                            output_mode: 'json'
                        },
                        url: _.isFunction(model.url) ? model.url() : model.url
                };
                switch(method) {
                    case 'read':
                        defaults.data = _.extend(defaults.data, options.data || {});
                        delete options.data;
                        defaults.url = splunkDUtils.fullpath(defaults.url);
                        break;
                    default:
                        throw new Error('invalid method: ' + method);
                }
                return Backbone.sync.call(this, method, model, $.extend(true, defaults, options));
            },
            parse: function(response){
                var entity = (response.entry ? $.extend(true, {}, response.entry[0]) : {}),
                data = entity.fields || {};
                
                if (data.wildcard) {
                    data.wildcard = splunkDUtils.addAnchorsToWildcardArray(data.wildcard);
                }
                
                return data;
            }
        });
    }
);
