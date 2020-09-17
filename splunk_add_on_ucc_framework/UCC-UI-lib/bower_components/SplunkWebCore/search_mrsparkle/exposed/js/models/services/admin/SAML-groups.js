define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
        ) {
        return BaseModel.extend({
            url: 'admin/SAML-groups',
            urlRoot: 'admin/SAML-groups',

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                // without this option the UI appends a suffix to array field names, i.e. 'logs' becomes 'logs[]'
                // which is not liked by input endpoints
                options = options || {};
                if (method === 'update' || method === 'create') {
                    options.traditional = true;
                }
                return BaseModel.prototype.sync.call(this, method, model, options);
            }
        });
    }
);