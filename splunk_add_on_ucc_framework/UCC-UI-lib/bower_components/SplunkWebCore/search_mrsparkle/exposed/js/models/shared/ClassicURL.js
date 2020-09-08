define(
    [
        'jquery',
        'underscore',
        'splunk.util',
        'backbone',
        'models/Base',
        'util/router_utils',
        'util/console'
    ],
    function($, _, util, Backbone, BaseModel, routerUtils, console) {

        var ClassicURLModel = BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            isNew: function() {
                return false;  
            },
            sync: function(method, model, options) {
                if (!Backbone.History.started) {
                    console.warn("Backbone History hasn't started yet!");
                }
                var resp,
                    state,
                    dfd = $.Deferred();
                options = options || {};

                var silentClear = options.silentClear;
                var replaceState = options.replaceState;

                delete options.silentClear;
                delete options.replaceState;

                if (silentClear) {
                    model.clear({silent: true});
                }

                if (method === 'read') {
                    resp = model.currentQueryString();
                } else if (method === 'update') {
                    state = model.encode(options);
                    if (replaceState) {
                        model.replaceState(state, options);
                    } else {
                        model.pushState(state, options);
                    }
                    resp = this.currentQueryString();
                } else if (method === 'delete') {
                    this.pushState('', options);
                    resp = this.currentQueryString();
                } else {
                    throw new Error('invalid method: ' + method);
                }

                model.trigger('request', model, dfd, options);
                options.success(resp);
                return dfd.resolve().promise();
            },
            parse: function(response) {
                var urlQueryParameters = this.decode(response);

                /*
                 * Insert undefined values for each old attribute that
                 * is not specified in the new query parameters.
                 *
                 * That way, attributes missing from the new URL will
                 * be blanked out appropriately.
                 */
                var newAttributesWithBlanks = _.clone(this.attributes);
                _.each(newAttributesWithBlanks, function(value, key) {
                    newAttributesWithBlanks[key] = undefined;
                });
                _.extend(newAttributesWithBlanks, urlQueryParameters);

                return newAttributesWithBlanks;
            },
            /**
             * Convert the model to a query string
             * @param  {Object} options
             *         * preserveEmptyStrings: if a string is empty, still encode it in
             *         the query string. Defaults to true.
             *
             * @return {String} The model encoded as a query string.
             */
            encode: function(options) {
                var queryArray = [], encodedKey;
                _.each(this.toJSON(), function(value, key) {
                    if (_.isUndefined(value)) {
                        return;
                    }

                    if (value === "" && options && options.preserveEmptyStrings === false) {
                        return;
                    }

                    encodedKey = encodeURIComponent(key);
                    if (_.isObject(value)) {
                        console.error('Non-primitive values are not allowed in the query string: ', value);
                        throw new Error('Non-primitive values are not allowed in the query string');
                    } else {
                        queryArray.push(encodedKey + '=' + encodeURIComponent(value));
                    }
                });
                return queryArray.join('&');
            },
            decode: function(queryString) {
                return util.queryStringToProp(queryString);
            },
            currentQueryString: function() {
                var fragment;
                if (Backbone.history._hasPushState) {
                    return window.location.href.split('?')[1] || '';//not safe to read directly
                }
                fragment = Backbone.history.getFragment(window.location.href.split('#')[1] || '');//not safe to read directly
                return fragment.split('?')[1] || '';
            },
            pushState: function(data, options) {
                if (data) {
                    data = '?' + data;
                }
                Backbone.history.navigate(this.root() + data, $.extend(true, {}, options, {replace: false}));
            },
            replaceState: function(data, options) {
                if (data) {
                    data = '?' + data;
                }
                Backbone.history.navigate(this.root() + data, $.extend(true, {}, options, {replace: true}));
            },
            root: function() {
                return Backbone.history._hasPushState ? window.location.pathname :
                    '#' + routerUtils.strip_route(window.location.pathname);
            }
        });

        return ClassicURLModel;
    }
);
