import {configManager} from 'app/util/configManager';
import BaseModel from 'app/models/Base.Model';
import BaseCollection from 'app/collections/ProxyBase.Collection';

export function generateModel(name, options) {
    // TODO: provide more features based on options paramater
    const {unifiedConfig: {meta}} = configManager;

    const newModel = BaseModel.extend({
        url: meta.restRoot + '/' + name,
        initialize: function (attributes, options) {
            options.appData = configManager.getAppData().toJSON();
            BaseModel.prototype.initialize.call(this, attributes, options);
        },
    });
    return newModel;
}

export function generateCollection(name) {
    const {unifiedConfig: {meta}} = configManager;

    const newCollection = BaseCollection.extend({
        url: meta.restRoot + '/' + name,
        model: generateModel(name),
        initialize: function (attributes, options) {
            options.appData = configManager.getAppData().toJSON();
            BaseCollection.prototype.initialize.call(this, attributes, options);
        },
    });
    return newCollection;
}
