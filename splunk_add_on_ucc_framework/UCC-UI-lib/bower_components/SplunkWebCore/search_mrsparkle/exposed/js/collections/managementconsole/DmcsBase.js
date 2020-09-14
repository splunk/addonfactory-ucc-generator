define([
        'jquery',
        'underscore',
        'backbone',
        'collections/SplunkDsBase',
        'models/managementconsole/DmcBase'
    ],
    function(
        $,
        _,
        Backbone,
        SplunkDsBaseCollection,
        DmcBaseModel
    ) {
        return SplunkDsBaseCollection.extend({
            model: DmcBaseModel,
            _canRead: true,

            canCreate: function() {
                return this.links.has('create');
            },

            canRead: function() {
                return this._canRead;
            },

            sync: function(method) {
                var dfd = SplunkDsBaseCollection.prototype.sync.apply(this, arguments);

                if (method === 'read') {
                    return dfd.fail(function(resp) {
                        this._canRead = resp.status !== 403;
                    }.bind(this));
                }

                return dfd;
            }
        });
    }
);
