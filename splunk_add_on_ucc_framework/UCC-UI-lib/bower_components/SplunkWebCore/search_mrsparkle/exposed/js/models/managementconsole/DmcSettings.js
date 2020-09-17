define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel
    ) {
        return DmcBaseModel.extend(
            {
                url: 'dmc-conf/settings/settings',

                // Have to override because none of the existing base model
                // works out of the box
                sync: function(method, model, options) {
                    var defaults = {
                        data: {
                            output_mode: 'json'
                        }
                    };

                    if (method === 'read') {
                        options = $.extend(true, defaults, options);
                    }

                    if (method === 'update') {
                        var data = $.extend(true, this.entry.content.pick('disabled', 'mode'), defaults.data);

                        // The endpoint expend normal data form input
                        options = $.extend(options, {
                            data: $.param(data)
                        });
                    }

                    return DmcBaseModel.prototype.sync.call(this, method, model, options);
                },

                isEnabled: function() {
                    var isDisabled = this.entry.content.get('disabled');
                    return _.isUndefined(isDisabled) ? false : !isDisabled;
                },

                enableForwarderManagement: function() {
                    this.entry.content.set({
                        disabled: false,
                        mode: 'forwarder_management'
                    });
                },

                disableForwarderManagement: function() {
                    this.entry.content.set({
                        disabled: true
                    });
                },

                fetch: function(options){
                    var that = this;
                    var deferred = $.Deferred();
                    var dfd = DmcBaseModel.prototype.fetch.call(this, options);
                    dfd.done(function() {
                        deferred.resolve();
                    }).fail(function() {
                        deferred.resolve();
                        that.entry.content.set('disabled', true);
                    });
                    return deferred;
                }
            }
        );
    }
);
