// Windows Event Logs input collection
// @author: rtran
define([
    'collections/managementconsole/inputs/Base',
    'models/managementconsole/inputs/WinEventLog'
], function (
    BaseCollection,
    WinEventLogModel
) {
    return BaseCollection.extend({
        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'wineventlog');
        },

        model: WinEventLogModel
    });
});
