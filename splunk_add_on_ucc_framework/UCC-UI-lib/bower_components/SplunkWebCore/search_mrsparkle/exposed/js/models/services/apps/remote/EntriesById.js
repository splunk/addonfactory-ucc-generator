define(
    [
        'jquery',
        'models/SplunkDBase',
        'backbone',
        'underscore',
        'util/splunkd_utils'
    ],
    function(
        $,
        BaseModel,
        Backbone,
        _,
        splunkDUtils
    ) {
        return BaseModel.extend({
            url: 'apps/remote/entriesbyid',
            sync: function(method, model, options) {
                if ( method!=='update' ) {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var url = splunkDUtils.fullpath(model.id, {}),
                    defaults = {
                        data: {
                            auth: model.entry.content.get('auth'),
                            action: model.entry.content.get('action'),
                            output_mode: 'json'
                        },
                        processData: true,
                        type: 'POST',
                        url: url 
                    };
                $.extend(true, defaults, options);
                return Backbone.sync.call(this, method, model, defaults);
            }
        });
    }
);
