define([
    'jquery',
    'underscore',
    'backbone',
    'mixins/modelcollection',
    'util/general_utils',
    'util/splunkd_utils',
    'validation/ValidationMixin'
],
function(
    $,
    _,
    Backbone,
    modelcollectionMixin,
    generalUtils,
    splunkDUtils,
    ValidationMixin
){
   /**
    * @namespace models
    */
   /**
    * @consturctor
    * @memberOf models
    * @class
    * @name Base
    * @description Base Model class for all our models.
    * Events:
    *
    *      attributeValidate:attributeName - triggered when validation has been performed on the attributeName
    *          isValid - true if the attribute has passed validation
    *          attributeName - name of the attribute being validated
    *          errorMessage - if isValid is false, then this holds the error message. Otherwise, it is empty
    *
    *      serverValidated - triggered when we get messages from the server
    *          isValid - true if the model has no server errors
    *          model - a reference to the model itself
    *          messages - a list of message objects, each containing the message content and type
    *
    * @extends {Backbone.Model}
    * @mixes validation
    */
   var BaseModel = Backbone.Model.extend(/** @lends models.Base.prototype */{
       /**
        * @param {Object} attributes
        * @param {Object} options
        */
        initialize: function(attributes, options) {
            Backbone.Model.prototype.initialize.apply(this, arguments);

            this.error = new Backbone.Model();
            this.fetchData = (options && options.fetchData) ? options.fetchData : new Backbone.Model();
            this.associated = this.associated || {};
            this.associated.error = this.error;

            this.fetchData.on('change', _.debounce(function() { this.safeFetch(); }, 0), this);
            this.on('sync', this._onsync, this);
            this.on('error', this._onerror, this);
            this.on('validated', this._rebroadcastValidation, this);
        },
        /**
        * @param {Object} options
        * Merges options into the model
        */
        fetch: function(options) {
            // merge the contents of the fetchData model into options.data
            var mergedOptions = $.extend(true, {}, {data: this.fetchData.toJSON()}, options);
            this.fetchXhr = Backbone.Model.prototype.fetch.call(this, mergedOptions);
            // on successful fetch, handle any calls to safeFetch that came in while we were in-flight
            var that = this;
            this.fetchXhr.done(function() {
                if (that.touched) {
                    that.safeFetch.apply(that, that.touched);
                }
            });
            return this.fetchXhr;
        },
        /**
         * Helper function to allow the caller to use both the deferred returned by the fetch and to pass in success
         * and error handlers. In addition, the returned Deferred only resolves, it doesn't reject. Instead, it passes
         * a boolean attribute to the Deferred's resolve handler indicating whether the request succeeded (true) or
         * failed (false).
         *
         * @param {object} options The options passed to the fetch, including success and error handlers
         * @returns {Deferred} A Deferred that normalizes the response from the fetch.
        */
        binaryPromiseFetch: function(options) {
            options || (options={});
            var deferred = $.Deferred(),
                success = options.success,
                error = options.error;
            options.success = function() {
                deferred.resolve(true);
                if (success) {
                    success.apply(this, arguments);
                }
            };
            options.error = function() {
                deferred.resolve(false);
                if (error) {
                    error.apply(this, arguments);
                }
            };
            this.fetch(options);
            return deferred;
        },
        /**
        * @param {Object} options
        */
        clear: function(options) {
            options = options || {};
            
            _.each(this.associated, function(value){
                if (value instanceof Backbone.Model){
                    value.clear(options);
                } else if (value instanceof Backbone.Collection) {
                    value.reset(null, options);
                }
            });
            
            this.error.clear(options);
            Backbone.Model.prototype.clear.call(this, options);
            
            if (options.setDefaults) {
                var defaults = _.result(this, 'defaults');
                if (defaults) {
                    this.set(defaults, options);
                }
            }
            
            return this;
        },
        clone: function(){
            var clonedModel = Backbone.Model.prototype.clone.call(this);
            _.each(this.associated, function(value, key) {
                if (value instanceof Backbone.Model) {
                    var clonedAsscModel = value.clone();
                    clonedModel[key] = clonedAsscModel;
                    clonedModel.associated[key] = clonedAsscModel;
                } else if (value instanceof Backbone.Collection) {
                    var clonedAsscCollection = new value.constructor(
                        value.map(function(model) {
                            return model.clone();
                        })
                    );
                    clonedModel[key] = clonedAsscCollection;
                    clonedModel.associated[key] = clonedAsscCollection;
                }
            });
            return clonedModel;
        },
        associatedOff: function(events, callback, context) {
            _(this.associated).each(function(associated) {
                associated.off(events, callback, context);
                if (_.isFunction(associated.associatedOff)) {
                    associated.associatedOff(events, callback, context);
                }
            }, this);
            // fetchData is not part of the associated container, but should still be unbound
            this.fetchData.off(events, callback, context);
        },
        /**
         * Use this to announce to any listeners that the model is in a valid state. This is useful in cases where the
         * model is attached to a ControlGroup and you want that ControlGroup to no longer be in the error state.
         * Note that the next time you attempt to validate the model, it will still run through its validation rules.
         */
        clearErrors: function() {
            this.trigger('serverValidated', true, this, []);
            this.trigger('validated', true, this, []);
        },

        _rebroadcastValidation: function(validated, model, error_payload) {
            // doing this union will handle the case where a previously-undefined attribute is being set with an invalid value
            var allKeys = _.union(_.keys(this.attributes), _.keys(error_payload));
            _(allKeys).each(function(k){
                this.trigger('attributeValidated:' + k, !_.has(error_payload, k), k, error_payload[k]);
            },this);
        },
        _onerror: function(model, response, options) {
            model.error.clear();
            var messages = splunkDUtils.xhrErrorResponseParser(response, this.id);
            this.trigger('serverValidated', false, this, messages);
            model.error.set("messages", messages);
        },
        _onsync: function(model, response, options) {
            model.error.clear();
            var messages = this.parseSplunkDMessages(response),
                hasErrors = _(messages).any(function(message) {
                    return (message.type === splunkDUtils.ERROR || message.type === splunkDUtils.FATAL);
                });

            this.trigger('serverValidated', !hasErrors, this, messages);
            
            if (hasErrors) {
                model.error.set("messages", messages);
            }
        },
        parseSplunkDMessages: function(response) {
            if(!response) {
                return [];
            }
            return splunkDUtils.parseMessagesObject(response.messages);
        },
        filterByKeys: function(keys, options, fetchOptions /* optional */) {
            options = options || {};

            var attrs = {},
                strip = _.isString(options.strip) ? options.strip : '',
                allowEmpty = !!options.allowEmpty;

            _.each(this.toJSON(fetchOptions), function(value, key) {
                if(_.indexOf(keys, key) != -1) {
                    if (!_.isUndefined(value)){
                        if (!(value === "") || allowEmpty){
                            attrs[key.replace(strip, '')] = value;
                        }
                    }
                }
            }, this);
            return attrs;
        },
        filterByWildcards: function(wildcards, options, fetchOptions /* optional */) {
            return generalUtils.filterObjectByRegexes(this.toJSON(fetchOptions), wildcards, options);
        },
        filterChangedByWildcards: function(wildcards, options) {
            return generalUtils.filterObjectByRegexes(this.changedAttributes() || {}, wildcards, options);
        },
        toObject: function(attr) {
            var value = this.get(attr);
            try {
                value = JSON.parse(value);
            } catch (e) {}
            return value;
        },
        replace: function(attributes, options) {
            this.clear({silent: true});
            this.set(attributes, options);
        },
        /**
         * Restore the model to its default attributes.
         * CAVEAT EMPTOR: often fires two change events, both globally and per-attribute
         * CAVEAT EMPTOR: this has not been well tested yet
         * @param {Object} options
         */
        restoreDefaults: function(options) {
            var defaults = _.isFunction(this.defaults) ? this.defaults() : this.defaults;
            this.clear(options);
            this.set(defaults, options);
        }

    });
    _.extend(BaseModel.prototype, ValidationMixin);
    _.extend(BaseModel.prototype, modelcollectionMixin);
   
   return BaseModel;
});
