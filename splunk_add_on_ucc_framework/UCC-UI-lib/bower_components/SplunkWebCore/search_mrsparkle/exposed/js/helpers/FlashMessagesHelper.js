define(
    [
        'jquery',
        'underscore',
        'models/shared/FlashMessage',
        'util/splunkd_utils'
    ],
    function($, _, FlashMessageModel, splunkDUtils) {

        /**
         * @param flashMessagesCollection - the collection to use as the target for messages
         * @param options {Object} {
         *     removeDuplicates {Boolean} - (optional) whether to dedup messages with the same content, defaults to false
         *     postProcess {Function} - (optional) a function to perform cleanup of the messages before they are placed in the collection
         *         the list of FlashMessage models will be passed as the only argument (duplicates will already be removed if enabled)
         *         the return value will become the contents of the FlashMessages collection
         * }
         * @constructor
         */

        var FlashMessagesHelper = function(flashMessagesCollection, options) {
            this.options = options || {};
            this.defaults = $.extend(true, {}, this.options);

            _.defaults(this.defaults, {
                removeDuplicates: true,
                removeServerPrefix: false
            });

            if (_.isUndefined(flashMessagesCollection)) {
                throw "FlashMessagesHelper must be created with a valid FlashMessages collection";
            }
            this.flashMessagesCollection = flashMessagesCollection;
            // registered is a dictionary, indexed by model/collection cid
            // each entry is an object containing the model/collection itself,
            //      and (optionally) a whitelist of message types to broadcast
            this.registered = {};
            this.clientModelMessages = {};
            this.serverModelMessages = {};
            this.generalMessages = {};
        };

        FlashMessagesHelper.prototype = {
            // whitelist is optional, it should be a list of message types that should be broadcasted
            // if whitelist is omitted, all messages will be broadcasted
            register: function(obj, whitelist) {
                this.registered[obj.cid] = { instance: obj };
                if(whitelist) {
                    this.registered[obj.cid]['whitelist'] = _(whitelist).isArray() ? whitelist : [whitelist];
                }
                obj.on('serverValidated', _.debounce(this.serverValidationHandler, 0), this);
                obj.on("validated", _.debounce(this.clientValidationHandler, 0), this);
            },
            unregister: function(obj) {
                obj.off(null, null, this);
                delete this.clientModelMessages[obj.cid];
                delete this.serverModelMessages[obj.cid];
                delete this.registered[obj.cid];
            },
            destroy: function() {
                var registeredObjects = _(this.registered).pluck('instance');
                _(registeredObjects).each(function(obj) { this.unregister(obj); }, this);
            },
            clientValidationHandler: function(isValid, model, invalidAttrs) {
                this.clientModelMessages[model.cid] = invalidAttrs;
                this.updateFlashMessageCollection();
            },
            serverValidationHandler: function(isValid, model, messages) {
                this.serverModelMessages[model.cid] = messages;
                this.updateFlashMessageCollection();
            },
            /**
             * Manually add a message to the Flash Messages Collection. Use this if you want to display a message
             * that isn't associated with a model
             *
             * @param id - the caller must generate a unique ID for the message
             * @param message
             *              - type {string} The type of message (splunkDUtils.ERROR | splunkDUtils.WARNING | splunkDUtils.INFO)
             *              - html {string} The message text
             */
            addGeneralMessage: function(id, message) {
                this.generalMessages[id] = message;
                this.updateFlashMessageCollection();
            },
            /**
             * Remove a message from the Flash Messages Collection that was previously added via addMessage.
             *
             * @param id - the caller generated id used in the addMessage call
             */
            removeGeneralMessage: function(id) {
                if (_(this.generalMessages).has(id)) {
                    delete this.generalMessages[id];
                    this.updateFlashMessageCollection();
                }
            },

            /**
             * Returns the number of general messages
             *
             * @return {Number}
             */
            getGeneralMessagesSize: function() {
                return _(this.generalMessages).size();
            },

            /**
             * Returns the number of client validation messages
             *
             * @return {Number}
             */
            getClientModelMessagesSize: function() {
                return _(this.clientModelMessages).size();
            },

            /**
             * Returns the number of server messages
             *
             * @return {Number}
             */
            getServerModelMessagesSize: function() {
                return _(this.serverModelMessages).size();
            },

            /**
             *  Messages from splunkd usually begin with 'In handler ...:'. This method cuts it off
             * when option removeServerPrefix=true.
             */
            removeServerPrefix: function(msg) {
                if (msg.message) {
                    msg.message = msg.message.replace(/(^[\s]*In handler [^:]+:\s)/g, "");
                }
            },

            /**
             * Update the flash message collection when the clientMessages, serverMessages or generalMessages change
             */
            updateFlashMessageCollection: function() {
                var clientMessages = [], serverMessages = [], generalMessages = [];
                _(this.clientModelMessages).each(function(clientMsgs) {
                    _(clientMsgs).each(function(msg) {
                        clientMessages.push(new FlashMessageModel({ type: splunkDUtils.ERROR, html: msg }));
                    }, this);
                }, this);
                _(this.serverModelMessages).each(function(serverMsgs, cid) {
                    var whitelist = this.registered[cid] ? this.registered[cid].whitelist : null;
                    _(serverMsgs).each(function(msg) {
                        if(!whitelist || _(whitelist).contains(msg.type)) {
                            if (this.defaults.removeServerPrefix) {
                                this.removeServerPrefix(msg);
                            }
                            serverMessages.push(new FlashMessageModel({
                                type: splunkDUtils.normalizeType(msg.type),
                                // make sure to HTML-escape here, since these messages are coming from the server
                                html: _.escape(msg.message),
                                help: msg.help || ""
                            }));
                        }
                    }, this);
                }, this);
                _(this.generalMessages).each(function(msg) {
                    generalMessages.push(new FlashMessageModel({
                        type: splunkDUtils.normalizeType(msg.type),
                        html: msg.html
                    }));
                }, this);
                var allMessages = _.union(clientMessages, serverMessages, generalMessages);
                if (this.defaults.removeDuplicates) {
                    allMessages = _(allMessages).uniq(function(msg) { return msg.get('html'); });
                }
                if (this.defaults.postProcess) {
                    allMessages = this.defaults.postProcess(allMessages);
                }
                this.flashMessagesCollection.reset(allMessages);
            }
        };
    return FlashMessagesHelper;
});
