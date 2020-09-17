define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/SplunkDBase',
        'splunk.util',
        'util/splunkd_utils',
        'util/console'
    ],
    function($, _, Backbone, SplunkDBaseModel, splunkUtils, splunkdUtils, console) {
        /**
         * Extracts app/owner/sharing namespace from model sync options hash.
         * Delete found attributes from reference.
         *
         * @param {Object} options Hash of options typically passed with model sync functions
         * @return {Object} appOwner Hash specifying app, owner and sharing attributes (if any)
         */
        var extractAppOwner = function(options) {
            var appOwner = {};
            if (options && options.data){
                appOwner = $.extend(appOwner, {
                    app: options.data.app || undefined,
                    owner: options.data.owner || undefined,
                    sharing: options.data.sharing || undefined
                });

                delete options.data.app;
                delete options.data.owner;
                delete options.data.sharing;
            }
            return appOwner;
        };

        // saved/sourcetypes endpoint is very permissive and its whitelist of eai:attributes
        // is incomplete. So the use of splunkDWhiteList becomes unnecessary.
        // Sourcetype model uses its own Create/Update/Patch sync methods which are equivalent to
        // SplunkDBase ones except:
        // - All methods are stripped from any whitelisting round trips
        // - Create method appends required 'name' param in payload
        var syncCreate = function(model, options) {
            var url, appOwner = {}, attrs,
                bbXHR, deferredResponse = $.Deferred(),
                defaults = {
                    data: {
                        output_mode: 'json',
                        name: model.entry.get('name')   // required for POST create
                    }
                };

            url = _.isFunction(model.url) ? model.url() : model.url;
            appOwner = extractAppOwner(options);

            defaults.url = splunkdUtils.fullpath(url, appOwner);
            defaults.processData = true;
            // all model content attributes are sent to server after filtering out undefined values
            attrs = _.reduce(model.entry.content.toJSON(), function(memo, value, key) {
                if (! _.isUndefined(value)) { memo[key] = value; }
                return memo;
            }, {});
            $.extend(true, defaults.data, attrs);
            $.extend(true, defaults, options);

            bbXHR = Backbone.sync.call(this, "create", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        syncUpdate = function(model, options) {
            var url, appOwner = {}, attrs,
                bbXHR, deferredResponse = $.Deferred(),
                defaults = {
                    data: {
                        output_mode: 'json'
                    }
                };

            defaults.url = splunkdUtils.fullpath(model.id, {});
            defaults.processData = true;
            defaults.type = 'POST';
            // all model content attributes are sent to server after filtering out undefined values
            attrs = _.reduce(model.entry.content.toJSON(), function(memo, value, key) {
                if (! _.isUndefined(value)) { memo[key] = value; }
                return memo;
            }, {});
            $.extend(true, defaults.data, attrs);
            $.extend(true, defaults, options);

            // turn off client-side normalization since backend has no consistent
            // boolean normalization (e.g. default/props.conf uses a mix of true/True/1)
            //defaults.data = splunkdUtils.normalizeValuesForPOST(defaults.data);

            bbXHR = Backbone.sync.call(this, "update", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        syncPatch = function(model, options) {
            var url, appOwner = {}, attrs,
                bbXHR, deferredResponse = $.Deferred(),
                defaults = {
                    data: {
                        output_mode: 'json'
                    }
                };

            // Use caution with Patch:
            // Unlike Update which sends complete representation of model to server,
            // Patch only sends attributes passed in attrs argument in Model.save(attrs, options).
            // Backbone Model.save behavior is to set passed-in attrs on the model itself.
            // These model attrs should be ignored or unset since SplunkDBase Model's persistable
            // attributes are stored in model.entry.content.

            defaults.url = splunkdUtils.fullpath(model.id, {});
            defaults.processData = true;
            defaults.type = 'POST';
            // only passed-in attributes are sent to server after filtering out undefined values
            attrs = _.reduce(options.attrs || {}, function(memo, value, key) {
                if (! _.isUndefined(value)) { memo[key] = value; }
                return memo;
            }, {});
            $.extend(true, defaults.data, attrs);
            delete options.attrs;
            $.extend(true, defaults, options);

            // turn off client-side normalization since backend has no consistent
            // boolean normalization (e.g. default/props.conf uses a mix of true/True/1)
            //defaults.data = splunkdUtils.normalizeValuesForPOST(defaults.data);

            bbXHR = Backbone.sync.call(this, "update", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        };

        return SplunkDBaseModel.extend({
            url: 'saved/sourcetypes',
            urlRoot: 'saved/sourcetypes',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                this.FIELD_PREFIX = 'ui.';
            },
            sync: function(method, model, options) {
                // override only create/update/patch sync methods of SplunkDBaseModel
                // in order to circumvent whitelisting which is unnecessary for Sourcetype
                switch (method) {
                    case 'create':
                        return syncCreate.call(this, model, options);
                    case 'update':
                        return syncUpdate.call(this, model, options);
                    case 'patch':
                        return syncPatch.call(this, model, options);
                    default:
                        return SplunkDBaseModel.prototype.sync.apply(this, arguments);
                }
            },
            transposeToRest: function() {
                // clean up all empty values and pick only those starting with prefix
                var newAttrs = {};
                for (var attr in this.attributes) {
                    if (attr.indexOf(this.FIELD_PREFIX) === 0) {
                        var val = this.get(attr);
                        if (val === null || val === '') {
                            continue;
                        }
                        newAttrs[attr.substring(this.FIELD_PREFIX.length)] = val;
                    }
                }
                this.entry.content.set(newAttrs, {silent: true});
            },
            _onerror: function(collection, response, options) {
                // Remove 'In handler' prefix from server messages
                var messages = splunkdUtils.xhrErrorResponseParser(response, this.id);
                _.each(messages, function(msgObj) {
                    var msg = msgObj.message;
                    if (msg) {
                        var res = msg.match(/with name=(.+)\salready exists/);
                        if (res) {
                            msgObj.message = splunkUtils.sprintf(_('Sourcetype "%s" already exists. Please provide a unique name, or choose "%s" from the list of existing sourcetypes.').t(), res[1], res[1]);
                        }
                    }
                });

                this.trigger('serverValidated', false, this, messages);
            }
        });
    }
);