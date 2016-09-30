/*global define*/
define([
    'app/collections/ProxyBase.Collection',
    'app/models/Input',
    'app/config/ContextMap'
], function (
    BaseCollection,
    Input,
    ContextMap
) {
    return BaseCollection.extend({
        url: [
            ContextMap.restRoot,
            ContextMap.input
        ].join('/'),
        model: Input,
        initialize: function (attributes, options) {
            BaseCollection.prototype.initialize.call(this, attributes, options);
        }
    });
});
