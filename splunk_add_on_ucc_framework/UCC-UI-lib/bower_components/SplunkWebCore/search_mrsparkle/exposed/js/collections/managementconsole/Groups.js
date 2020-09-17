define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/managementconsole/DmcsBase',
        'models/managementconsole/Group'
    ],
    function(
        $,
        _,
        Backbone,
        DmcsBaseCollection,
        Group
    ) {
        return DmcsBaseCollection.extend({
            url: '/services/dmc/groups',
            model: Group
        });
    }
);
