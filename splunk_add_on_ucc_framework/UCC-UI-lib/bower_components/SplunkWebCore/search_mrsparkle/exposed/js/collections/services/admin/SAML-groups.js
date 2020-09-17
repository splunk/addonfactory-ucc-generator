define(
    [
        "models/services/admin/SAML-groups",
        "collections/SplunkDsBase"
    ],
    function(SAMLGroupsModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            url: 'admin/SAML-groups',
            model: SAMLGroupsModel
        });
    }
);