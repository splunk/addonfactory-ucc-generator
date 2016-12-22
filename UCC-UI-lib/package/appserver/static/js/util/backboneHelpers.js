import $ from 'jquery';
import {configManager} from 'app/util/configManager';
import BaseModel from 'app/models/Base.Model';
import BaseCollection from 'app/collections/ProxyBase.Collection';
import {getAddonName} from 'app/util/Util';
import {parseFuncRawStr} from 'app/util/script';
import restEndpointMap from 'app/constants/restEndpointMap';

export function generateModel(name, options = {}) {
    const {
        endpointUrl,
        fields,
        modelName,
        formDataValidatorRawStr,
        onLoadRawStr,
        shouldInvokeOnload,
        validators
    } = options;
    const {unifiedConfig: {meta}} = configManager;
    const validateFormData = parseFuncRawStr(formDataValidatorRawStr);
    const onLoad = parseFuncRawStr(onLoadRawStr);

    const optionsNeedMerge = {fields, modelName, onLoad, shouldInvokeOnload, validateFormData};

    const newModel = BaseModel.extend({
        url: name ? (meta.restRoot + '_' + name) : endpointUrl,
        initialize: function (attributes, options = {}) {
            options.appData = configManager.getAppData().toJSON();
            BaseModel.prototype.initialize.call(this, attributes, {...options, ...optionsNeedMerge});
            (validators || []).forEach(({fieldName, validator}) => {
                this.addValidation(fieldName, validator);
            });
        }
    });
    return newModel;
}

export function generateCollection(name, options = {}) {
    const {unifiedConfig: {meta}} = configManager;
    const {endpointUrl} = options;

    const collectionModel = BaseCollection.extend({
        url: name ? (meta.restRoot + '_' + name) : endpointUrl,
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
}

// TODO: check whether the collection & models is needed by using referenceName and targetFields
export function fetchServiceCollections() {
    const {unifiedConfig: {pages: {inputs}}} = configManager;
    // User may only sepecified config for configuration page.
    if (!inputs) {
        return {};
    }
    const {services} = inputs,
        collectionList = [];

    services.forEach(({name}) => {
        collectionList.push(generateCollection(
            restEndpointMap[name] ? '' : name,
            {endpointUrl: restEndpointMap[name]}
        ));
    });

    const calls = collectionList.map(d => fetchListCollection(d));

    return {deferred: $.when(...calls), collectionList};
}

export function fetchConfigurationModels() {
    //TODO: fetch all models in collection, and checke refs
    const {unifiedConfig: {pages: {configuration}}} = configManager;
}

function fetchListCollection(collection) {
    return collection.fetch({
        data: {
            sort_dir: 'asc',
            sort_key: 'name',
            count: 100,
            offset: 0,
            search: ''
        }
    });
}
