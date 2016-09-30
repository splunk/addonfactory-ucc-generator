/*global define*/
define([
    'backbone',
    'app/collections/ProxyBase.Collection',
    'app/config/ContextMap'
], function (
    Backbone,
    BaseCollection,
    ContextMap
) {
    return BaseCollection.extend({
        url: [
            ContextMap.restRoot,
            ContextMap.index
        ].join('/'),
        model: Backbone.Model,
        initialize: function (attributes, options) {
            BaseCollection.prototype.initialize.call(this, attributes, options);
        }
    });
});
