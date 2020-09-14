define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'splunk.util',
        'util/splunkd_utils'
    ],
    function($, _, Backbone, BaseModel, splunkUtils, splunkDUtils) {

        // Private helper methods
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

        var makeSecondPreviewRequest = function(model, appOwner, opts, deferredResponse){
            var data = $.extend({output_mode: 'json'}, appOwner);
            var fetchDfd = model.fetch({
                data: data,
                type: 'POST',
                success: function(model, response, options) {
                    // call backbone wrapped success handler which in turn calls
                    // user-specified success callback (if any) with (model, response, options)
                    opts.success(response);
                },
                error: function(model, response, options) {
                    // call backbone wrapped error handler which in turn calls
                    // user-specified error callback (if any) with (model, response, options)
                    opts.error(response);
                }
            });
            fetchDfd.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            fetchDfd.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });
        };

        // Private sync CRUD methods
        var syncCreate = function(model, options) {
            var url, appOwner = {},
                deferredResponse = $.Deferred(),
                defaults = {
                    getSourceTypeSettings: true,
                    data: {
                        output_mode: 'json'
                    }
                };

            url = _.isFunction(model.url) ? model.url() : model.url;
            appOwner = extractAppOwner(options);
            $.extend(true, defaults, options);

            defaults.url = splunkDUtils.fullpath(url, appOwner);
            defaults.type = 'POST';
            defaults.data = splunkDUtils.normalizeValuesForPOST(defaults.data);
            defaults.data['props.NO_BINARY_CHECK'] = '1';

            if(defaults.data['job.id']){
                delete defaults.data['input.path'];
            }
            // make first request to create new preview data job with specified source file
            var createDfd = new BaseModel().save({}, {
                url: defaults.url,
                processData: true,
                type: defaults.type,
                data: defaults.data,
                success: function(createModel, response, options) {
                    var messages = response && response.messages,
                        jobId = messages && messages[0] && messages[0].text;

                    model.set('id', jobId);

                    // once created set model id and fetch preview payload
                    if (defaults.getSourceTypeSettings) {
                        makeSecondPreviewRequest(model, appOwner, defaults, deferredResponse);
                    } else {
                        deferredResponse.resolve.apply(deferredResponse); // TODO [JCS] What arguments do we pass here?
                    }

                },
                error: function(createModel, response, options) {
                    // call backbone wrapped error handler which in turn calls
                    // user-specified error callback (if any) with (model, response, options)
                    defaults.error(response);
                }
            });
            createDfd.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });

            return deferredResponse.promise();
        };


        var syncRead = function(model, options) {
            var url, appOwner = {},
                defaults = {
                    data: {
                        output_mode: 'json'
                    }
                };

            if (model.isNew()){
                throw new Error('You cannot read a Preview without an id.');
            }
            
            url = _.isFunction(model.url) ? model.url() : model.url;
            appOwner = extractAppOwner(options);
            $.extend(true, defaults, options);

            defaults.url = splunkDUtils.fullpath(url + "/" + model.id, appOwner);
            
            return Backbone.sync.call(this, "read", model, defaults);
        };

        return BaseModel.extend({
            url: 'indexing/preview',
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);

                this.initializeAssociated();
            },
            sync: function(method, model, options) {
                switch(method){
                    case 'create':
                        return syncCreate.call(this, model, options);
                    case 'read':
                        return syncRead.call(this, model, options);
                    default:
                        throw new Error('invalid method: ' + method);
                }
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
                
                //nested instance level on entry
                if (!this.entry){
                    this.entry = new RootClass.Entry();
                    $.extend(this.entry, {
                        links: new RootClass.Entry.Links(),
                        content: new RootClass.Entry.Content()
                    });
                    this.entry.associated.links = this.entry.links;
                    this.entry.associated.content = this.entry.content;
                }
                this.associated.entry = this.entry;
            },
            parse: function(response) {
                // make a defensive copy of response since we are going to modify it
                response = $.extend(true, {}, response);
                //when called from the collection fetch we will need to ensure that our
                //associated models are initialized because parse is called before
                //initialize
                this.initializeAssociated();
                
                if (!response || !response.entry || response.entry.length === 0) {
                    return;
                }
                var response_entry = response.entry[0];

                //id
                //this needs to be the first thing so that people can get !isNew()
                if (response_entry.links.alternate) {
                    this.set('id', response_entry.links.alternate);
                    response.id = response_entry.links.alternate;
                }

                //top-level
                this.links.set(response.links);
                delete response.links;
                this.generator.set(response.generator);
                delete response.generator;

                //sub-entry
                this.entry.links.set(response_entry.links);
                delete response_entry.links;
                this.entry.content.set(response_entry.content);
                delete response_entry.content;
                
                this.entry.set(response_entry);
                delete response.entry;
                return response;
            }
        },
        {
            Links: BaseModel,
            Generator: BaseModel,
            Entry: BaseModel.extend(
                {
                    initialize: function() {
                        BaseModel.prototype.initialize.apply(this, arguments);
                    }
                },
                {
                    Links: BaseModel,
                    Content: BaseModel
                }
            )
        });
    }
);