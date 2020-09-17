/**
 * Model of Opt In Modal
 */
define(
    [
        'underscore',
        'models/Base',
        'util/splunkd_utils'
    ],
    function(_, BaseModel, splunkd_utils) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            url: function() {
                return splunkd_utils.fullpath('admin/telemetry/general', {
                    app: 'splunk_instrumentation',
                    owner: 'nobody'
                });
            }
        });
    }
);