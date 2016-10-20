import {configManager} from 'app/util/configManager';

/*global define*/
define([
    'app/collections/ProxyBase.Collection',
    'app/models/Account'
], function (
    BaseCollection,
    Account
) {
    return BaseCollection.extend({
        url: configManager.generateEndPointUrl('account'),
        model: Account,
        initialize: function (attributes, options) {
            BaseCollection.prototype.initialize.call(this, attributes, options);
        }
    });
});
