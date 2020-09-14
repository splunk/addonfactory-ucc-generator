// HTTP input collection
// @author: lbudchenko
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/Script'
], function (
    BaseCollection,
    EntityModel
) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'script');
        },

        model: EntityModel
    });
});
