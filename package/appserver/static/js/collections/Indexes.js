import {configManager} from 'app/util/configManager';

/*global define*/
define([
    'backbone',
    'app/collections/ProxyBase.Collection'
], function (
    Backbone,
    BaseCollection
) {
    return BaseCollection.extend({
        // url: configManager.generateEndPointUrl('ta_crowdstrike_indexes'),
        url: 'ta_crowdstrike/ta_crowdstrike_indexes',
        model: Backbone.Model,
        initialize: function (attributes, options) {
            BaseCollection.prototype.initialize.call(this, attributes, options);
        }
    });
});
