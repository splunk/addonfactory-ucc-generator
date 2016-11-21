import {configManager} from 'app/util/configManager';
import BaseModel from 'app/models/Base.Model';
import BaseCollection from 'app/collections/ProxyBase.Collection';

export function generateModel(name, options = {}) {
    const {customizedUrl, validators} = options;
    const {unifiedConfig: {meta}} = configManager;

    const newModel = BaseModel.extend({
        url: name ? (meta.restRoot + '/' + name) : customizedUrl, 
        initialize: function (attributes, options = {}) {
            options.appData = configManager.getAppData().toJSON();
            BaseModel.prototype.initialize.call(this, attributes, options);
            (validators || []).forEach(({fieldName, validator}) => {
                this.addValidation(fieldName, validator);
            });
        },
    });
    return newModel;
};

export function generateCollection(name, options = {}) {
    const {unifiedConfig: {meta}} = configManager;
    const {customizedUrl} = options;

    const newCollection = BaseCollection.extend({
        url: name ? (meta.restRoot + '/' + name) : customizedUrl,
        model: generateModel(name, options),
        initialize: function (attributes, options = {}) {
            options.appData = configManager.getAppData().toJSON();
            BaseCollection.prototype.initialize.call(this, attributes, options);
        },
    });
    return newCollection;
};
