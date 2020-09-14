define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/AuditLog',
        'collections/managementconsole/Changes'
    ],
    function(
        $,
        _,
        Backbone,
        AuditLogModel,
        ChangesCollection
    ) {
        return ChangesCollection.extend(
            {
                model: AuditLogModel,
                url: '/services/dmc/audit',

                isPendingOnly: function() {
                    return false;
                },

                isDeployedOnly: function() {
                    return true;
                },

                canSort: function() {
                    return false;
                }
            }
        );
    }
);