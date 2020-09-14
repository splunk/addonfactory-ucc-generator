define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/Change'
    ],
    function(
        $,
        _,
        Backbone,
        ChangeModel
    ) {
        return ChangeModel.extend(
            {
                urlRoot: '/services/dmc/audit',

                isPending: function() {
                    return false;
                }
            }
        );
    }
);