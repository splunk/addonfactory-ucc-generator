// Monitor input collection
// @author: nmistry
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/FileAndDirectory'
], function (
    BaseCollection,
    MonitorModel
) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'monitor');
        },

        model: MonitorModel
    });
});
