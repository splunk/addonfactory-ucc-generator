define(
    [
        'models/StaticIdSplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            urlRoot: "authentication/providers/services",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },

            /**
             * Returns currently enabled authentication mode (Splunk|LDAP|SAML)
             * @returns {*}
             */
            getAuthMode: function() {
                return this.entry.content.get('active_authmodule');
            },

            // Fixes SPL-118822, id gets overwritten after fetching, which mangles the url
            sync: function(method, model, options) {
                model.id = 'active_authmodule';
                return SplunkDBaseModel.prototype.sync.call(this, method, model, options);
            }
        },
        {
            id: 'active_authmodule'
        });
    }
);