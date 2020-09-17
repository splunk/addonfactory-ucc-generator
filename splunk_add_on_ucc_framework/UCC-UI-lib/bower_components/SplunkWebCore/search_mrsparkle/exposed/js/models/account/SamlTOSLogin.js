define(
[
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'splunk.config'
],
function(
    $,
    _,
    Backbone,
    BaseModel,
    splunkConfig
) {
    return BaseModel.extend({
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
        },
        //default url member will raise if not set
        url: '/account/status',
        sync: function(method, model, options) {
            if (method!=='create') {
                throw new Error('invalid method: ' + method);
            }
            options = options || {};
            var defaults = {
                    processData: true,
                    data: {
                        accept_tos: model.get('accept_tos'),
                        samlstatus: model.get('samlstatus')
                    }
                },
                url = '/' + splunkConfig.LOCALE + _.result(model, 'url');//url = _.result(model, 'url');

            // Force full page refresh....
            var currentUrl = window.location.href.split('#')[0];
            window.location.href = currentUrl + "&accept_tos=" + defaults.data.accept_tos || '';
        }
    });
});
