define([
    'collections/managementconsole/DMCsContextualBase',
    'models/managementconsole/Output'
], function OutputsCollection(
    DMCContextualBaseCollection,
    Output
) {
    return DMCContextualBaseCollection.extend({
        urlRoot: 'dmc/config/outputs',

        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'tcpout-group'); 
        },
        model: Output
    });
});
