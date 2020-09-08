define(
    [
        "models/services/deploymentserver/DeploymentServerClient",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            url: 'deployment/server/clients',
            model: Model,
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            getClientDetails: function(hostname) {
                var hostModel = this.find(function(model) {
                    return model.entry.content.get('hostname') === hostname;
                });
                if (!hostModel) {
                    return;
                }
                return {
                    os: hostModel.getPrettyOsName(),
                    ip: hostModel.entry.content.get('ip')
                };
            }
        });
    }
);
