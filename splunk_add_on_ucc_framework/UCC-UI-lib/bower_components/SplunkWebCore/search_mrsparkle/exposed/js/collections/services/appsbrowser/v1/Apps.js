define(
    [
        'jquery',
        'underscore',
        'collections/Base',
        'backbone',
        'splunk.util',
        'models/services/appsbrowser/v1/App',
        'models/Base',
        'util/splunkd_utils',
        'util/general_utils'
    ],
    function($, _, BaseCollection, Backbone, splunkUtil, AppBrowserModel, BaseModel, splunkDUtils, utils) {
        return BaseCollection.extend({
            initialize: function() {
                this.initializeAssociated();
                BaseCollection.prototype.initialize.apply(this, arguments);
                this.queryProps = {};
            },
            initializeAssociated: function() {
                this.paging = this.paging || new BaseModel;
                this.error = this.error || new BaseModel;
            },
            model: AppBrowserModel,
            url: 'appsbrowser/v1/app/',
            sync: function(method, collection, options) {
                if ( method!=='read' ) {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var defaults = {
                        data: {},
                        dataType: 'json',
                        url: this._url(collection)
                    };
                $.extend(true, defaults, options);
                defaults.data = _.each(defaults.data, function(val, key) {
                    defaults.data[key] = utils.asArray(val).join(',');
                });
                return Backbone.sync.call(this, method, collection, defaults);
            },
            _onerror: function(model, response, options) {
                this.error.clear();
                if( response.responseJSON ) {
                    this.error.set(response.responseJSON);
                } else {
                    var _errors = this.error.get('errors') || [];
                    _errors.push(response['statusText']);
                    this.error.set({
                        'status': response['status'],
                        'errors': _errors 
                    });
                }
            },
            findByEntryName: function(name) {
                return this.models.find(function(model) {
                    return model.get('appid') === name;
                });
            },
            _url: function(collection) {
                var url = _.result(collection, 'url');
                var full = splunkDUtils.fullpath(url, {});
                var queryString = splunkUtil.propToQueryString(this.queryProps);
                if (queryString) {
                    full += '?' + queryString;
                }
                return full;
            },
            setLite: function() {
                this.queryProps['product'] = 'lite';
            },
            setIncludeAll: function() {
                this.queryProps['include'] = 'all';
            },
            parse: function(response, options) {
                this.error.clear();
                var results = response.results;
                delete response.results;
                this.paging.set(response);
                return results;
            }
        });
    }
);
