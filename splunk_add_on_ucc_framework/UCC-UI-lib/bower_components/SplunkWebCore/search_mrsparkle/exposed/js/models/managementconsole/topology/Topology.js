
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase',
        'util/splunkd_utils'

    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel,
        splunkdutils
    ) {

        return DmcBaseModel.extend({
            urlRoot: '/services/dmc/topologies',

            sync: function(method, model, options) {
                if (method === 'create' || method === 'update') {
                    var data = this.get('data');

                    options = _.defaults(options, {
                        data: JSON.stringify(this.get('data')),
                        contentType: 'application/json'
                    });
                }

                return DmcBaseModel.prototype.sync.call(this, method, model, options);
            },

            _onerror: function(model, response, options) {

                // Current xhr response parser does not support the error format for the error from the agent.
                // For any server exception we show 'server error' even if the response has a different message.
                // The fix here is to check if we have a response with a error message and parse it manually , else
                // use the existing error parser.
                if (response && response.responseText) {
                    model.error.clear();
                    try {
                        var errorObj = JSON.parse(response.responseText), msg = errorObj.error.message;
                        if (msg) {
                            var message;
                            if (_.isObject(msg) && msg.description) {
                                if (!_.isEmpty(msg.missing_capabilities)) {
                                    if (msg.missing_capabilities.length === 1) {
                                        msg.description = msg.description + '. ' + _('Missing capability: ').t() + msg.missing_capabilities[0];
                                    } else {
                                        msg.description = msg.description + '. ' + _('Missing capabilites: ').t() + msg.missing_capabilities.join(',');
                                    }
                                }
                                message = splunkdutils.createMessageObject(splunkdutils.ERROR, msg.description);
                            } else if (_.isString(msg)) {
                                message = splunkdutils.createMessageObject(splunkdutils.ERROR, msg);
                            }

                            if (message) {
                                this.trigger('serverValidated', false, this, [message]);
                                model.error.set("messages", message);
                                return;
                            }

                        }
                    } catch (err) {}
                }
                DmcBaseModel.prototype._onerror.apply(this, arguments);
            },

            bootstrapTopology: function() {
                this.set('data', {
                    bootstrap: true,
                    interactive: true
                });
            },

            isBootstrapped: function() {
                return !_.isUndefined(this.entry.content.get('bootstrapped'));
            },

            hasTaskInProgress: function() {
                return !_.isUndefined(this.entry.content.get('task')) && this.entry.content.get('task').state === 'running';
            },

            getCurrentTaskId: function() {
                return !_.isUndefined(this.entry.content.get('task')) ? this.entry.content.get('task').taskId : null;
            }
        });
    }
);