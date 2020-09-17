// Base input collection
// @author: nmistry
define([
    'collections/managementconsole/DMCsContextualBase'
], function (
    DMCContextualBaseCollection
) {
    return DMCContextualBaseCollection.extend({
        urlRoot: 'dmc/config/inputs'
    });
});
