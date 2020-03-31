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

    const optionsNeedMerge = {
        fields,
        modelName,
        onLoad,
        shouldInvokeOnload,
        validateFormData
    };

    const newModel = BaseModel.extend({
        url: name ? (meta.restRoot + '_' + name) : endpointUrl,
        initialize: function (attributes, options = {}) {
            options.appData = configManager.getAppData().toJSON();
            BaseModel.prototype.initialize.call(
                this, attributes, {...options, ...optionsNeedMerge}
            );
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

function getURL(endpointURL) {
    return Splunk.util.make_url([
        "splunkd/__raw",
        endpointURL
    ].join('/'));
}

function getServerInfo() {
    return $.ajax({
        type: "GET",
        url: getURL("services/server/info?output_mode=json")
    });
}

export function fetchRefCollections() {
    const {
        unifiedConfig: {pages: {inputs, configuration: {tabs}}}
    } = configManager;
    if (!inputs && !tabs) {
        return {};
    }
 
    return getServerInfo().then((res) => {

        let is_search_head = false;
        const searchHeadArr = ['search_head','search_peer', 'cluster_search_head'];

        if (res && res.entry && res.entry.length) {
            res.entry.forEach((val) => {
                if (val && val.name == 'server-info') {
                    var roles = val.content.server_roles;
                    roles.forEach((role) => {
                        if (searchHeadArr.indexOf(role) != -1) {
                            is_search_head = true;
                        }
                    })
                }
            });
        }

        if (inputs && inputs.title.toLowerCase() == 'inputs' && is_search_head) {
            return {deferred: Promise.resolve('Trying to load Inputs page on SeachHead')}
        }

        const refCollections = _.get(inputs, 'services', []);
        // Construct configruation field to inputs mappping
        const dependencyMapping = {};
        tabs.filter(d => !!d.table).forEach(d => {
            dependencyMapping[d.name] = [];
        });
        
        refCollections.forEach(collections => {
            const {name, entity} = collections;
            const dependencyList = entity
                .filter(d => _.get(d, ['options', 'referenceName']))
                .map(
                    ({field, options: {referenceName}}) =>
                    ({targetField: field, referenceName})
                );

            if (dependencyList.length) {
                dependencyList.forEach(({referenceName}) => {
                    if (!(referenceName in dependencyList)) {
                        dependencyList[referenceName] = [];
                    }
                    dependencyMapping[referenceName].push({
                        value: generateCollection(
                            restEndpointMap[name] ? '' : name,
                            {endpointUrl: restEndpointMap[name]}
                        ),
                        dependencyList
                    });
                });
            }
        });

        const calls = _.unionWith(
            ..._.values(dependencyMapping),
            (arrVal, othVal) => {
                return arrVal.value._url === othVal.value._url;
            }
        ).map(
            ({value}) => fetchListCollection(value)
        );

        return {deferred: $.when(...calls), dependencyMapping};
    });
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
                .map(
                    ({field, options: {referenceName}}) =>
                    ({targetField: field, referenceName})
                );
            // Normal tab with referenced field
            if (dependencyList.length != 0) {
                modelObjList.push({
                    value: new (generateModel('settings', {
                        modelName: name,
                        fields: entity
                    }))({name}),
                    dependencyList
                });
            }
        }
    });
    const calls = modelObjList.map(({value}) => value.fetch());
    return {deferred: $.when(...calls), modelObjList};
}
