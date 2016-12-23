import $ from 'jquery';
import _ from 'lodash';
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

export function fetchServiceCollections() {
    const {unifiedConfig: {pages: {inputs}}} = configManager;
    if (!inputs) {
        return {};
    }
    const {services} = inputs,
        collectionObjList = [];

    services.forEach(service => {
        const {name, entity} = service;
        const dependencyList = entity
            .filter(d => _.get(d, ['options', 'referenceName']))
            .map(({field, options: {referenceName}}) => ({targetField: field, referenceName}));

        if (dependencyList.length) {
            collectionObjList.push({
                value: generateCollection(
                    restEndpointMap[name] ? '' : name,
                    {endpointUrl: restEndpointMap[name]}
                ),
                dependencyList
            });
        }
    });

    const calls = collectionObjList.map(({value}) => fetchListCollection(value));

    return {deferred: $.when(...calls), collectionObjList};
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

export function fetchConfigurationModels() {
    const {unifiedConfig: {pages: {configuration: {tabs}}}} = configManager;

    if (!tabs) {
        return {};
    }
    const modelObjList = [];

    tabs.forEach(d => {
        const isNoramlTab = !d.table;

        if (isNoramlTab) {
            const {name, entity} = d;
            const dependencyList = entity
                .filter(d => _.get(d, ['options', 'referenceName']))
                .map(({field, options: {referenceName}}) => ({targetField: field, referenceName}));

            modelObjList.push({
                value: new (generateModel('settings', {
                    modelName: name,
                    fields: entity
                }))({name}),
                dependencyList
            });
        }
    });

    const calls = modelObjList.map(({value}) => value.fetch());
    return {deferred: $.when(...calls), modelObjList};
}
