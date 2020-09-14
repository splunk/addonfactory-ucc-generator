define(
    [
        'models/StaticIdSplunkDBase',
        'splunk.util'
    ],
    function(SplunkDBaseModel, splunkUtil) {
        return SplunkDBaseModel.extend({
            url: 'data/user-prefs',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            showInstrumentationOptInModal: function() {
                return !splunkUtil.normalizeBoolean(this.entry.content.get('hideInstrumentationOptInModal'));
            }
        },
        {
            id: 'data/user-prefs/general'
        });
    }
);