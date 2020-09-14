/***
 *
 * TODO: lots of repeated code here and in the base model for broadcasting errors, safe fetch, and the fetch data model
 *       consider one or more mixins
 *
 * TODO: potential memory leaks when binding to events on the fetchData model, do we need a hook for disposing of collections?
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'mixins/modelcollection',
        'models/Base',
        'splunk.util',
        'util/splunkd_utils'
    ],
    function($, _, Backbone, modelcollectionMixin, Base, splunkUtils, splunkDUtils) {
        /**
         * @namespace collections
         */
        /**
         * @constructor
         * @memberOf collections
         * @name Base
         * @description A base collection with some generic useful methods/behaviors
         * @extends {Backbone.Collection}
         * @mixes modelcollection
         */
        var BaseCollection = Backbone.Collection.extend(/** @lends collections.Base.prototype */{
            initialize: function(models, options) {
                Backbone.Collection.prototype.initialize.apply(this, arguments);

                this.fetchData = (options && options.fetchData) ? options.fetchData : new Base();
                this.fetchData.on('change', _.debounce(function() { this.safeFetch(); }, 0), this);
                this.associated = this.associated || {};
                this.on('sync', this._onsync, this);
                this.on('error', this._onerror, this);
                this.on('reset', this.previousModelsOff, this);
            },
            fetch: function(options) {
                // merge the contents of the fetchData model into options.data
                var mergedOptions = this.getMergedOptions(options);
                this.fetchXhr = Backbone.Collection.prototype.fetch.call(this, mergedOptions);
                // on successful fetch, handle any calls to safeFetch that came in while we were in-flight
                var that = this;
                this.fetchXhr.done(function() {
                    if(that.touched) {
                        that.safeFetch.apply(that, that.touched);
                    }
                });
                return this.fetchXhr;
            },
            _onerror: function(collection, response, options) {
                var messages = splunkDUtils.xhrErrorResponseParser(response, this.id);
                this.trigger('serverValidated', false, this, messages);
            },
            _onsync: function(collection, response, options) {
                var messages  = this.parseSplunkDMessages(response),
                    hasErrors = _(messages).any(function(message) {
                        return (message.type === splunkDUtils.ERROR || message.type === splunkDUtils.FATAL);
                    });
                this.trigger('serverValidated', !hasErrors, this, messages);
            },
            parseSplunkDMessages: function(response) {
                if(!response) {
                    return [];
                }
                return splunkDUtils.parseMessagesObject(response.messages);
            },
            deepOff: function() {
                modelcollectionMixin.deepOff.apply(this, arguments);
                this.each(function(model) {
                    if (_.isFunction(model.deepOff)) {
                        model.deepOff();
                    }
                });
            },
            associatedOff: function(events, callback, context) {
                _(this.associated).each(function(associated) {
                    associated.off(events, callback, context);
                    if(_.isFunction(associated.associatedOff)) {
                        associated.associatedOff(events, callback, context);
                    }
                }, this);
                
                this.each(function(model) {
                    if(_.isFunction(model.associatedOff)) {
                        model.associatedOff(events, callback, context);
                    }
                });
                // fetchData is not part of the associated container, but should still be unbound
                this.fetchData.off(events, callback, context);
            },
            previousModelsOff: function(models, options) {
                _(options.previousModels).each(function(model) {
                    if (_.isFunction(model.deepOff)) {
                        model.deepOff();
                    }
                });
            },
            reverse: function(options) {
                options || (options = {});
                var reversedModels = [].concat(this.models).reverse();
                if (options.mutate===false) {
                    return reversedModels;
                }
                this.reset(reversedModels, options);
            },
            isValid: function(options) {
                return this.all(function(model) { return model.isValid(options); });
            },
            // Backbone's collection clone makes a shallow copy (the models are shared references)
            // this version will clone each model and put the clones in the new collection
            deepClone: function() {
                return new this.constructor(this.invoke('clone'));
            },
            clearErrors: function() {
                this.trigger('serverValidated', true, this, []);
            },
            getMergedOptions: function(options) {
                return $.extend(true, {}, {data: this.fetchData.toJSON()}, options);
            }
        });
        _.extend(BaseCollection.prototype, modelcollectionMixin);
        
        return BaseCollection;
    }
);
