define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/managementconsole/DmcsBase',
        'models/managementconsole/Configuration'
    ],
    function(
        $,
        _,
        Backbone,
        DmcsBaseCollection,
        ConfigurationModel
    ) {
        return DmcsBaseCollection.extend({
            model: ConfigurationModel
        });
    }
);
