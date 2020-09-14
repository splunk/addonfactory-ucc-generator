define(
[
    'jquery',
    'underscore',
    'backbone',
    'models/Base'
],
function(
    $,
    _,
    Backbone,
    BaseModel
) {
    return BaseModel.extend({
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
        },
        //default url member will raise if not set
        url: '',
        sync: function(method, model, options) {
            if (method!=='read') {
                throw new Error('invalid method: ' + method);
            }
            options = options || {};
            var defaults = {
                    dataType: 'html'
                },
                url = _.result(model, 'url');
            defaults.url = url;
            $.extend(true, defaults, options);
            return Backbone.sync.call(this, method, model, defaults);
        },
        parse: function(response) {
            return {
                content: response
            };
        }
    });
});
