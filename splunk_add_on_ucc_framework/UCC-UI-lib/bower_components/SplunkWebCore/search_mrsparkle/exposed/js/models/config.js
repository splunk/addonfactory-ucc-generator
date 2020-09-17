define(
    [
        'jquery',
        'splunk.config',
        'models/Base'
    ],
    function($, $C, BaseModel) {

        var Model = BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                throw new Error('invalid method: ' + method);
            }
        });
        return new Model($.extend(true, {}, $C));
    }
);