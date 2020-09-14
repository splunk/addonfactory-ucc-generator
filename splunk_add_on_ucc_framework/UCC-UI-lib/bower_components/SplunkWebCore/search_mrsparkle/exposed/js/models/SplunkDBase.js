define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'models/SplunkDWhiteList',
        'models/services/ACL',
        'models/ACLReadOnly',
        'util/splunkd_utils',
        'util/console',
        'util/general_utils'
    ],
    function($, _, Backbone, BaseModel, SplunkDWhiteList, ACLModel, ACLReadOnlyModel, splunkd_utils, console, generalUtil) {
        //private sync CRUD methods
        var syncCreate = function(model, options){
            var bbXHR, splunkDWhiteListXHR, url,
	            deferredResponse = $.Deferred(),
	            defaults = {data: {output_mode: 'json'}};

            url = _.isFunction(model.url) ? model.url() : model.url;
            splunkDWhiteListXHR = this.splunkDWhiteList.fetch({
                url: splunkd_utils.fullpath(url, {}) + '/_new',
                success: function(splunkDWhiteListModel, response) {
                    var app_and_owner = {};
                    if (options.data){
                        app_and_owner = $.extend(app_and_owner, { //JQuery purges undefined
                            app: options.data.app || undefined,
                            owner: options.data.owner || undefined,
                            sharing: options.data.sharing || undefined
                        });
                    }
                    defaults.url = splunkd_utils.fullpath(url, app_and_owner);
                    
                    defaults.processData = true;
                    $.extend(true, defaults.data, model.whiteListAttributes());
                    $.extend(true, defaults, options);
                    
                    delete defaults.data.app;
                    delete defaults.data.owner;
                    delete defaults.data.sharing;
                    
                    defaults.data = splunkd_utils.normalizeValuesForPOST(defaults.data);

                    bbXHR = Backbone.sync.call(null, "create", model, defaults);
                    bbXHR.done(function() {
                        deferredResponse.resolve.apply(deferredResponse, arguments);
                    });
                    bbXHR.fail(function() {
                        deferredResponse.reject.apply(deferredResponse, arguments);
                    });
                }
            });
            splunkDWhiteListXHR.fail(function(response, err, errMsg) {
                deferredResponse.reject.apply(deferredResponse, arguments);
                model.trigger('error', model, response);
            });
            return deferredResponse.promise();
        },
        syncRead = function(model, options){
            var bbXHR, url,
	            deferredResponse = $.Deferred(),
	            defaults = {data: {output_mode: 'json'}};

            if ((window.$C['SPLUNKD_FREE_LICENSE'] || options.isFreeLicense) && model.FREE_PAYLOAD) {
                if(options.success) {
                    options.success(model.FREE_PAYLOAD);
                }
                return deferredResponse.resolve.apply(deferredResponse, [model.FREE_PAYLOAD]);
            }

            if (model.isNew()){
                url = _.isFunction(model.url) ? model.url() : model.url;
                url += '/_new';
            } else if (model.urlRoot) {
                url = model.urlRoot +'/'+ model.id;
            } else {
                url = model.id;
            }
            
            var app_and_owner = {};
            if (options.data){
                app_and_owner = $.extend(app_and_owner, { //JQuery purges undefined
                    app: options.data.app || undefined,
                    owner: options.data.owner || undefined,
                    sharing: options.data.sharing || undefined
                });
            }
            defaults.url = splunkd_utils.fullpath(url, app_and_owner);
            
            $.extend(true, defaults, options);
            delete defaults.data.app;
            delete defaults.data.owner;
            delete defaults.data.sharing;

            bbXHR = Backbone.sync.call(this, "read", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        syncUpdate = function(model, options){
            var bbXHR, splunkDWhiteListXHR, url,
	            deferredResponse = $.Deferred(),
	            defaults = {data: {output_mode: 'json'}},
	            id = model.id;

            url = splunkd_utils.fullpath(id, {});
            var mergedOptions = $.extend(true, {}, options,
                {url: url,
                success: function(splunkDWhiteListModel) {
                    var fetchOptions = $.extend(true, {}, options);
                    $.extend(true, defaults.data, model.whiteListAttributes(fetchOptions));
                    $.extend(true, defaults, options);
                    defaults.processData = true;
                    defaults.type = 'POST';
                    defaults.url = url;

                    defaults.data = splunkd_utils.normalizeValuesForPOST(defaults.data);

                    bbXHR = Backbone.sync.call(null, "update", model, defaults);
                    bbXHR.done(function() {
                        deferredResponse.resolve.apply(deferredResponse, arguments);
                    });
                    bbXHR.fail(function() {
                        deferredResponse.reject.apply(deferredResponse, arguments);
                    });
                }
                });
            this.splunkDWhiteList.clear();
            splunkDWhiteListXHR = this.splunkDWhiteList.fetch(mergedOptions);
            splunkDWhiteListXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        syncPatch = function(model, options){
            var bbXHR, splunkDWhiteListXHR, url,
                deferredResponse = $.Deferred(),
                defaults = {data: {output_mode: 'json'}},
                id = model.id;

            /*
            * Use caution with Patch:
            * Unlike Update which sends complete representation of model to server,
            * Patch only sends attributes passed in attrs argument in Model.save(attrs, options).
            * Backbone Model.save behavior is to set passed-in attrs on the model itself.
            * These model attrs should be ignored or unset since SplunkDBase Model's persistable
            * attributes are stored in model.entry.content.
            */

            url = splunkd_utils.fullpath(id, {});
            this.splunkDWhiteList.clear();
            splunkDWhiteListXHR = this.splunkDWhiteList.fetch({
                url: url,
                success: function(splunkDWhiteListModel) {
                    $.extend(true, defaults.data, (options.attrs && model.whiteListPassedInAttributes(options.attrs)) || {});
                    delete options.attrs;
                    $.extend(true, defaults, options);
                    defaults.processData = true;
                    defaults.type = 'POST';
                    defaults.url = url;
                    
                    defaults.data = splunkd_utils.normalizeValuesForPOST(defaults.data);

                    // beyond this point, patch is equivalent to update
                    bbXHR = Backbone.sync.call(null, "update", model, defaults);
                    bbXHR.done(function() {
                        deferredResponse.resolve.apply(deferredResponse, arguments);
                    });
                    bbXHR.fail(function() {
                        deferredResponse.reject.apply(deferredResponse, arguments);
                    });
                }
            });
            splunkDWhiteListXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        syncDelete = function(model, options){
            var bbXHR,
	            deferredResponse = $.Deferred(),
	            defaults = {data: {output_mode: 'json'}};

            if(options.data && options.data.output_mode){
                //add layering of url if specified by user
                defaults.url = splunkd_utils.fullpath(model.id, {}) + '?output_mode=' + encodeURIComponent(options.data.output_mode);
                delete options.data.output_mode;
            } else {
                //add layering of url if specified by user
                defaults.url = splunkd_utils.fullpath(model.id, {}) + '?output_mode=' + encodeURIComponent(defaults.data.output_mode);
                delete defaults.data.output_mode;
            }
            $.extend(true, defaults, options);
            defaults.processData = true;

            bbXHR = Backbone.sync.call(this, "delete", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        /**
         * Default 'move' action.
         * @param model - model to move
         * @param options - moving options
         */
        syncMove = function(model, options) {
            if (!model.entry.links.get('move') && !options.url) {
                throw new Error('Move URL not provided or entity can not be moved.');
            }
            var bbXHR,
                deferredResponse = $.Deferred(),
                defaults = {
                    processData: true,
                    type: 'POST',
                    url: splunkd_utils.fullpath(model.entry.links.get('move')),
                    data: {
                        app: model.entry.acl.get('app'),
                        user: model.entry.acl.get('owner'),
                        output_mode: 'json'
                    }
                };

            options = options || {};

            $.extend(true, defaults, options);
            defaults.data = splunkd_utils.normalizeValuesForPOST(defaults.data);
            bbXHR = Backbone.sync.call(null, "update", model, defaults);

            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
                model.trigger('error', model, deferredResponse);
            });
            return deferredResponse.promise();
        };
        /**
         * @constructor
         * @memberOf models
         * @name SplunkDBase
         * @extends {models.Base}
         */
        var Model = BaseModel.extend(/** @lends models.SplunkDBase.prototype */{
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
                this.splunkDWhiteList = options && options.splunkDWhiteList ?
                        options.splunkDWhiteList : new SplunkDWhiteList();
                
                this.initializeAssociated();
                
                this.on("change:id", function() {
                    var alt = this.id;
                    if (alt) {
                        alt = alt + "/acl";
                    }
                    this.acl.set(this.acl.idAttribute, alt);
                }, this);
                
                if (options && options.splunkDPayload){
                    this.setFromSplunkD(options.splunkDPayload, {silent: true});
                }
            },
            parseSplunkDMessages: function(response) {
                var messages = BaseModel.prototype.parseSplunkDMessages.call(this, response);
                if(response && response.entry && response.entry.length > 0) {
                    messages = _.union(messages, splunkd_utils.parseMessagesObject(response.entry[0].messages));
                }
                return messages;
            },
            initializeAssociated: function() {
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};

                //instance level models
                this.links = this.links || new RootClass.Links();
                this.associated.links = this.links;
                
                this.generator = this.generator || new RootClass.Generator();
                this.associated.generator = this.generator;
                
                this.paging = this.paging || new RootClass.Paging();
                this.associated.paging = this.paging;

                //nested instance level on entry
                if (!this.entry){
                    this.entry = new RootClass.Entry();
                    $.extend(this.entry, {
                        links: new RootClass.Entry.Links(),
                        acl: new RootClass.Entry.ACL(),
                        content: new RootClass.Entry.Content(),
                        fields: new RootClass.Entry.Fields()
                    });
                    this.entry.associated.links = this.entry.links;
                    this.entry.associated.acl = this.entry.acl;
                    this.entry.associated.content = this.entry.content;
                    this.entry.associated.fields = this.entry.fields;
                }
                this.associated.entry = this.entry;
                
                //associated EAI models
                this.acl = this.acl || new ACLModel();
                this.associated.acl = this.acl;
            },
            url: '',
            sync: function(method, model, options) {
                switch(method){
                    case 'create':
                        return syncCreate.call(this, model, options);
                    case 'read':
                        return syncRead.call(this, model, options);
                    case 'update':
                        return syncUpdate.call(this, model, options);
                    case 'patch':
                        return syncPatch.call(this, model, options);
                    case 'delete':
                        return syncDelete.call(this, model, options);
                    case 'move':
                        return syncMove.call(this, model, options);
                    default:
                        throw new Error('invalid method: ' + method);
                }
            },
            move: function(data, options) {
                var defaults = {
                    wait: true,
                    move: true
                };
                options = options || {};
                $.extend(true, defaults, options);
                return this.save(data, defaults);
            },
            parse: function(response, options) {
                options = options || {};
                // make a defensive copy of response since we are going to modify it (only if we want to)
                if (!options.skipClone) {
                    response = $.extend(true, {}, response);
                }
                
                //when called from the collection fetch we will need to ensure that our
                //associated models are initialized because parse is called before
                //initialize
                this.initializeAssociated();

                if (!response || !response.entry || response.entry.length === 0) {
                    console.log('Response has no content to parse');
                    return;
                }
                var response_entry = response.entry[0];

                //id
                //this needs to be the first thing so that people can get !isNew()
                if (splunkd_utils.isExistingEntity(response)) {
                    this.set(this.idAttribute, response_entry.links.alternate);
                    response.id = response_entry.links.alternate;
                    this.acl.set(this.acl.idAttribute, this.id + '/acl');
                }

                //top-level
                this.links.set(response.links);
                delete response.links;
                this.generator.set(response.generator);
                delete response.generator;
                this.paging.set(response.paging);
                delete response.paging;

                //sub-entry
                this.entry.links.set(response_entry.links);
                delete response_entry.links;
                this.entry.acl.set(response_entry.acl);
                delete response_entry.acl;
                this.entry.content.set(response_entry.content);
                delete response_entry.content;
                
                if (response_entry.fields && response_entry.fields.wildcard) {
                    response_entry.fields.wildcard = splunkd_utils.addAnchorsToWildcardArray(response_entry.fields.wildcard);
                }
                this.entry.fields.set(response_entry.fields);
                delete response_entry.fields;
                this.entry.set(response_entry);
                delete response.entry;
                return response;
            },
            whiteListAttributes: function(fetchOptions) {
                var whiteListOptAndReq = this.splunkDWhiteList.concatOptionalRequired(),
                    whiteListWild = this.splunkDWhiteList.get('wildcard') || [],
                    contentAttrs = this.entry.content.filterByKeys(whiteListOptAndReq,
                                                                   {allowEmpty: true},
                                                                   fetchOptions);

                return _.extend(contentAttrs, this.entry.content.filterByWildcards(whiteListWild, {allowEmpty: true}, fetchOptions));
            },
            whiteListPassedInAttributes: function(attrs) {
                if (!_.isObject(attrs) || _.isEmpty(attrs)) { return {}; }
                var whiteListOptAndReq = this.splunkDWhiteList.concatOptionalRequired(),
                    whiteListWild = this.splunkDWhiteList.get('wildcard') || [],
                    filterModel = new BaseModel(attrs),    // cast object into BaseModel
                    filteredAttrs = filterModel.filterByKeys(whiteListOptAndReq, {allowEmpty: true});

                return _.extend(filteredAttrs, filterModel.filterByWildcards(whiteListWild, {allowEmpty: true}));
            },

            /**
             * Override the native save to enable passing a payload to a SplunkDBase model and have it apply
             * the save transactionally onto the model's entry.content associative model.
             * Set nativeSave : true in order to call backbones native save function
             * This method signature is the same as the signature for Backbone's native save function
             * @param {string} key
             * @param {Any} value
             * @param {Object} options
             * @memberof models.SplunkDBase
             */
            save: function(key, val, options) {
                var attributes = {},
                    originalModel = this;
                //Check format of inputs
                //Handle both "key", value and {key: value} -style arguments.
                if (key == null || _.isObject(key)) {
                    attributes = key;
                    options = val;
                } else {
                    attributes[key] = val;
                }
                options = options || {};

                //If native save is called, run Backbone native save
                if (options.nativeSave || !options.wait) {
                    return BaseModel.prototype.save.call(originalModel, attributes, options);
                }
                var clonedModel = originalModel.clone(),
                    cloneXHR,
                    deferredResponse = $.Deferred();

                //Wire up events that need to be passed to the original model
                clonedModel.error.on('change: messages', function(model, response, options){
                    originalModel.error.set({
                        'messages': model.get('messages')
                    });
                });
                clonedModel.on('error', function (model, response, options) {
                    originalModel._onerror(originalModel, response, options);
                });
                clonedModel.on('sync', function (model, response, options) {
                    originalModel._onsync(originalModel, response, options);
                });
                clonedModel.on('validated', function (model, response, options) {
                    originalModel._rebroadcastValidation(originalModel, response, options);
                });
                clonedModel.on('invalid', function (model, response, options) {
                    originalModel.trigger('invalid', originalModel, response, options);
                });
                clonedModel.on('request', function(model, response, options) {
                    originalModel.trigger('request', originalModel, response, options);
                });

                //Save original success method that is passed in
                var originalSuccess = options.success;
                var originalError = options.error;
                //Append new attributes to options
                options = _.extend({
                    validate: true,
                    wait: false
                }, options);

                options.success = function(model, response, opts){
                    var successOptions = {
                        skipClone: true
                    };

                    originalModel.setFromSplunkD(model.toSplunkD(), successOptions);
                    //Run user passed in success function
                    if (originalSuccess){
                        originalSuccess(originalModel, response, opts);
                    }
                };
                options.error = function(model, response, opts){
                    if (originalError){
                        originalError(originalModel, response, opts);
                    }
                };

                // Set attributes on the nestedModel which comes from the clone, so no change events are fired
                if (options.patch) {
                    cloneXHR =  BaseModel.prototype.save.call(clonedModel, attributes, options);
                } else if (options.move) {
                    cloneXHR = clonedModel.sync('move', clonedModel, attributes);
                } else {
                    clonedModel.entry.content.set(attributes, options);
                    cloneXHR =  BaseModel.prototype.save.call(clonedModel, null, options);

                }
                //Grab xhr and resolve for the original model
                cloneXHR.done(function() {
                    clonedModel.off();
                    deferredResponse.resolve.apply(deferredResponse, arguments);
                });
                cloneXHR.fail(function() {
                    clonedModel.off();
                    deferredResponse.reject.apply(deferredResponse, arguments);
                });
                return deferredResponse.promise();
            },

            /**
             * Set the model from a SplunkD payload.
             * @param {Object} payload, SplunkD payload
             * @param {Object} options
             * @memberof models.SplunkDBase
             */
            setFromSplunkD: function(payload, options) {
                this.attributes = {};
                options = options || {};

                // make a defensive copy of response since we are going to modify it (only if we want to)
                if (!options.skipClone) {
                    payload = $.extend(true, {}, payload);
                }

                var oldId = this.id;
                //object assignment
                if (payload) {
                    if (payload.entry && payload.entry[0]) {
                        var payload_entry = payload.entry[0];

                        if(payload_entry.links){
                            //id
                            //this needs to be the first thing so that people can get !isNew()
                            if (splunkd_utils.isExistingEntity(payload)) {
                                this.set({id: payload_entry.links.alternate}, {silent: true});
                                this.acl.set({id: payload_entry.links.alternate + "/acl"}, options);
                            }

                            this.entry.links.set(payload_entry.links, options);
                            delete payload_entry.links;
                        }

                        if(payload_entry.acl){
                            this.entry.acl.set(payload_entry.acl, options);
                            delete payload_entry.acl;
                        }
                        if(payload_entry.content){
                            this.entry.content.set(payload_entry.content, options);
                            delete payload_entry.content;
                        }
                        if(payload_entry.fields){
                            if (payload_entry.fields.wildcard) {
                                payload_entry.fields.wildcard = splunkd_utils.addAnchorsToWildcardArray(payload_entry.fields.wildcard);
                            }
                            
                            this.entry.fields.set(payload_entry.fields, options);
                            delete payload_entry.fields;
                        }

                        this.entry.set(payload_entry, options);
                        delete payload.entry;
                    }

                    if(payload.links) {
                        this.links.set(payload.links, options);
                        delete payload.links;
                    }
                    if(payload.generator) {
                        this.generator.set(payload.generator, options);
                        delete payload.generator;
                    }
                    if(payload.paging) {
                        this.paging.set(payload.paging, options);
                        delete payload.paging;
                    }

                    //reset the internal root model due to pre-init routine
                    this.set(payload, options);
                    if(this.id !== oldId) {
                        this.trigger('change:' + this.idAttribute);
                    }
                }
            },
            toSplunkD: function(options) {
                var payload = {};
                options = options || {};

                payload = $.extend(true, {}, this.toJSON());

                payload.links = $.extend(true, {}, this.links.toJSON());
                payload.generator = $.extend(true, {}, this.generator.toJSON());
                payload.paging = $.extend(true, {}, this.paging.toJSON());
                payload.entry = [$.extend(true, {}, this.entry.toJSON())];

                payload.entry[0].links = $.extend(true, {}, this.entry.links.toJSON());
                if (options.withoutId) {
                    delete payload.entry[0].links.alternate;
                }
                payload.entry[0].acl = $.extend(true, {}, this.entry.acl.toJSON());
                payload.entry[0].content = $.extend(true, {}, this.entry.content.toJSON());
                payload.entry[0].fields = $.extend(true, {}, this.entry.fields.toJSON());

                //cleanup
                delete payload.id;
                return payload;
            },
            /*
             * Given a simple object, filter it such that the only remaining keys are those that could be saved to splunkd.
             * This is accomplished by introspecting the `entry.fields` associated model that is populated by
             * the parent model's REST endpoint.
             *
             * This method does not have side effects on the model itself.
             */
            filterInputToSaveableFields: function(obj) {
                var fieldSchemaModel = this.entry.fields,
                    nonWildcardFields = (fieldSchemaModel.get('optional') || []).concat(fieldSchemaModel.get('required') || []),
                    wildcardFields = fieldSchemaModel.get('wildcard') || [],
                    filteredObject = _(obj).pick(nonWildcardFields);

                _(wildcardFields).each(function(wildcardPattern) {
                    // The wildcards are strings from the REST API, so use a try-catch in case they are not
                    // valid javascript regex syntax.
                    try {
                        _.extend(filteredObject, generalUtil.filterObjectByRegexes(obj, wildcardPattern));
                    }
                    catch(e) {
                        console.warn('Exception thrown trying to evaluate wildcard: ' + wildcardPattern);
                        console.warn(e);
                    }
                });
                return filteredObject;
            },
            /**
             * Determine if the user can POST changes to this model after the model has been fetched
             * @memberof models.SplunkDBase
             */
            canWrite: function() {
                return this.entry.acl.get('can_write') ? true : false;
            },
            /**
             * Determine if the user can delete this model after the model has been fetched
             * @memberof models.SplunkDBase
             */
            canDelete: function() {
                return this.entry.links.get("remove") ? true : false;
            },
            /**
            * Determine if the user can clone this model after the model has been fetched.
            * By default you should be able to clone any entity you can read, but savedsearches override this because of
            * the scheduler.
            * @memberof models.SplunkDBase
            */
            canClone: function() {
                return !this.isNew();
            },
            
            /**
            * Determine if model is dirty. Useful for save buttons that must be intelligent about the state of the model.
            * @param {SplunkDBaseObj} otherSplunkDBaseObj the splunkDBase object to compare this object with.
            * @param {array} whitelist an array of regex strings that will be used to determine which enntry.content attributes define the dirty state.
            *               ie. [
            *                    '^dispatch\.earliest_time$',
            *                    '^dispatch\.latest_time$',
            *                    '^dispatch\.sample_ratio',
            *                    '^display\.*$',
            *                    '^search$'
            *                ]
            * @memberof models.SplunkDBase
            */
            isDirty: function(otherSplunkDBaseObj, whitelist) {
                whitelist = whitelist || ['.*'];
                
                var thisContent = generalUtil.filterObjectByRegexes(this.entry.content.toJSON(), whitelist),
                    otherContent = generalUtil.filterObjectByRegexes(otherSplunkDBaseObj.entry.content.toJSON(), whitelist);

                return !(_.isEqual(
                    this.filterInputToSaveableFields(thisContent),
                    this.filterInputToSaveableFields(otherContent)
                ));
            }
        },
        {
            Links: BaseModel,
            Generator: BaseModel,
            Paging: BaseModel,
            Entry: BaseModel.extend(
                {
                    initialize: function() {
                        BaseModel.prototype.initialize.apply(this, arguments);
                    }
                },
                {
                    Links: BaseModel,
                    ACL: ACLReadOnlyModel,
                    Content: BaseModel,
                    Fields: BaseModel
                }
            )
        });

        return Model;
    }
);
