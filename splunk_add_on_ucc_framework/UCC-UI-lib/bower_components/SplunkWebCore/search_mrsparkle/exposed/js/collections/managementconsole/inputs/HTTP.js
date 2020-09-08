// HTTP input collection
// @author: nmistry
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/HTTP'
], function (
    BaseCollection,
    HTTPModel
) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'http');
        },

        model: HTTPModel
    });
});
