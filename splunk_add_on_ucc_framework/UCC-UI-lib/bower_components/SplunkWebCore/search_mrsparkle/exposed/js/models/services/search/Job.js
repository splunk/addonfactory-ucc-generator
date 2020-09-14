// TODO: a lot of repeated code here and SplunkDBaseV2, consider making this a subclass of SplunkDBaseV2

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'models/config',
        'models/ACLReadOnly',
        'models/services/ACL',
        'models/services/search/jobs/Control',
        'util/splunkd_utils',
        'util/general_utils',
        'splunk.util',
        'util/console'
    ],
    function($, _, Backbone, BaseModel, configModel, ACLReadOnlyModel, ACLModel, ControlModel, splunkd_utils, general_utils, splunkUtil, console) {

        //private sync CRUD methods
        var syncCreate = function(model, options){
            var rootOptions = options,
                rootModel = model,
                deferredResponse = $.Deferred(),
                createModel = new BaseModel(),
                fetchModel = new BaseModel(),
                app_and_owner = {};
                
            options = options || {};
            options.data = options.data || {};
            app_and_owner = $.extend(app_and_owner, { //JQuery purges undefined
                app: options.data.app || undefined,
                owner: options.data.owner || undefined,
                sharing: options.data.sharing || undefined
            });
            
            var url = splunkd_utils.fullpath(model.url, app_and_owner),
                saveOptions = model.getCreateOptions(options);

            //reset options.data to only the app and owner
            options.data = $.extend(true, {}, app_and_owner);

            model.trigger('request', model, deferredResponse, options);

            saveOptions.url = saveOptions.url || url;
            saveOptions.success = function(createModel, response, options) {
                // need an id so that in case of an empty response we don't blow up
                rootModel.set('id', createModel.get('sid'));
                var fetchDeferred = fetchModel.fetch({
                    url: url + "/" + encodeURIComponent(createModel.get("sid")),
                    data: {
                        output_mode: "json"
                    },
                    success: function(fetchModel, response, options) {
                        rootOptions.success(response);
                    },
                    error: function(fetchModel, response, options) {
                        rootOptions.error(response);
                    }
                });
                fetchDeferred.done(function() {
                    deferredResponse.resolve.apply(deferredResponse, arguments);
                });
                fetchDeferred.fail(function() {
                    deferredResponse.reject.apply(deferredResponse, arguments);
                });
            };

            saveOptions.error = function(createModel, response, options) {
                rootOptions.error(response);
            };

            //TODO: Maybe we should be faithful to SplunkD here and make it the consumer's responsibility to fetch after create
            //this would mean that parse would need to handle the sid only payload and the full object payload
            var  createDeferred = createModel.save({}, saveOptions);
            createDeferred.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
            return deferredResponse.promise();
        },
        syncRead = function(model, options){
            var defaults = {
                    data: {
                        output_mode: 'json'
                    }
                },
                app_and_owner = {};

            if (model.isNew()){
                throw new Error('You cannot read a job without an id.');
            }
            
            if (options && options.data){
                app_and_owner = $.extend(app_and_owner, { //JQuery purges undefined
                    app: options.data.app || undefined,
                    owner: options.data.owner || undefined,
                    sharing: options.data.sharing || undefined
                });
            }

            defaults.url = splunkd_utils.fullpath(model.url + "/" + encodeURIComponent(model.id), app_and_owner);
            $.extend(true, defaults, options || {});
            
            delete defaults.data.app;
            delete defaults.data.owner;
            delete defaults.data.sharing;
            
            return Backbone.sync.call(this, "read", model, defaults);
        },
        syncUpdate = function(model, options){
            var defaults = {data: {output_mode: 'json'}},
                app_and_owner = {},
                customAttrs = this.getCustomDataPayload();
            
            if (options && options.data){
                app_and_owner = $.extend(app_and_owner, { //JQuery purges undefined
                    app: options.data.app || undefined,
                    owner: options.data.owner || undefined,
                    sharing: options.data.sharing || undefined
                });
            }
            
            //append the values from the entry.content.custom model
            $.extend(true, defaults.data, customAttrs || {});

            defaults.url = splunkd_utils.fullpath(model.url + "/" + encodeURIComponent(model.id), app_and_owner);
            defaults.processData = true;
            defaults.type = 'POST';
            
            $.extend(true, defaults, options || {});
            
            delete defaults.data.app;
            delete defaults.data.owner;
            delete defaults.data.sharing;
            
            return Backbone.sync.call(this, "update", model, defaults);
        },
        syncDelete = function(model, options){
            var defaults = {data: {output_mode: 'json'}},
                url = model.url + "/" + encodeURIComponent(model.id);

            if(options.data && options.data.output_mode){
                //add layering of url if specified by user
                defaults.url = splunkd_utils.fullpath(url, {}) + '?output_mode=' + encodeURIComponent(options.data.output_mode);
                delete options.data.output_mode;
            } else {
                //add layering of url if specified by user
                defaults.url = splunkd_utils.fullpath(url, {}) + '?output_mode=' + encodeURIComponent(defaults.data.output_mode);
                delete defaults.data.output_mode;
            }
            $.extend(true, defaults, options);
            defaults.processData = true;

            return Backbone.sync.call(this, "delete", model, defaults);
        };
        
        /**
         * @constructor
         * @memberOf models
         * @name SearchJob
         * @extends {models.Base}
         *
         */
        var Model = BaseModel.extend(/** @lends models.SearchJob.prototype */{
            url: "search/jobs",
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
                
                this.initializeAssociated();
                
                this.entry.links.on("change:control", function() {
                    this.control.set('id', this.entry.links.get('control'));
                }, this);

                this.entry.links.on("change:alternate", function() {
                    var alt = this.entry.links.get('alternate');
                    if (alt) {
                        alt = alt + "/acl";
                    }
                    this.acl.set('id', alt);
                }, this);

                if (options && options.splunkDPayload){
                    this.setFromSplunkD(options.splunkDPayload, {silent: true});
                }
            },
            /**
             * @param {Object} response
             */
            parseSplunkDMessages: function(response) {
                var messages = BaseModel.prototype.parseSplunkDMessages.call(this, response);
                if(response && response.entry && response.entry.length > 0) {
                    var entry = response.entry[0],
                        content = entry.content || {};

                    messages = _.union(
                        messages,
                        splunkd_utils.parseMessagesObject(entry.messages),
                        splunkd_utils.parseMessagesObject(content.messages)
                    );
                    // handle zombie jobs, which often show up without any associated messages
                    if(content.isZombie) {
                        messages.push(splunkd_utils.createMessageObject(splunkd_utils.FATAL, 'Job terminated unexpectedly'));
                    }
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

                    this.entry.links = new RootClass.Entry.Links();
                    this.entry.associated.links = this.entry.links;

                    this.entry.acl = new RootClass.Entry.ACL();
                    this.entry.associated.acl = this.entry.acl;

                    //nested on content
                    this.entry.content = new RootClass.Entry.Content();

                    this.entry.content.performance = new RootClass.Entry.Content.Performance();
                    this.entry.content.associated.performance = this.entry.content.performance;

                    this.entry.content.request = new RootClass.Entry.Content.Request();
                    this.entry.content.associated.request = this.entry.content.request;
                    
                    this.entry.content.runtime = new RootClass.Entry.Content.Runtime();
                    this.entry.content.associated.runtime = this.entry.content.runtime;
                    
                    this.entry.content.custom = new RootClass.Entry.Content.Custom();
                    this.entry.content.associated.custom = this.entry.content.custom;
                    
                    this.entry.associated.content = this.entry.content;
                }
                this.associated.entry = this.entry;
                
                //associated EAI endpoint models
                this.control = this.control || new ControlModel();
                this.associated.control = this.control;
                
                this.acl = this.acl || new ACLModel();
                this.associated.acl = this.acl;
            },
            sync: function(method, model, options) {
                switch(method){
                    case 'create':
                        return syncCreate.call(this, model, options);
                    case 'read':
                        return syncRead.call(this, model, options);
                    case 'update':
                        return syncUpdate.call(this, model, options);
                    case 'delete':
                        return syncDelete.call(this, model, options);
                    default:
                        throw new Error('invalid method: ' + method);
                }
            },
            parse: function(response) {
                // make a defensive copy of response since we are going to modify it
                response = $.extend(true, {}, response);
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
                this.set(this.idAttribute, response_entry.content.sid);
                response.id = response_entry.content.sid;

                //top-level
                this.links.set(response.links);
                delete response.links;
                this.generator.set(response.generator);
                delete response.generator;
                this.paging.set(response.paging);
                delete response.paging;
                
                //sub-entry
                this.entry.links.set(response_entry.links);
                // in case parse happens before initialize
                if (response_entry.links.control) {
                    this.control.set('id', response_entry.links.control);
                }
                if (response_entry.links.alternate) {
                    this.acl.set('id', response_entry.links.alternate + "/acl");
                }
                delete response_entry.links;

                this.entry.acl.set(response_entry.acl);
                delete response_entry.acl;
                
                //sub-content
                this.entry.content.performance.set(response_entry.content.performance);
                delete response_entry.content.performance;
                
                this.entry.content.request.set(response_entry.content.request);
                delete response_entry.content.request;
                
                this.entry.content.runtime.set(response_entry.content.runtime);
                delete response_entry.content.runtime;
                
                this.entry.content.custom.set(response_entry.content.custom);
                delete response_entry.content.custom;
                
                //content remainder
                this.entry.content.set(response_entry.content);
                delete response_entry.content;
                
                //entry remainder
                this.entry.set(response_entry);
                delete response.entry;
                return response;
            },
            setFromSplunkD: function(payload, options) {
                this.attributes = {};
                var cloned_payload = $.extend(true, {}, payload);
                var oldId = this.id;

                //object assignment
                if (cloned_payload) {
                    if (cloned_payload.entry && cloned_payload.entry[0]) {
                        var payload_entry = cloned_payload.entry[0];

                        if(payload_entry.content){
                            //id
                            //this needs to be the first thing so that people can get !isNew()
                            this.set({id: payload_entry.content.sid}, {silent: true});
                            cloned_payload.id = payload_entry.content.sid;

                            if (payload_entry.content.performance) {
                                this.entry.content.performance.set(payload_entry.content.performance, options);
                                delete payload_entry.content.performance;
                            }

                            if (payload_entry.content.request) {
                                this.entry.content.request.set(payload_entry.content.request, options);
                                delete payload_entry.content.request;
                            }
                            
                            if (payload_entry.content.runtime) {
                                this.entry.content.runtime.set(payload_entry.content.runtime, options);
                                delete payload_entry.content.runtime;
                            }
                            
                            if (payload_entry.content.custom) {
                                this.entry.content.custom.set(payload_entry.content.custom, options);
                                delete payload_entry.content.custom;
                            }

                            this.entry.content.set(payload_entry.content, options);
                            delete payload_entry.content;
                        }

                        if(payload_entry.links){
                            this.entry.links.set(payload_entry.links, options);
                            if (payload_entry.links.control) {
                                this.control.set('id', payload_entry.links.control, options);
                            }
                            if (payload_entry.links.alternate) {
                                this.acl.set('id', payload_entry.links.alternate + "/acl", options);
                            }
                            delete payload_entry.links;
                        }

                        if(payload_entry.acl){
                            this.entry.acl.set(payload_entry.acl, options);
                            delete payload_entry.acl;
                        }
                        
                        this.entry.set(payload_entry, options);
                        delete cloned_payload.entry;
                    }
                    if(cloned_payload.links) {
                        this.links.set(cloned_payload.links, options);
                        delete cloned_payload.links;
                    }
                    if(cloned_payload.generator) {
                        this.generator.set(cloned_payload.generator, options);
                        delete cloned_payload.generator;
                    }
                    if(cloned_payload.paging) {
                        this.paging.set(cloned_payload.paging, options);
                        delete cloned_payload.paging;
                    }
                    
                    //reset the internal root model due to pre-init routine
                    this.set(cloned_payload, options);
                    if(this.id !== oldId) {
                        this.trigger('change:' + this.idAttribute);
                    }
                }
            },
            toSplunkD: function() {
                var payload = {};

                payload = $.extend(true, {}, this.toJSON());

                payload.links = $.extend(true, {}, this.links.toJSON());
                payload.generator = $.extend(true, {}, this.generator.toJSON());
                payload.paging = $.extend(true, {}, this.paging.toJSON());
                payload.entry = [$.extend(true, {}, this.entry.toJSON())];

                payload.entry[0].links = $.extend(true, {}, this.entry.links.toJSON());
                payload.entry[0].acl = $.extend(true, {}, this.entry.acl.toJSON());
                payload.entry[0].content = $.extend(true, {}, this.entry.content.toJSON());

                payload.entry[0].content.performance = $.extend(true, {}, this.entry.content.performance.toJSON());
                payload.entry[0].content.request = $.extend(true, {}, this.entry.content.request.toJSON());
                payload.entry[0].content.runtime = $.extend(true, {}, this.entry.content.runtime.toJSON());
                payload.entry[0].content.custom = $.extend(true, {}, this.entry.content.custom.toJSON());

                //cleanup
                delete payload.id;

                return payload;
            },
            getCustomDataPayload: function() {
                var payload = $.extend(true, {}, this.entry.content.custom.toJSON()),
                    keys = _.keys(payload);
                
                _.each(keys, function(key){
                    var newKey = "custom." + key;
                    payload[newKey] = payload[key];
                    delete payload[key];
                });
                
                return payload;
            },
            getCreateOptions: function(options) {
                options = options || {};
                options.data = options.data || {};

                //TODO: we have some defaults but in reality people should be responsible for passing these
                //in options.data like they are responsible for app and owner
                //Simon asks: does the endpoint set any of these defaults for us????
                var createDefaults = {
                    data: {
                        // Using `has` here enables us to override the default of `*` with undefined
                        // if we do not want to send an rf. (SPL-108504)
                        rf: _.has(options.data, 'rf') ? options.data.rf : "*",
                        auto_cancel: Model.DEFAULT_AUTO_CANCEL,
                        status_buckets: 300,
                        output_mode: 'json'
                    }
                },
                customAttrs = this.getCustomDataPayload();

                //append the values from the entry.content.custom model
                $.extend(true, createDefaults.data, customAttrs || {});
                $.extend(true, createDefaults.data, options.data);
                delete createDefaults.data.app;
                delete createDefaults.data.owner;
                delete createDefaults.data.sharing;
                
                //add the leading search command if it isn't present
                if (createDefaults.data.search) {
                    createDefaults.data.search = splunkUtil.addLeadingSearchCommand(createDefaults.data.search, true);
                }
            
                return {
                    processData: true,
                    data: createDefaults.data
                };
            }
        },
        {
            // constants for the dispatch states
            QUEUED: 'QUEUED',
            PARSING: 'PARSING',
            RUNNING: 'RUNNING',
            PAUSED: 'PAUSED',
            FINALIZING: 'FINALIZING',
            FAILED: 'FAILED',
            DONE: 'DONE',
            CANCELED: 'CANCELED',
            
            //constants for the polling and intervals
            //seconds
            DEFAULT_AUTO_CANCEL: 30,
            DEFAULT_AUTO_PAUSE: 30,
            
            getAutoPauseInterval: function(val) {
                var parsed = general_utils.parseBooleanOrInt(val);
                
                if (_.isBoolean(parsed)) {
                   if (parsed) {
                       return Model.DEFAULT_AUTO_PAUSE;
                   }
                   return 0;
                }
                
                return parsed;
            },
            
            //milliseconds
            JOB_MIN_POLLING_INTERVAL: configModel.get('JOB_MIN_POLLING_INTERVAL') || 100,
            JOB_MAX_POLLING_INTERVAL: configModel.get('JOB_MAX_POLLING_INTERVAL') || 1000,
            DEFAULT_METADATA_POLLING_INTERVAL: 3000,
            DEFAULT_LONG_POLLING_INTERVAL: 15000,

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
                    Content: BaseModel.extend(
                        {
                            initialize: function() {
                                BaseModel.prototype.initialize.apply(this, arguments);
                            }
                        }, 
                        {
                            Performance: BaseModel,
                            Request: BaseModel,
                            Runtime: BaseModel,
                            Custom: BaseModel
                        }
	                )
                }
            )
        });

        return Model;
    }
);
