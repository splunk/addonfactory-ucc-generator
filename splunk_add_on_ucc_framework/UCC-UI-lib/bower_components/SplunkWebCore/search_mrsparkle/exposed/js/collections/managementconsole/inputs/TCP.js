// TCP input collection
// @author: nmistry
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/TCP'
], function (
    BaseCollection,
    TCPModel

) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'tcp');
        },

        model: TCPModel
    });
});
