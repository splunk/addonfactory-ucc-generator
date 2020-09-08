// Windows Performance Monitoring Logs input collection
// @author: rtran
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/PerfMon'
], function (
    BaseCollection,
    PerfMonModel
) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'perfmon');
        },

        model: PerfMonModel
    });
});
