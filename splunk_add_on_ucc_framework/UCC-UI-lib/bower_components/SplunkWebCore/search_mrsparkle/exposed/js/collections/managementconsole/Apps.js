define([
        "collections/managementconsole/DmcsBase",
        "models/managementconsole/App"
    ],
    function(
        DmcsBaseCollection,
        AppModel
    ) {
        return DmcsBaseCollection.extend({
            url: 'dmc/apps',
            model: AppModel
        });
    }
);
