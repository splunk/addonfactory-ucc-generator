import {configManager} from 'app/util/configManager';
import BaseModel from 'app/models/Base.Model';
import BaseCollection from 'app/collections/ProxyBase.Collection';
import {getAddonName} from 'app/util/Util';

export function generateModel(name, options = {}) {
    const {
        customizedUrl,
        fields,
        modelName,
        formDataValidatorRawStr,
        onLoadRawStr,
        validators
    } = options;
    const {unifiedConfig: {meta}} = configManager;

    let validateFormData, onLoad;
    try {
        if (formDataValidatorRawStr) {
            validateFormData = eval(`(${formDataValidatorRawStr})`);
        }
        if (onLoadRawStr) {
            onLoad = eval(`(${onLoadRawStr})`);
        }
    } catch (e) {
        // No need for error prompt here, if there is some thing wrong,
        // such as the raw str is not a function, it will be found in the early stage.
    }
    const optionsNeedMerge = {fields, modelName, onLoad, validateFormData};

    const newModel = BaseModel.extend({
        url: name ? (meta.restRoot + '_' + name) : customizedUrl,
        initialize: function (attributes, options = {}) {
            options.appData = configManager.getAppData().toJSON();
            BaseModel.prototype.initialize.call(this, attributes, {...options, ...optionsNeedMerge});
            (validators || []).forEach(({fieldName, validator}) => {
                this.addValidation(fieldName, validator);
            });
        }
    });
    return newModel;
};

export function generateCollection(name, options = {}) {
    const {unifiedConfig: {meta}} = configManager;
    const {customizedUrl} = options;

    const collectionModel = BaseCollection.extend({
        url: name ? (meta.restRoot + '_' + name) : customizedUrl,
        model: generateModel(name, options),
        initialize: function (attributes, options = {}) {
            options.appData = configManager.getAppData().toJSON();
            BaseCollection.prototype.initialize.call(this, attributes, options);
        }
    });
    return new collectionModel([], {
        targetApp: getAddonName(),
        targetOwner: 'nobody'
    });
};
