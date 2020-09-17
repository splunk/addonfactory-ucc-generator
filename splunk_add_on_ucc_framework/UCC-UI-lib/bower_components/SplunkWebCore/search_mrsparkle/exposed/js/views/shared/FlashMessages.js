define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/Base', 
        'collections/shared/FlashMessages',
        'helpers/FlashMessagesHelper',
        'module'
    ], 
    function($, _, Backbone, Base, FlashMessagesCollection, FlashMessagesHelper,module) {
        return Base.extend({
            moduleId: module.id,
            className: 'alerts',
            collectionLength: 0,
           /**
            * @param {Object} options {
            *     model: {
            *         <name>: <model to be registered>
            *         ....
            *     },
            *     collection: {
            *         <name>: <collection to be registered>
            *         ....
            *     }
            * }
            */
            initialize: function(options){
                Base.prototype.initialize.call(this, options);

                this.flashMsgCollection = new FlashMessagesCollection();
                this.flashMsgHelper     = new FlashMessagesHelper(this.flashMsgCollection, this.options.helperOptions);
                
                this.activate({skipRender: true});

                // SPL-70327, put ourselves to sleep before the window unloads
                // this avoids rendering messages from the XHRs that are cancelled by the browser
                this.beforeUnloadHandler = _(function() { this.sleep(); }).bind(this);
                $(window).on('beforeunload', this.beforeUnloadHandler);
            },
            startListening: function() {
                this.listenTo(this.flashMsgCollection, 'add remove reset', this.onCollectionChange);
            },
            activate: function(options) {
                options = options || {};
                
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                
                if (this.model instanceof Backbone.Model){
                    this.flashMsgHelper.register(this.model, this.options.whitelist);
                    
                    //see if we already have errors in the model.error
                    if (this.model.error && this.model.error.get("messages")){
                        this.flashMsgHelper.serverValidationHandler(true, this.model, this.model.error.get("messages"));
                    }
                    
                    //see if we already have validation errors
                    if (this.model.validationError) {
                        this.flashMsgHelper.clientValidationHandler(false, this.model, this.model.validationError);
                    }
                } else {
                    _(this.model).each(function(model, k) {
                        this.flashMsgHelper.register(model, this.options.whitelist);
                        
                        //see if we already have errors in the model.error
                        if (model.error && model.error.get("messages")){
                            this.flashMsgHelper.serverValidationHandler(true, model, model.error.get("messages"));
                        }
                        
                        //see if we already have validation errors
                        if (model.validationError) {
                            this.flashMsgHelper.clientValidationHandler(false, model, model.validationError);
                        }
                    },this);
                }
                
                if (this.collection instanceof Backbone.Collection) {
                    this.flashMsgHelper.register(this.collection, this.options.whitelist);
                    this.collection.each(function(model){
                        this.flashMsgHelper.register(model, this.options.whitelist);
                    },this);
                } else {
                    _(this.collection).each(function(collection){
                        this.flashMsgHelper.register(collection, this.options.whitelist);
                        collection.each(function(model){
                            this.flashMsgHelper.register(model, this.options.whitelist);
                        },this);
                    },this);
                }
                
                if (!options.skipRender) {
                    this.render();
                }
                
                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                this.flashMsgCollection.reset();
                Base.prototype.deactivate.apply(this, arguments);
                                
                if (this.model instanceof Backbone.Model){
                    this.flashMsgHelper.unregister(this.model);
                } else {
                    _(this.model).each(function(model, k) {
                        this.flashMsgHelper.unregister(model);
                    },this);
                }
                
                if (this.collection instanceof Backbone.Collection) {
                    this.flashMsgHelper.unregister(this.collection);
                    this.collection.each(function(model){
                        this.flashMsgHelper.unregister(model);
                    },this);
                } else {
                    _(this.collection).each(function(collection){
                        this.flashMsgHelper.unregister(collection);
                        collection.each(function(model){
                            this.flashMsgHelper.unregister(model);
                        },this);
                    },this);
                }
                return this;
            },
            /**
             * Listen to validation events from a given object
             *
             * @param obj - the object to listen on
             * @param whitelist (optional) - the array of event types to listen for. If ommitted, then we listen to all events
             */
            register: function(obj, whitelist) {
                this.flashMsgHelper.register(obj, whitelist);
            },
            /**
             * Stop listening to validation events from a given object
             *
             * @param obj - the object to stop listen to
             */
            unregister: function(obj) {
                this.flashMsgHelper.unregister(obj);
            },
            remove: function() {
                this.flashMsgHelper.destroy();
                $(window).off('beforeunload', this.beforeUnloadHandler);
                return Base.prototype.remove.apply(this, arguments);
            },
            onCollectionChange: function() {
                if (this.collectionLength != this.flashMsgCollection.length) {
                    // Trigger change if the number of messages has changed
                    this.trigger("change", this);
                    this.collectionLength = this.flashMsgCollection.length;
                }
                this.render();
            },
            render: function() {
                this.$el.empty();
                
                this.$el.append(this.compiledTemplate({
                    flashMessages: this.flashMsgCollection
                }));
                (!this.flashMsgCollection.length) ? this.$el.hide() : this.$el.show();
                return this;
            },
            template: '\
                <% flashMessages.each(function(flashMessage){ %> \
                    <div class="alert alert-<%- flashMessage.get("type") %>">\
                        <i class="icon-alert"></i>\
                        <%= flashMessage.get("html") %>\
                    </div>\
                <% }); %> \
            '
        });
    }
);
