define(
    [
        'underscore',
        'models/SplunkDBase',
        'splunk.util'
    ],
    function(_, SplunkDBaseModel, splunkUtil) {
        return SplunkDBaseModel.extend({
            urlRoot: "cluster/master/peers/",
            url: "cluster/master/peers",
            initialize: function() {
                this.peerStatuses = {
                    Up: _('Up').t(),
                    Pending: _('Pending').t(),
                    Detention: _('Detention').t(),
                    Restarting: _('Restarting').t(),
                    ShuttingDown: _('Shutting down').t(),
                    ReassigningPrimaries: _('Reassigning primaries').t(),
                    Decommissioning: _('Decommissioning').t(),
                    GracefulShutdown: _('Graceful shutdown').t(),
                    Down: _('Down').t()
                };
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            isSearchable: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('is_searchable'));
            },
            getTranslatedStatus: function() {
                var status = this.entry.content.get('status');
                return this.peerStatuses[status] || status;
            }
        });
    }
);