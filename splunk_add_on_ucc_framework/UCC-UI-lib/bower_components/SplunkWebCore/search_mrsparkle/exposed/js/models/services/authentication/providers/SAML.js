define(
    [
        'jquery',
        'underscore',
        'models/services/data/inputs/BaseInputModel',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        BaseInputModel,
        splunkd_utils
    ) {
        return BaseInputModel.extend({
            url: 'authentication/providers/SAML',
            urlRoot: 'authentication/providers/SAML',
            isSAMLMode: false,

            initialize: function() {
                BaseInputModel.prototype.initialize.apply(this, arguments);
            },
            isNew: function() {
                // When SAML is configured - get /SAML, otherwise - /SAML/_new
                return !this.isSAMLMode;
            },
            validation: {
                'ui.entityId': [
                    {
                        required: true,
                        msg: _("Entity ID is required.").t()
                    }
                ],
                'ui.idpSSOUrl': [
                    {
                        required: true,
                        msg: _("SSO URI is required.").t()
                    }
                ]
            },

            _onerror: function(collection, response, options) {
                // Remove 'In handler' prefix from server messages
                var messages = splunkd_utils.xhrErrorResponseParser(response, this.id);

                _.each(messages, function(msgObj) {
                    if (msgObj.message) {
                        if (msgObj.message.indexOf("The following required arguments are missing:") > -1) {
                            // skip these messages as we handle validation on client side
                            delete msgObj.message;
                        }
                        if (msgObj.message.indexOf("In handler \'") > -1) {
                            msgObj.message = msgObj.message.substring( msgObj.message.indexOf("\': ")+3 );
                        }
                    }
                });

                this.trigger('serverValidated', false, this, messages);
            },

            parse: function(response, options) {
                if (response.entry.length > 0) {
                    var attr, val,
                        protocolEndpoints = response.entry[0].content.protocol_endpoints,
                        attributeAliases = response.entry[0].content.attribute_aliases;
                    for (attr in protocolEndpoints) {
                        if (protocolEndpoints.hasOwnProperty(attr)) {
                            val = protocolEndpoints[attr];
                            response.entry[0].content[attr] = val;
                        }
                    }
                    for (attr in attributeAliases) {
                        if (attributeAliases.hasOwnProperty(attr)) {
                            val = attributeAliases[attr];
                            response.entry[0].content[attr] = val;
                        }
                    }

                    // This is a hack but there is no alternative
                    response.entry[0].content.signatureAlgorithm = response.entry[0].content.signatureAlgorithm.name;
                }
                BaseInputModel.prototype.parse.apply(this, arguments);
            }
        });
    }
);