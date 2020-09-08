define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        splunkdutils
    ) 
    {
        return BaseModel.extend({
            url: '',
            initialize: function(data, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                if (method!=='read') {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var appOwner = {},
                    defaults = {data: {}},
                    url = _.isFunction(model.url) ? model.url() : model.url || model.id;
                if(options.data){
                    appOwner = $.extend(appOwner, { //JQuery purges undefined
                        app: options.data.app || undefined,
                        owner: options.data.owner || undefined,
                        sharing: options.data.sharing || undefined
                    });
                    switch (options.data.output_mode) {
                        case 'csv':
                            defaults.dataType = 'text';
                            break;
                        case 'xml':
                            defaults.dataType = 'text';
                            break;
                        default:
                            defaults.data.output_mode = 'json';
                            break;
                    }
                }
                defaults.url = splunkdutils.fullpath(url, appOwner);
                $.extend(true, defaults, options);
                delete defaults.data.app;
                delete defaults.data.owner;
                delete defaults.data.sharing;
                return Backbone.sync.call(this, method, model, defaults);
            },
            parse: function(response) {
                return {raw: response};
            }
        });
    }
);