define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        splunkd_utils
    ) {
        return BaseModel.extend({
            initialize: function () {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function (method, model, options) {
                var defaults = {
                  attr: {},
                  processData: true,
                  type: 'POST',
                  contentType: 'application/json'
                };

                switch(method){
                    case 'create':
                    case 'update':
                    {
                        var url = splunkd_utils.fullpath(model.id, {});
                        defaults.url = splunkd_utils.fullpath(url);
                        $.extend(true, defaults, options);
                        return BaseModel.prototype.sync(method, model, defaults);
                    }
                    default:
                        throw new Error('invalid method: ' + method);
                }
            }
        });
    }
);