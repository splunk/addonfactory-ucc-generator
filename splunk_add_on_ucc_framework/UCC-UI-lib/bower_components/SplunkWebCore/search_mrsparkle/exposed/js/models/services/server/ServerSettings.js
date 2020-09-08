define(
    [
        'models/SplunkDBase'
    ],
    function (SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "server/settings",
            urlRoot: "server/settings",
            id: 'settings',
            initialize: function () {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            getSplunkHomePath: function() {
                return this.entry.content.get('SPLUNK_HOME');
            }
        });
    });