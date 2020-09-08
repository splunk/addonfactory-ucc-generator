define(
    [
        "models/services/authentication/providers/SAML",
        "collections/SplunkDsBase"
    ],
    function(SAMLModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            url: 'authentication/providers/SAML',
            model: SAMLModel
        });
    }
);