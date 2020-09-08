define([
    'jquery',
    'underscore',
    'backbone',
    'collections/shared/Dashboards',
    'collections/services/authorization/Roles',
    'collections/services/data/ui/Panels',
    'collections/search/Reports',
    'collections/services/data/ui/Times',
    'collections/services/configs/SearchBNFs'

], function($,
            _,
            Backbone,
            Dashboards,
            Roles,
            Panels,
            Reports,
            Times,
            SearchBNFs) {

    var fetch = function(ModelType, options) {
        options = options || {};
        var model = new ModelType();
        model.dfd = model.fetch(options);
        model.fetchData.set(options.data, {silent: true});
        model.original_count = model.fetchData.get('count');
        return model;
    };
    
    var _hashFunc = function(data) {
        try {
            return JSON.stringify(data);
        } catch (e) {
            // always return a unique string as the key for a cached model when 'data' cannot be stringified
            return _.uniqueId('cache');
        } 
    };

    var caches = {
        'dashboards': {
            get: _.memoize(function(data) {
                return fetch(Dashboards, {data: data});
            }, _hashFunc)
        },
        'panels': {
            get: _.memoize(function(data) {
                return fetch(Panels, {data: data});
            }, _hashFunc)
        },
        'roles': {
            get: _.memoize(function(data) {
                return fetch(Roles, {data: data});
            }, _hashFunc)
        },
        'reports': {
            get: _.memoize(function(data) {
                return fetch(Reports, {data: data});
            }, _hashFunc)
        },
        'times': {
            get: _.memoize(function(data) {
                return fetch(Times, {data: data});
            }, _hashFunc)
        },
        'parsedSearchBNFs': {
            get: _.memoize(function(data) {
                return fetch(SearchBNFs, {data: data, parseSyntax: true});
            }, _hashFunc)
        }
    };

    var ModelHelper = {
        getCachedModel: function(modelName, data) {
            if (_.has(caches, modelName)) {
                return caches[modelName].get(data);
            }
            else {
                throw new Error("There is no cached model '" + modelName + "'");
            }
        },
        getModel: function(modelType, data) {
            return fetch(modelType, {data: data});
        },
        getViewOnlyModel: function(model) {
            var state = model.state.toJSON();
            state.mode = 'view';
            state.editable = false;
            var viewOnlyState = new Backbone.Model(state);
            return _.extend({}, model, {
                state: viewOnlyState
            });
        }
    };
    return ModelHelper;
});