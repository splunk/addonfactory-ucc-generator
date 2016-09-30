/*global define*/
define([
    'app/collections/ProxyBase.Collection',
    'app/models/Account',
    'app/config/ContextMap'
], function (
    BaseCollection,
    Account,
    ContextMap
) {
    return BaseCollection.extend({
        url: [
            ContextMap.restRoot,
            ContextMap.account
        ].join('/'),
        model: Account,
        initialize: function (attributes, options) {
            BaseCollection.prototype.initialize.call(this, attributes, options);
        }
    });
});
