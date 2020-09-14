// UDP input collection
// @author: nmistry
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/UDP'
], function (
    BaseCollection,
    UDPModel
) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'udp');
        },

        model: UDPModel
    });
});
